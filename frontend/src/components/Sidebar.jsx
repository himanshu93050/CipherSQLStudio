import React from 'react';
import { Database, ChevronRight } from 'lucide-react';

export default function Sidebar({ assignments, selectedId, onSelect }) {
  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col hidden md:flex">
      <div className="p-4 border-b border-slate-700 flex items-center gap-2 font-bold text-blue-400">
        <Database size={20} />
        <span>Assignments</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {assignments.map((assignment) => (
          <button
            key={assignment._id}
            onClick={() => onSelect(assignment._id)}
            className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center justify-between group ${
              selectedId === assignment._id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="truncate pr-2">{assignment.title}</span>
            <ChevronRight size={14} className={selectedId === assignment._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
          </button>
        ))}
      </nav>
    </aside>
  );
}