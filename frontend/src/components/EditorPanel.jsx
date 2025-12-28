import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Play, Lightbulb } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://cipher-sql-studio.vercel.app/api';

export default function EditorPanel({ assignment, setResults, setLoading }) {
  const [code, setCode] = useState('-- Write your SQL query here\nSELECT * FROM ');
  const [hint, setHint] = useState('');

  const handleExecute = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/execute-query`, { sql: code, assignmentId: assignment?._id });
      // res.data may contain { accepted, message, rows, fields, failedTests }
      setResults(res.data);
    } catch (err) {
      setResults({ error: err.response?.data?.error || 'Execution Error' });
    } finally { setLoading(false); }
  };

  const handleHint = async () => {
    try {
      const res = await axios.post(`${API_URL}/get-hint`, {
        problemStatement: assignment.problemStatement,
        userQuery: code
      });
      setHint(res.data.hint);
    } catch (err) { alert("Could not fetch hint"); }
  };

  return (
    <div className="h-2/3 flex flex-col border-b border-slate-700">
      <div className="flex-1">
        <Editor
          theme="vs-dark"
          defaultLanguage="sql"
          value={code}
          onChange={setCode}
          options={{ minimap: { enabled: false }, fontSize: 14 }}
        />
      </div>
      <div className="p-3 bg-slate-800 flex items-center gap-3">
        <button onClick={handleExecute} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold transition">
          <Play size={16} /> Run Query
        </button>
        <button onClick={handleHint} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-bold transition">
          <Lightbulb size={16} /> Get Hint
        </button>
        {hint && <div className="text-sm text-yellow-400 italic animate-pulse">Hint: {hint}</div>}
      </div>
    </div>
  );
}