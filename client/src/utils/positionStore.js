// Open positions: the single source of truth for what the company is hiring for and what each role requires.
import { SKILL_NAMES } from './analyzerCore';

export const SKILL_CATALOG = SKILL_NAMES;
export const DEPARTMENTS = ['Engineering', 'Quality Assurance', 'Data & Analytics', 'Product', 'Design', 'Operations', 'Sales & Marketing', 'HR & Admin'];
export const TYPES = ['Full-time', 'Contract', 'Internship', 'Part-time'];
export const PRIORITIES = ['High', 'Medium', 'Low'];
export const POS_STATUS = ['Open', 'On hold', 'Closed'];
export const POS_COLOR = { Open: '#3F8F66', 'On hold': '#C27A1E', Closed: '#8A7C6F', High: '#C4513F', Medium: '#C27A1E', Low: '#3F8F66' };

const KEY = 'recruitiq.positions.v1';
const ago = (d) => new Date(Date.now() - d * 864e5).toISOString();
const SEED = [
  { id: 'p1', title: '.NET Developer', dept: 'Engineering', location: 'Mumbai', type: 'Full-time', openings: 2, minExp: 3, maxExp: 8, must: ['C#', '.NET', 'SQL', 'Azure'], nice: ['Docker', 'Git'], owner: 'HR 01', priority: 'High', status: 'Open', desc: 'Build and maintain internal and client-facing .NET services.', createdAt: ago(40) },
  { id: 'p2', title: 'QA Engineer', dept: 'Quality Assurance', location: 'Pune', type: 'Full-time', openings: 2, minExp: 2, maxExp: 6, must: ['Selenium', 'Testing', 'Jira', 'API'], nice: ['Git', 'Agile'], owner: 'HR 02', priority: 'Medium', status: 'Open', desc: 'Own test strategy and automation for our web products.', createdAt: ago(32) },
  { id: 'p3', title: 'Software Developer', dept: 'Engineering', location: 'Remote', type: 'Full-time', openings: 3, minExp: 3, maxExp: 7, must: ['Java', 'React', 'SQL', 'Git'], nice: ['Docker', 'AWS'], owner: 'HR 03', priority: 'High', status: 'Open', desc: 'Full-stack development across Java services and React front-ends.', createdAt: ago(25) },
  { id: 'p4', title: 'Data Analyst', dept: 'Data & Analytics', location: 'Mumbai', type: 'Full-time', openings: 1, minExp: 2, maxExp: 5, must: ['SQL', 'Python', 'Excel', 'Power BI'], nice: ['Tableau', 'Agile'], owner: 'HR 04', priority: 'Medium', status: 'Open', desc: 'Turn business questions into dashboards and insights.', createdAt: ago(18) },
];

export const loadPositions = () => { try { const l = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(l) && l.length) return l; } catch { /* ignore */ } return SEED; };
export const savePositions = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ } };
