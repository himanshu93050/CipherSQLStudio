import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import EditorPanel from './components/EditorPanel';
import ResultsTable from './components/ResultsTable';
import SchemaPreview from './components/SchemaPreview';

const API_URL = import.meta.env.VITE_API_URL || 'https://cipher-sql-studio.vercel.app/api';

export default function App() {
  const [assignments, setAssignments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate 90 fallback assignments locally (30 Easy, 30 Medium, 30 Hard)
    const difficulties = Array.from({ length: 90 }, (_, i) => {
      const idx = i + 1;
      if (idx <= 30) return 'Easy';
      if (idx <= 60) return 'Medium';
      return 'Hard';
    });

    const commonTables = [
      { tableName: 'employees', columns: ['id', 'name', 'salary', 'dept_id'] },
      { tableName: 'departments', columns: ['id', 'dept_name', 'location'] },
      { tableName: 'orders', columns: ['id', 'customer_id', 'order_date', 'total'] },
      { tableName: 'customers', columns: ['id', 'first_name', 'last_name', 'email'] },
      { tableName: 'products', columns: ['id', 'name', 'price', 'category'] }
    ];

    const sampleFallback = [];
    for (let i = 1; i <= 90; i++) {
      const diff = difficulties[i - 1];
      const title = `Question ${i}: ${diff} SQL Challenge`;
      const description = `Practice problem #${i} — a ${diff.toLowerCase()} SQL exercise.`;
      const problemStatement = `Write a SQL query to solve problem #${i}. This is a ${diff.toLowerCase()} level task.`;
      const tables = [commonTables[i % commonTables.length], commonTables[(i + 1) % commonTables.length]];

      sampleFallback.push({
        _id: `local-${i}`,
        title,
        difficulty: diff,
        description,
        problemStatement,
        sampleInput: `-- Sample tables: ${tables.map(t => t.tableName).join(', ')}\n-- Assume these tables contain realistic rows for the exercise.`,
        sampleOutput: (function(){
          if (tables[0].tableName === 'departments') return "id | dept_name\n1  | HR\n2  | Engineering";
          if (tables[0].tableName === 'employees') return "id | name | salary\n1  | Alice | 70000\n2  | Bob | 55000";
          if (tables[0].tableName === 'orders') return "id | customer_id | total\n1  | 1 | 100.00\n2  | 2 | 250.50";
          if (tables[0].tableName === 'customers') return "id | first_name | last_name\n1  | John | Doe\n2  | Jane | Smith";
          return "id | name | price\n1  | Widget | 9.99\n2  | Gadget | 19.95";
        })(),
        sampleData: tables,
        hintPrompt: diff === 'Easy' ? 'Try a simple SELECT/WHERE.' : diff === 'Medium' ? 'Consider JOINs or GROUP BY.' : 'Consider subqueries or window functions.'
      });
    }

    axios.get(`${API_URL}/assignments`).then(res => {
      const data = res.data || [];
      if (data.length > 0) {
        setAssignments(data);
        setSelectedId(data[0]._id);
      } else {
        setAssignments(sampleFallback);
        setSelectedId(sampleFallback[0]._id);
      }
    }).catch(() => {
      setAssignments(sampleFallback);
      setSelectedId(sampleFallback[0]._id);
    });
  }, []);

  const currentAssignment = assignments.find(a => a._id === selectedId);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <Sidebar 
        assignments={assignments} 
        selectedId={selectedId} 
        onSelect={setSelectedId} 
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-700 flex items-center px-6 justify-between bg-slate-800">
          <h1 className="font-bold text-lg tracking-tight">Cipher<span className="text-blue-400">SQL</span>Studio</h1>
          <div className="text-xs text-slate-400 uppercase tracking-widest">Workspace</div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Instructions */}
          <div className="w-full lg:w-1/3 p-6 overflow-y-auto border-r border-slate-700 space-y-6">
            {currentAssignment ? (
              <>
                <section>
                  <h2 className="text-xl font-bold mb-2">{currentAssignment.title}</h2>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    currentAssignment.difficulty === 'Easy' ? 'bg-green-900 text-green-300' : 'bg-orange-900 text-orange-300'
                  }`}>
                    {currentAssignment.difficulty}
                  </span>
                  <p className="mt-4 text-slate-300 leading-relaxed">{currentAssignment.description}</p>
                  {currentAssignment.problemStatement && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-slate-400">Problem Statement</h3>
                      <p className="mt-2 text-slate-200 leading-relaxed">{currentAssignment.problemStatement}</p>
                    </div>
                  )}
                  {currentAssignment.sampleInput && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-slate-400">Sample Input</h3>
                      <pre className="bg-slate-900 p-3 rounded text-sm mt-2 text-slate-200 overflow-x-auto">{currentAssignment.sampleInput}</pre>
                    </div>
                  )}
                  {currentAssignment.sampleOutput && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-slate-400">Sample Output</h3>
                      <pre className="bg-slate-900 p-3 rounded text-sm mt-2 text-slate-200 overflow-x-auto">{currentAssignment.sampleOutput}</pre>
                    </div>
                  )}
                </section>
                <SchemaPreview tables={currentAssignment.sampleData} />
              </>
            ) : <p>Select an assignment to begin.</p>}
          </div>

          {/* Right: Code & Results */}
          <div className="flex-1 flex flex-col min-w-0">
            <EditorPanel 
              assignment={currentAssignment} 
              setResults={setResults} 
              setLoading={setLoading}
            />
            <ResultsTable results={results} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}