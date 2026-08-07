"use client";

import { css } from '@/styled-system/css';
import { Check } from 'lucide-react';

interface TimelineItem {
  stage: string;
  label: string;
  timestamp: string | null;
  completed: boolean;
}

interface ApplicationStepperProps {
  timeline: TimelineItem[];
  currentStage: string;
}

export function ApplicationStepper({ timeline, currentStage }: ApplicationStepperProps) {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        padding: '16px 0',
        md: {
          flexDirection: 'row',
          alignItems: 'flex-start',
        }
      })}
    >
      {timeline.map((item, index) => {
        const isCurrent = item.stage === currentStage;
        const isCompleted = item.completed;
        const isLast = index === timeline.length - 1;
        const isHiredCompleted = isCompleted && item.stage.toLowerCase() === 'hired';

        return (
          <div
            key={item.stage}
            className={css({
              display: 'flex',
              flexDirection: 'row',
              position: 'relative',
              md: {
                flexDirection: 'column',
                flex: isLast ? '0 0 auto' : '1',
              }
            })}
          >
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '22px',
                flexShrink: 0,
                md: {
                  flexDirection: 'row',
                  width: '100%',
                }
              })}
            >
              {/* Circle */}
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '22px',
                  height: '22px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 2,
                  ...(isHiredCompleted ? {
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                  } : isCompleted ? {
                    backgroundColor: '#374151',
                    color: '#FFFFFF',
                  } : isCurrent ? {
                    backgroundColor: '#0075de',
                    color: '#FFFFFF',
                  } : {
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #D1D5DB',
                    color: '#9CA3AF',
                  })
                })}
              >
                {isCompleted ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : (index + 1)}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={css({
                    width: '1px',
                    minHeight: '32px',
                    flex: 1,
                    backgroundColor: '#E5E7EB',
                    margin: '4px 0',
                    md: {
                      height: '1px',
                      minHeight: 'auto',
                      width: 'auto',
                      flex: 1,
                      margin: '0 8px',
                    }
                  })}
                />
              )}
            </div>

            {/* Label and Date */}
            <div
              className={css({
                marginLeft: '16px',
                paddingBottom: isLast ? '0' : '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                paddingTop: '2px',
                md: {
                  marginLeft: '0',
                  marginTop: '12px',
                  paddingBottom: '0',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'absolute',
                  top: '22px',
                  width: '120px',
                  left: '11px',
                  transform: 'translateX(-50%)',
                }
              })}
            >
              <span
                className={css({
                  fontSize: '12px',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  color: (isCompleted || isCurrent) ? '#111827' : '#9CA3AF',
                })}
              >
                {item.label}
              </span>
              {item.timestamp && (
                <span
                  className={css({
                    fontSize: '11px',
                    color: '#9CA3AF',
                    marginTop: '4px',
                  })}
                >
                  {new Date(item.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
