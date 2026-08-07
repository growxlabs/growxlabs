'use client'

import { css } from '@/styled-system/css'

interface AssessmentSectionProps {
  assessment?: any;
}

export function AssessmentSection({ assessment }: AssessmentSectionProps) {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '16px' })}>
      <h2 className={css({ fontSize: '16px', fontWeight: 600, color: '#111827' })}>
        Assessment
      </h2>
      
      {!assessment ? (
        <p className={css({ fontSize: '14px', color: '#6B7280' })}>
          No assessment has been assigned.
        </p>
      ) : (
        <div className={css({ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          paddingTop: '8px' 
        })}>
          <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
            <div>
              <h4 className={css({ fontSize: '14px', fontWeight: 500, color: '#111827' })}>
                {assessment.title || 'Technical Assessment'}
              </h4>
              <p className={css({ fontSize: '13px', color: '#6B7280', marginTop: '4px' })}>
                Deadline: {assessment.deadline || 'Not set'}
              </p>
            </div>
            <span className={css({ 
              fontSize: '12px', 
              fontWeight: 600, 
              padding: '4px 10px', 
              borderRadius: '9999px',
              backgroundColor: '#F3F4F6',
              color: '#374151'
            })}>
              {assessment.status || 'Pending'}
            </span>
          </div>
          
          <button className={css({
            marginTop: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#111827',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            _hover: { backgroundColor: '#F7F8FA' }
          })}>
            Start assessment
          </button>
        </div>
      )}
    </div>
  )
}
