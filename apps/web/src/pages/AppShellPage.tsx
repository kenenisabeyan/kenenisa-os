import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.js';
import { RouteSuspenseFallback } from '../components/layout/RouteSuspenseFallback.js';

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
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="graduation" element={<GraduationPage />} />
          <Route path="academics" element={<AcademicsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="executive" element={<ExecutivePage />} />
          <Route path="work-intelligence" element={<WorkIntelligencePage />} />
          <Route path="intelligence" element={<IntelligencePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="career" element={<CareerPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="opportunities/:id" element={<OpportunityDetailPage />} />
          <Route path="planning/*" element={<PlanningPage />} />
          <Route path="learning" element={<LearningPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="evidence" element={<EvidencePage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="workstreams" element={<WorkstreamsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="milestones" element={<MilestonesPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};
