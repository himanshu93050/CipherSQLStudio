const express = require('express');
const router = express.Router();
const { runQuery } = require('../controllers/queryController');
const { getSqlHint } = require('../controllers/hintController');
const Assignment = require('../models/Assignment');
const path = require('path');
const sampleData = require(path.join(__dirname, '..', 'data', 'sampleData'));

// Get all assignments for the Listing Page [cite: 13, 14]
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find();
    if (assignments && assignments.length > 0) return res.json(assignments);

    // If DB is empty, return seed sample data so frontend has something to display.
    const fallback = sampleData.map((a, i) => ({ ...a, _id: `seed-${i}` }));
    return res.json(fallback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Execute SQL Query [cite: 24, 25]
router.post('/execute-query', runQuery);

// Get Intelligent Hint [cite: 23, 46]
router.post('/get-hint', getSqlHint);

module.exports = router;