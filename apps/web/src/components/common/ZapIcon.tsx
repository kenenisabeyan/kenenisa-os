import React from 'react';

export interface ZapIconProps {
  className?: string;
  fill?: string;
  strokeWidth?: number;
}

export const ZapIcon: React.FC<ZapIconProps> = ({
  className = 'w-4 h-4',
  fill = 'currentColor',
  strokeWidth = 1.8,
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default ZapIcon;
