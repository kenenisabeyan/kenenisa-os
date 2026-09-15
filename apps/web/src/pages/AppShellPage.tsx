import React from 'react';
import { useAuth } from '../features/auth/useAuth.js';
import { useNavigate, NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { WorkstreamsPage } from './WorkstreamsPage.js';
import { GoalsPage } from './GoalsPage.js';
import { ProjectsPage } from './ProjectsPage.js';
import { MilestonesPage } from './MilestonesPage.js';
import { TasksPage } from './TasksPage.js';
import { DashboardPage } from './DashboardPage.js';
import { PlanningPage } from './PlanningPage.js';
import { LearningPage } from './LearningPage.js';
import { SkillsPage } from './SkillsPage.js';
import { EvidencePage } from './EvidencePage.js';
import { ReviewsPage } from './ReviewsPage.js';
import { AnalyticsPage } from './AnalyticsPage.js';

export const AppShellPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    await navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Command Center', path: '/app/dashboard' },
    { label: 'Analytics', path: '/app/analytics' },
    { label: 'Planning', path: '/app/planning' },
    { label: 'Learning', path: '/app/learning' },
    { label: 'Skills', path: '/app/skills' },
    { label: 'Evidence', path: '/app/evidence' },
    { label: 'Reviews', path: '/app/reviews' },
    { label: 'Workstreams', path: '/app/workstreams' },
    { label: 'Goals', path: '/app/goals' },
    { label: 'Projects', path: '/app/projects' },
    { label: 'Milestones', path: '/app/milestones' },
    { label: 'Tasks', path: '/app/tasks' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
              K
            </div>
            <span className="font-bold tracking-tight text-white hidden sm:inline">KENENISA OS</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase tracking-wider">
              {user?.role || 'OWNER'}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-slate-200">{user?.displayName}</div>
            <div className="text-xs text-slate-400">{user?.email}</div>
          </div>

          <button
            id="auth-logout-btn"
            onClick={() => {
              void handleLogout();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all duration-150 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Router */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <Routes>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="planning/*" element={<PlanningPage />} />
          <Route path="learning" element={<LearningPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="evidence" element={<EvidencePage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="workstreams" element={<WorkstreamsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="milestones" element={<MilestonesPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />

          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};
