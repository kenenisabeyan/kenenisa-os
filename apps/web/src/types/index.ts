export interface SystemModule {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'engineering' | 'career' | 'personal';
  status: 'planned' | 'in-progress' | 'completed';
}

export type NavItem = {
  label: string;
  href: string;
  badge?: string;
};
