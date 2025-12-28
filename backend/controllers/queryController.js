const { pgPool } = require('../config/db');
const path = require('path');
const sampleData = require(path.join(__dirname, '..', 'data', 'sampleData'));

// Execute a read-only SQL query coming from the frontend and run simple tests.
// Expects body: { sql: "SELECT ...", assignmentId: string }
exports.runQuery = async (req, res) => {
  const { sql, assignmentId } = req.body;

  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'Missing `sql` in request body.' });
  }

  // Find tests for assignment (from DB or sampleData fallback)
  let tests = [];
  try {
    if (assignmentId) {
      const Assignment = require('../models/Assignment');
      const fromDb = assignmentId.startsWith('seed-') || assignmentId.startsWith('local-') ? null : await Assignment.findById(assignmentId);
      if (fromDb && fromDb.tests) tests = fromDb.tests;
      if (!tests || tests.length === 0) {
        const local = sampleData.find((s, idx) => s._id === assignmentId || s._id === `local-${idx + 1}` || (s.title && s.title.includes(String(assignmentId))));
        if (local && local.tests) tests = local.tests;
      }
    }
  } catch (e) {
    // ignore and continue without tests
  }

  const cleaned = sql.trim().toLowerCase();

  // Enforce read-only single SELECT statement to reduce risk
  if (!cleaned.startsWith('select')) {
    return res.status(403).json({ error: 'Only single SELECT queries are allowed.' });
  }

  // Prevent multiple statements chaining with semicolons
  if (cleaned.includes(';')) {
    return res.status(403).json({ error: 'Multiple statements are not allowed.' });
  }

  // Helpers to canonicalize rows for order-insensitive comparison
  const canonicalizeRow = (row) => {
    if (row === null || row === undefined) return JSON.stringify(row);
    const keys = Object.keys(row).sort();
    const obj = {};
    keys.forEach(k => { obj[k] = row[k]; });
    return JSON.stringify(obj);
  };

  const canonicalizeRows = (rows) => {
    return rows.map(r => canonicalizeRow(r)).sort();
  };

  // Run simple keyword-based tests if available (defer expectedResult until after execution)
  const failedTests = [];
  let expectedResultTest = null;
  if (tests && tests.length > 0) {
    const lowerSql = cleaned;
    tests.forEach((t, idx) => {
      if (t.type === 'mustContain') {
        const ok = t.keywords.every(k => lowerSql.includes(k.toLowerCase()));
        if (!ok) {
          // Suggestion generation for common keyword misses
          const keys = t.keywords.map(k => k.toLowerCase()).join(' ');
          let suggestion = 'Ensure your query uses the required keywords.';
          if (keys.includes('group by')) suggestion = 'Try using aggregation with GROUP BY and ensure selected columns are aggregated or grouped.';
          else if (keys.includes('over')) suggestion = 'Consider using a window function with OVER(...) for partitioned calculations.';
          else if (keys.includes('join')) suggestion = 'Consider joining tables with proper ON conditions to combine rows.';
          else if (keys.includes('select')) suggestion = 'Start with SELECT and include required columns in the projection.';

          failedTests.push({ idx, type: 'mustContain', reason: `Missing keywords: ${t.keywords.join(', ')}`, suggestion });
        }
      }
      if (t.type === 'expectedResult') {
        expectedResultTest = t;
      }
    });
  }

  try {
    const result = await pgPool.query(sql).catch(e => ({ error: e }));

    const execError = result && result.error;
    const fields = (result && result.fields) ? result.fields.map(f => f.name) : [];
    const rows = result && result.rows ? result.rows : [];

    if (execError) {
      return res.status(400).json({ error: execError.message || String(execError) });
    }

    // If there is an expectedResult test, compare actual rows to expected rows
    if (expectedResultTest) {
      const expectedFields = expectedResultTest.expectedFields || [];
      const expectedRows = expectedResultTest.expectedRows || [];

      const actualCanonical = canonicalizeRows(rows.map(r => {
        // pick only expected fields (if provided)
        if (expectedFields.length > 0) {
          const pick = {};
          expectedFields.forEach(f => { pick[f] = r[f]; });
          return pick;
        }
        return r;
      }));

      const expectedCanonical = canonicalizeRows(expectedRows);

      const match = actualCanonical.length === expectedCanonical.length && actualCanonical.every((v, i) => v === expectedCanonical[i]);

      if (!match) {
        failedTests.push({ type: 'expectedResult', reason: 'Result rows did not match expected rows', expected: expectedRows, actual: rows });
      }
    }

    if (failedTests.length > 0) {
      return res.json({ accepted: false, message: 'Wrong answer', failedTests, rows, fields });
    }

    // passed tests (or no tests defined)
    return res.json({ accepted: true, message: 'Accepted', rows, fields });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};