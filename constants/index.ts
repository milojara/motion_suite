import { Status, Priority, SocialNetwork } from '@/types';

export const STATUSES: Status[] = [
  'Material Bruto',
  'En Edición',
  'Revisión',
  'Exportado',
];

export const STATUS_COLORS: Record<Status, string> = {
  'Material Bruto': 'bg-zinc-800 text-zinc-300',
  'En Edición': 'bg-amber-900/80 text-amber-300 border border-amber-500/50',
  'Revisión': 'bg-indigo-900/80 text-indigo-300 border border-indigo-500/50',
  'Exportado': 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/50',
};

export const PRIORITIES: Priority[] = ['Alta', 'Media', 'Baja'];

export const PRIORITY_COLORS: Record<Priority, string> = {
  'Alta': 'bg-red-500/10 text-red-500 border-red-500/20',
  'Media': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Baja': 'bg-blue-500/10 text-blue-500 border-blue-500/20'
};

export const SOCIAL_NETWORKS: SocialNetwork[] = ['YouTube Shorts', 'Instagram', 'TikTok'];

export const SOCIAL_COLORS: Record<SocialNetwork, string> = {
  'YouTube Shorts': 'bg-red-500/10 text-red-500 border-red-500/20',
  'Instagram': 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  'TikTok': 'bg-cyan-950 text-cyan-400 border-cyan-800/30'
};

export const ROUTES = {
  DASHBOARD: '/',
  CONTENT: '/content',
  PRIVATE: '/private',
  SETTINGS: '/settings',
};
