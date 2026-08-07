'use client'

import { css } from '@/styled-system/css'
import { FileText } from 'lucide-react'

interface DocumentsSectionProps {
  documents: Array<{ id: string; type: string; name: string; url: string }>;
}

export function DocumentsSection({ documents }: DocumentsSectionProps) {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '16px' })}>
      <h3 className={css({ fontSize: '14px', fontWeight: 600, color: '#111827' })}>
        Documents
      </h3>
      
      {documents.length === 0 ? (
        <p className={css({ fontSize: '13px', color: '#6B7280' })}>
          No documents available.
        </p>
      ) : (
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '12px' })}>
          {documents.map(doc => (
            <div 
              key={doc.id} 
              className={css({ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #E5E7EB',
                _last: { borderBottom: 'none' }
              })}
            >
              <div className={css({ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' })}>
                <FileText size={16} color="#6B7280" />
                <span className={css({ 
                  fontSize: '13px', 
                  fontWeight: 500, 
                  color: '#111827',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                })}>
                  {doc.name}
                </span>
              </div>
              <a 
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className={css({ 
                  fontSize: '13px', 
                  color: '#0075de', 
                  textDecoration: 'none',
                  flexShrink: 0,
                  _hover: { textDecoration: 'underline' }
                })}
              >
                View
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
