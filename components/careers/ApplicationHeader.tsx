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
    <div className={css({ bg: 'transparent', pb: '24px' })}>
      <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '4px' })}>
        <h1 className={css({ fontSize: '24px', fontWeight: '600', color: '#111827' })}>{jobTitle}</h1>
        <span className={`${css({ px: '8px', py: '2px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' })} ${getBadgeColor(currentStage)}`}>
          {currentStage}
        </span>
      </div>
      
      <div className={css({ mb: '4px', fontSize: '15px', fontWeight: '500', color: '#374151' })}>
        {candidateName}
      </div>
      
      <div className={css({ mb: '4px', fontSize: '13px', color: '#6B7280' })}>
        Application <span className={css({ fontFamily: 'monospace' })}>{applicationReference}</span>
      </div>
      
      <div className={css({ mb: '16px', fontSize: '13px', color: '#9CA3AF' })}>
        Applied {appliedAt} · Last updated {updatedAt}
      </div>
      
      <button 
        onClick={onEditProfile}
        className={css({ 
          fontSize: '13px', 
          fontWeight: '500', 
          border: '1px solid #D1D5DB', 
          borderRadius: '6px', 
          height: '34px',
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
