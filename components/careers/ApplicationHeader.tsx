'use client';

import React from 'react';
import { css } from '@/styled-system/css';

interface ApplicationHeaderProps {
  jobTitle: string;
  jobDepartment?: string;
  candidateName: string;
  applicationReference: string;
  appliedAt: string;
  updatedAt: string;
  currentStage: string;
  onEditProfile: () => void;
}

export function ApplicationHeader({
  jobTitle,
  candidateName,
  applicationReference,
  appliedAt,
  updatedAt,
  currentStage,
  onEditProfile,
}: ApplicationHeaderProps) {
  const getBadgeColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'hired':
        return css({ bg: '#dcfce7', color: '#166534' });
      case 'offer':
        return css({ bg: '#f3e8ff', color: '#6b21a8' });
      case 'interview':
        return css({ bg: '#dbeafe', color: '#1e40af' });
      case 'screening':
        return css({ bg: '#fef3c7', color: '#92400e' });
      case 'applied':
      default:
        return css({ bg: '#f3f4f6', color: '#374151' });
    }
  };

  return (
    <div className={css({ bg: 'transparent', pb: '24px', borderBottom: '1px solid #E5E7EB' })}>
      <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px', mb: '6px' })}>
        <h1 className={css({ fontSize: '24px', lineHeight: '1.25', fontWeight: '600', color: '#111827', minWidth: 0 })}>{jobTitle}</h1>
        <span className={`${css({ px: '8px', py: '2px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' })} ${getBadgeColor(currentStage)}`}>
          {currentStage}
        </span>
      </div>
      
      <div className={css({ mb: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' })}>
        {candidateName}
      </div>
      
      <div className={css({ mb: '4px', fontSize: '13px', color: '#475569' })}>
        Application <span className={css({ fontFamily: 'monospace' })}>{applicationReference}</span>
      </div>
      
      <div className={css({ mb: '16px', fontSize: '12px', color: '#64748B' })}>
        Applied {appliedAt} · Last updated {updatedAt}
      </div>
      
      <button 
        onClick={onEditProfile}
        className={css({ 
          fontSize: '13px', 
          fontWeight: '500', 
          border: '1px solid #D1D5DB', 
          borderRadius: '6px', 
          height: '36px',
          px: '16px',
          bg: 'transparent',
          color: '#111827',
          cursor: 'pointer'
        })}
      >
        Edit profile
      </button>
    </div>
  );
}
