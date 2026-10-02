import { LayoutDashboard, FileText, CalendarDays, Zap, Users, BarChart3, Repeat, History } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ResumeManagement from './pages/ResumeManagement';
import InterviewManagement from './pages/InterviewManagement';
import ActionCenter from './pages/ActionCenter';
import HRWorkspace from './pages/HRWorkspace';
import ManagerOverview from './pages/ManagerOverview';
import HRHandover from './pages/HRHandover';
import ActivityLog from './pages/ActivityLog';

// Single source of truth for sidebar + router + topbar
export const ROUTES = [
  { path: 'dashboard', label: 'Dashboard', sub: 'Company-wide recruitment snapshot', icon: LayoutDashboard, element: <Dashboard /> },
  { path: 'resumes', label: 'Resumes', sub: 'Central resume list, filters and AI analysis', icon: FileText, element: <ResumeManagement /> },
  { path: 'interviews', label: 'Interviews', sub: 'Schedule, track and close the loop on feedback', icon: CalendarDays, element: <InterviewManagement /> },
  { path: 'actions', label: 'Action Center', sub: 'Everything that needs HR attention', icon: Zap, element: <ActionCenter /> },
  { path: 'workspace', label: 'HR Workspace', sub: 'Workload per HR – no information silos', icon: Users, element: <HRWorkspace /> },
  { path: 'manager', label: 'Manager Overview', sub: 'Recruitment health at a glance', icon: BarChart3, element: <ManagerOverview /> },
  { path: 'handover', label: 'HR Handover', sub: 'Absence cover in one click', icon: Repeat, element: <HRHandover /> },
  { path: 'log', label: 'Activity Log', sub: 'Audit trail of every important action', icon: History, element: <ActivityLog /> },
];
