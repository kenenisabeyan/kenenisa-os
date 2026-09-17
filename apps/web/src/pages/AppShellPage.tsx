import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.js';
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
import { OpportunitiesPage } from './OpportunitiesPage.js';
import { OpportunityDetailPage } from './OpportunityDetailPage.js';
import { IntelligencePage } from './IntelligencePage.js';
import { ExecutivePage } from './ExecutivePage.js';
import { WorkIntelligencePage } from './WorkIntelligencePage.js';
import { CareerPage } from './CareerPage.js';
import { SettingsPage } from './SettingsPage.js';
import { NotFoundPage } from './NotFoundPage.js';

export const AppShellPage: React.FC = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="dashboard" element={<DashboardPage />} />
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
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="workstreams" element={<WorkstreamsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="milestones" element={<MilestonesPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
};
