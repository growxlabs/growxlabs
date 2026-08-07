'use client';

import React from 'react';
import { css } from '@/styled-system/css';

interface ApplicationActivityProps {
  timeline: Array<{ stage: string; label: string; timestamp: string | null; completed: boolean }>;
  interviews: any[];
  messages: any[];
}

export function ApplicationActivity({ timeline, interviews, messages }: ApplicationActivityProps) {
  const events: any[] = [];

  // Parse timeline
  if (timeline) {
    timeline.forEach(t => {
      if (t.timestamp) {
        events.push({
          id: `stage-${t.stage}`,
          type: 'stage',
          date: new Date(t.timestamp),
          label: `Application moved to ${t.label} · ${new Date(t.timestamp).toLocaleDateString()}`,
          color: '#6B7280'
        });
      }
    });
  }

  // Parse interviews
  if (interviews) {
    interviews.forEach(i => {
      if (i.date) {
        const dateObj = new Date(i.date);
        events.push({
          id: `interview-${i.id}`,
          type: 'interview',
          date: dateObj,
          label: `Interview scheduled · ${dateObj.toLocaleDateString()} · ${i.time || ''} · ${i.provider || 'Provider'}`,
          color: '#0075de'
        });
      }
    });
  }

  // Parse messages
  if (messages) {
    messages.forEach(m => {
      if (m.date) {
        events.push({
          id: `msg-${m.id}`,
          type: 'message',
          date: new Date(m.date),
          label: `${m.subject} · ${new Date(m.date).toLocaleDateString()}`,
          color: '#059669'
        });
      }
    });
  }

  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div>
      <h2 className={css({ fontSize: '16px', fontWeight: '600', color: '#111827', mb: '16px' })}>Application activity</h2>
      
      {events.length === 0 ? (
        <p className={css({ fontSize: '14px', color: '#6B7280' })}>No activity recorded yet.</p>
      ) : (
        <div>
          {events.map((event, index) => (
            <div 
              key={event.id}
              className={css({
                paddingLeft: '16px',
                py: '14px',
                borderLeft: `3px solid ${event.color}`,
                borderBottom: index < events.length - 1 ? '1px solid #F0F1F3' : 'none',
                fontSize: '14px',
                color: '#374151'
              })}
            >
              {event.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
