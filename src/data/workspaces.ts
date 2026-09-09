import { Workspace } from '../types';

export const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'space-general',
    name: 'General',
    icon: 'Compass',
    color: 'bg-blue-600 text-white',
    badge: 'border-blue-500 text-blue-600',
  },
  {
    id: 'space-research',
    name: 'Research & AI',
    icon: 'Zap',
    color: 'bg-amber-600 text-white',
    badge: 'border-amber-500 text-amber-600',
  },
  {
    id: 'space-engineering',
    name: 'Engineering',
    icon: 'Code',
    color: 'bg-emerald-600 text-white',
    badge: 'border-emerald-500 text-emerald-600',
  },
  {
    id: 'space-reading',
    name: 'Reading & Study',
    icon: 'BookOpen',
    color: 'bg-purple-600 text-white',
    badge: 'border-purple-500 text-purple-600',
  },
];
