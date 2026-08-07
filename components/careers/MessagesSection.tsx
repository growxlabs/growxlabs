'use client';

import React from 'react';
import { css } from '@/styled-system/css';

interface MessagesSectionProps {
  messages: any[];
}

export function MessagesSection({ messages }: MessagesSectionProps) {
  return (
    <div>
      <h2 className={css({ fontSize: '16px', fontWeight: '600', color: '#111827', mb: '16px' })}>Messages</h2>
      
      {(!messages || messages.length === 0) ? (
        <div>
          <p className={css({ fontSize: '14px', color: '#475569', mb: '4px' })}>No messages yet</p>
          <p className={css({ fontSize: '13px', color: '#64748B' })}>Updates from the recruitment team will appear here.</p>
        </div>
      ) : (
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '12px' })}>
          {messages.map((msg, idx) => (
            <div key={idx} className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '8px', borderBottom: '1px solid #F0F1F3' })}>
              <div>
                <div className={css({ fontSize: '14px', fontWeight: '500', color: '#111827', mb: '4px' })}>
                  {msg.subject}
                </div>
                {msg.status && (
                  <span className={css({ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    bg: '#E5E7EB', 
                    color: '#374151',
                    px: '8px',
                    py: '2px',
                    borderRadius: '9999px',
                    display: 'inline-block'
                  })}>
                    {msg.status}
                  </span>
                )}
              </div>
              <div className={css({ fontSize: '13px', color: '#9CA3AF' })}>
                {msg.date}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
