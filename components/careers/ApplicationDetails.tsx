'use client'

import { css } from '@/styled-system/css'

interface ApplicationDetailsProps {
  applicationId: string;
  appliedAt: string;
  currentStage: string;
  updatedAt: string;
}

export function ApplicationDetails({
  applicationId,
  appliedAt,
  currentStage,
  updatedAt
}: ApplicationDetailsProps) {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '16px' })}>
      <h3 className={css({ fontSize: '14px', fontWeight: 600, color: '#111827' })}>
        Application details
      </h3>
      
      <div className={css({ display: 'flex', flexDirection: 'column', gap: '16px' })}>
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '4px' })}>
          <span className={css({ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' })}>
            Application ID
          </span>
          <span className={css({ fontSize: '13px', fontWeight: 500, color: '#111827' })}>
            {applicationId}
          </span>
        </div>

        <div className={css({ display: 'flex', flexDirection: 'column', gap: '4px' })}>
          <span className={css({ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' })}>
            Applied
          </span>
          <span className={css({ fontSize: '13px', fontWeight: 500, color: '#111827' })}>
            {appliedAt}
          </span>
        </div>

        <div className={css({ display: 'flex', flexDirection: 'column', gap: '4px' })}>
          <span className={css({ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' })}>
            Current stage
          </span>
          <span className={css({ fontSize: '13px', fontWeight: 500, color: '#0075de' })}>
            {currentStage}
          </span>
        </div>

        <div className={css({ display: 'flex', flexDirection: 'column', gap: '4px' })}>
          <span className={css({ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' })}>
            Last updated
          </span>
          <span className={css({ fontSize: '13px', fontWeight: 500, color: '#111827' })}>
            {updatedAt}
          </span>
        </div>
      </div>
    </div>
  )
}
