'use client';

import React from 'react';
import { css } from '@/styled-system/css';

interface InterviewSectionProps {
  interviews: any[];
  onRequestReschedule: () => void;
}

export function InterviewSection({ interviews, onRequestReschedule }: InterviewSectionProps) {
  return (
    <div>
      <h2 className={css({ fontSize: '16px', fontWeight: '600', color: '#111827', mb: '16px' })}>Interview</h2>
      
      {(!interviews || interviews.length === 0) ? (
        <p className={css({ fontSize: '14px', color: '#6B7280' })}>No interview scheduled.</p>
      ) : (
        <div>
          {interviews.map((interview, idx) => (
            <div key={idx} className={css({ mb: '24px' })}>
              <div className={css({ fontSize: '14px', fontWeight: '500', color: '#111827', mb: '4px' })}>
                {interview.date || 'Unknown date'}
              </div>
              <div className={css({ fontSize: '13px', color: '#6B7280', mb: '16px' })}>
                {interview.time} · {interview.duration || 'Unknown duration'} · {interview.provider}
              </div>
              
              <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '8px', mb: '12px' })}>
                {interview.is_join_enabled && (
                  <button className={css({
                    bg: '#0075de',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '6px',
                    px: '16px',
                    height: '34px',
                    border: 'none',
                    cursor: 'pointer'
                  })}>
                    Join
                  </button>
                )}
                <button className={css({
                  bg: 'transparent',
                  color: '#111827',
                  fontSize: '13px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  px: '16px',
                  height: '34px',
                  cursor: 'pointer'
                })}>
                  Add to Google Calendar
                </button>
                <button 
                  onClick={onRequestReschedule}
                  className={css({
                    bg: 'transparent',
                    color: '#111827',
                    fontSize: '13px',
                    fontWeight: '500',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    px: '16px',
                    height: '34px',
                    cursor: 'pointer'
                  })}
                >
                  Request reschedule
                </button>
              </div>
              
              {!interview.is_join_enabled && (
                <div className={css({ fontSize: '13px', color: '#6B7280' })}>
                  The join link will be available 15 minutes before your interview.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
