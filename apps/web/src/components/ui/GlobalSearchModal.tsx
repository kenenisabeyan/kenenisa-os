import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  category: 'Command Center' | 'Execution' | 'Planning' | 'Evidence' | 'Learning' | 'Opportunities' | 'Intelligence';
  title: string;
  subtitle: string;
  path: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: '1', category: 'Command Center', title: 'Command Center', subtitle: 'Personal operating surface, deterministic next best action, active focus', path: '/app/dashboard' },
  { id: '2', category: 'Command Center', title: 'Executive Overview', subtitle: 'Strategic direction, high-level metrics and multi-horizon health', path: '/app/executive' },
  { id: '3', category: 'Command Center', title: 'Work Intelligence', subtitle: 'Algorithmic prioritization scoring and bottleneck detection', path: '/app/work-intelligence' },
  { id: '4', category: 'Execution', title: 'Tasks', subtitle: 'Executable candidate pool, priority P0-P3, dependencies, status updates', path: '/app/tasks' },
  { id: '5', category: 'Execution', title: 'Projects', subtitle: 'Active build projects, milestones, target dates and deliverables', path: '/app/projects' },
  { id: '6', category: 'Planning', title: 'Multi-Horizon Planning', subtitle: 'Yearly, Monthly, Weekly, and Daily plan outcomes and time blocks', path: '/app/planning' },
  { id: '7', category: 'Evidence', title: 'Evidence Vault', subtitle: 'Verifiable execution proof, git commits, test runs, log evidence', path: '/app/evidence' },
  { id: '8', category: 'Evidence', title: 'Results & Insights Workspace', subtitle: 'Factual outcome history, expected vs actual, Excel spreadsheet & export', path: '/app/results' },
  { id: '9', category: 'Evidence', title: 'Weekly Reviews', subtitle: 'Structured weekly reflections, objective state analysis, next best plan', path: '/app/reviews' },
  { id: '10', category: 'Learning', title: 'Learning & Study', subtitle: 'Academic paper study, linear algebra, AI engineering foundations', path: '/app/learning' },
  { id: '11', category: 'Learning', title: 'Skill Matrix', subtitle: 'Technical skill tracking, proficiency levels, domain mastery', path: '/app/skills' },
  { id: '12', category: 'Opportunities', title: 'Opportunities', subtitle: 'Career targets, high-impact roles, engineering opportunities', path: '/app/opportunities' },
  { id: '13', category: 'Intelligence', title: 'Intelligence Core', subtitle: 'Deterministic domain intelligence context and safe advisory', path: '/app/intelligence' },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const filtered = SEARCH_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-24 p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col transform transition-all">
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/90 flex items-center gap-2.5 sm:gap-3 bg-slate-50/50">
          <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, projects, plans, evidence..."
            className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1">
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-200/80 text-slate-600 hover:bg-slate-300 transition-colors text-xs font-bold shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Search Results list */}
        <div className="max-h-[50vh] overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              No matching operating surfaces found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.path)}
                className="w-full p-3 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-blue-50/40 text-left flex items-center justify-between gap-3 transition-all group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate">{item.subtitle}</p>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
          <span>Navigate with search query or click any operating surface</span>
          <span className="font-mono text-[10px] text-slate-400">KENENISA OS v1.0</span>
        </div>
      </div>
    </div>
  );
};
