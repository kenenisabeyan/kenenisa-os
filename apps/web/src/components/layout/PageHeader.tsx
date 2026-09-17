import React from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '../ui/Breadcrumbs.js';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className = '',
}) => {
  return (
    <div className={`mb-6 pb-5 border-b border-slate-200/90 ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">{description}</p>}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
      </div>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

