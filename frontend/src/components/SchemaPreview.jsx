import React from 'react';
import { Table as TableIcon } from 'lucide-react';

export default function SchemaPreview({ tables = [] }) {
  return (
    <section className="pt-4 border-t border-slate-700">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <TableIcon size={16} /> Database Schema
      </h3>
      <div className="space-y-4">
        {tables.map((table, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="text-blue-400 font-mono text-sm font-bold mb-2">
              {table.tableName}
            </div>
            <div className="flex flex-wrap gap-2">
              {table.columns.map((col, cIdx) => (
                <span key={cIdx} className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-600">
                  {col}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}