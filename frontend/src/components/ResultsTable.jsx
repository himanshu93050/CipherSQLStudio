import React, { useState, useEffect } from 'react';

export default function ResultsTable({ results, loading }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (results && typeof results.accepted !== 'undefined') {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 700);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [results && results.accepted]);

  if (loading) return <div className="p-10 text-center text-slate-500">Executing...</div>;
  if (!results) return <div className="p-10 text-center text-slate-500 italic text-sm">Query results will appear here</div>;

  const renderBadge = () => {
    if (results.error) return <div className="p-3 text-red-300">Error: {results.error}</div>;

    const accepted = results.accepted === true;
    const base = 'inline-block px-3 py-1 rounded text-sm font-bold transition-transform duration-300';
    const color = accepted ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white';
    const ring = animate ? (accepted ? 'scale-105 ring-4 ring-emerald-500/30' : 'scale-105 ring-4 ring-rose-500/30') : 'scale-100';

    if (typeof results.accepted === 'boolean') {
      return <div className={`${base} ${color} ${ring}`}>{accepted ? 'Accepted' : 'Wrong Answer'}</div>;
    }
    return null;
  };

  const renderFailedTests = () => {
    if (!results.failedTests || results.failedTests.length === 0) return null;
    return (
      <div className="mt-3 bg-slate-800 p-3 rounded border border-slate-700 text-sm text-slate-300">
        <div className="font-semibold mb-2">Failed Tests</div>
        {results.failedTests.map((t, i) => (
          <div key={i} className="mb-3">
            <div className="text-xs text-rose-300 font-medium">{t.type || 'test'}: {t.reason}</div>
            {t.suggestion && <div className="mt-1 text-xs text-yellow-300">Hint: {t.suggestion}</div>}
            {t.expectedRows && (
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400">Expected Rows</div>
                  <pre className="text-xs bg-slate-900 p-2 rounded text-slate-200 overflow-auto">{JSON.stringify(t.expectedRows, null, 2)}</pre>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Actual Rows</div>
                  <pre className="text-xs bg-slate-900 p-2 rounded text-slate-200 overflow-auto">{JSON.stringify(results.rows || [], null, 2)}</pre>
                </div>
              </div>
            )}
            {t.expected && (
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400">Expected</div>
                  <pre className="text-xs bg-slate-900 p-2 rounded text-slate-200 overflow-auto">{JSON.stringify(t.expected, null, 2)}</pre>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Actual</div>
                  <pre className="text-xs bg-slate-900 p-2 rounded text-slate-200 overflow-auto">{JSON.stringify(results.rows || [], null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-4 bg-slate-900">
      <div className="mb-3 flex items-center gap-3">
        {renderBadge()}
        {results.message && <div className="text-slate-300">{results.message}</div>}
      </div>
      {renderFailedTests()}

      {results.fields && results.fields.length > 0 ? (
        <table className="w-full border-collapse text-left text-xs sm:text-sm mt-4">
          <thead className="sticky top-0 bg-slate-800 text-slate-300">
            <tr>
              {results.fields.map(field => (
                <th key={field} className="p-3 border border-slate-700 font-mono">{field}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {results.rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/50">
                {results.fields.map((f, j) => (
                  <td key={j} className="p-3 border border-slate-800 text-slate-400">{String(row[f])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-6 text-slate-500 italic">No result rows to display.</div>
      )}
    </div>
  );
}