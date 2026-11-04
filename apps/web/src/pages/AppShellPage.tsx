import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.js';
import { RouteSuspenseFallback } from '../components/layout/RouteSuspenseFallback.js';
import { RouteProfiler } from '../components/performance/RouteProfiler.js';

// Lazy-loaded route components for high-speed code-splitting & instant sidebar transitions
const DashboardPage = lazy(() => import('./DashboardPage.js').then((m) => ({ default: m.DashboardPage })));
const GraduationPage = lazy(() => import('./GraduationPage.js').then((m) => ({ default: m.GraduationPage })));
const AcademicsPage = lazy(() => import('./AcademicsPage.js').then((m) => ({ default: m.AcademicsPage })));
const IntegrationsPage = lazy(() => import('./IntegrationsPage.js').then((m) => ({ default: m.IntegrationsPage })));
const ExecutivePage = lazy(() => import('./ExecutivePage.js').then((m) => ({ default: m.ExecutivePage })));
const WorkIntelligencePage = lazy(() => import('./WorkIntelligencePage.js').then((m) => ({ default: m.WorkIntelligencePage })));
const IntelligencePage = lazy(() => import('./IntelligencePage.js').then((m) => ({ default: m.IntelligencePage })));
const AnalyticsPage = lazy(() => import('./AnalyticsPage.js').then((m) => ({ default: m.AnalyticsPage })));
const CareerPage = lazy(() => import('./CareerPage.js').then((m) => ({ default: m.CareerPage })));
const SettingsPage = lazy(() => import('./SettingsPage.js').then((m) => ({ default: m.SettingsPage })));
const OpportunitiesPage = lazy(() => import('./OpportunitiesPage.js').then((m) => ({ default: m.OpportunitiesPage })));
const OpportunityDetailPage = lazy(() => import('./OpportunityDetailPage.js').then((m) => ({ default: m.OpportunityDetailPage })));
const PlanningPage = lazy(() => import('./PlanningPage.js').then((m) => ({ default: m.PlanningPage })));
const LearningPage = lazy(() => import('./LearningPage.js').then((m) => ({ default: m.LearningPage })));
const SkillsPage = lazy(() => import('./SkillsPage.js').then((m) => ({ default: m.SkillsPage })));
const EvidencePage = lazy(() => import('./EvidencePage.js').then((m) => ({ default: m.EvidencePage })));
const ResultsPage = lazy(() => import('./ResultsPage.js').then((m) => ({ default: m.ResultsPage })));
const ReviewsPage = lazy(() => import('./ReviewsPage.js').then((m) => ({ default: m.ReviewsPage })));
const WorkstreamsPage = lazy(() => import('./WorkstreamsPage.js').then((m) => ({ default: m.WorkstreamsPage })));
const GoalsPage = lazy(() => import('./GoalsPage.js').then((m) => ({ default: m.GoalsPage })));
const ProjectsPage = lazy(() => import('./ProjectsPage.js').then((m) => ({ default: m.ProjectsPage })));
const MilestonesPage = lazy(() => import('./MilestonesPage.js').then((m) => ({ default: m.MilestonesPage })));
const TasksPage = lazy(() => import('./TasksPage.js').then((m) => ({ default: m.TasksPage })));
const NotFoundPage = lazy(() => import('./NotFoundPage.js').then((m) => ({ default: m.NotFoundPage })));

export const AppShellPage: React.FC = () => {
  return (
    <AppLayout>
      <Suspense fallback={<RouteSuspenseFallback />}>
        <Routes>
          <Route path="dashboard" element={<RouteProfiler id="/app/dashboard"><DashboardPage /></RouteProfiler>} />
          <Route path="graduation" element={<RouteProfiler id="/app/graduation"><GraduationPage /></RouteProfiler>} />
          <Route path="academics" element={<RouteProfiler id="/app/academics"><AcademicsPage /></RouteProfiler>} />
          <Route path="integrations" element={<RouteProfiler id="/app/integrations"><IntegrationsPage /></RouteProfiler>} />
          <Route path="executive" element={<RouteProfiler id="/app/executive"><ExecutivePage /></RouteProfiler>} />
          <Route path="work-intelligence" element={<RouteProfiler id="/app/work-intelligence"><WorkIntelligencePage /></RouteProfiler>} />
          <Route path="intelligence" element={<RouteProfiler id="/app/intelligence"><IntelligencePage /></RouteProfiler>} />
          <Route path="analytics" element={<RouteProfiler id="/app/analytics"><AnalyticsPage /></RouteProfiler>} />
          <Route path="career" element={<RouteProfiler id="/app/career"><CareerPage /></RouteProfiler>} />
          <Route path="settings" element={<RouteProfiler id="/app/settings"><SettingsPage /></RouteProfiler>} />
          <Route path="opportunities" element={<RouteProfiler id="/app/opportunities"><OpportunitiesPage /></RouteProfiler>} />
          <Route path="opportunities/:id" element={<RouteProfiler id="/app/opportunities/detail"><OpportunityDetailPage /></RouteProfiler>} />
          <Route path="planning/*" element={<RouteProfiler id="/app/planning"><PlanningPage /></RouteProfiler>} />
          <Route path="learning" element={<RouteProfiler id="/app/learning"><LearningPage /></RouteProfiler>} />
          <Route path="skills" element={<RouteProfiler id="/app/skills"><SkillsPage /></RouteProfiler>} />
          <Route path="evidence" element={<RouteProfiler id="/app/evidence"><EvidencePage /></RouteProfiler>} />
          <Route path="results" element={<RouteProfiler id="/app/results"><ResultsPage /></RouteProfiler>} />
          <Route path="reviews" element={<RouteProfiler id="/app/reviews"><ReviewsPage /></RouteProfiler>} />
          <Route path="workstreams" element={<RouteProfiler id="/app/workstreams"><WorkstreamsPage /></RouteProfiler>} />
          <Route path="goals" element={<RouteProfiler id="/app/goals"><GoalsPage /></RouteProfiler>} />
          <Route path="projects" element={<RouteProfiler id="/app/projects"><ProjectsPage /></RouteProfiler>} />
          <Route path="milestones" element={<RouteProfiler id="/app/milestones"><MilestonesPage /></RouteProfiler>} />
          <Route path="tasks" element={<RouteProfiler id="/app/tasks"><TasksPage /></RouteProfiler>} />
          <Route path="" element={<Navigate to="dashboard" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};
