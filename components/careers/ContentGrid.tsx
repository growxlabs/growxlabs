'use client';

import React from 'react';
import { css } from '@/styled-system/css';

interface ContentGridProps {
  children: React.ReactNode;
}

export function ContentGrid({ children }: ContentGridProps) {
  return (
    <div className={css({
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '32px',
      '@media (min-width: 768px)': {
        gridTemplateColumns: 'minmax(0, 1fr) 280px',
        gap: '40px'
      },
      '@media (min-width: 1024px)': {
        gridTemplateColumns: 'minmax(0, 1fr) 320px',
        gap: '48px'
      }
    })}>
      {children}
    </div>
  );
}
