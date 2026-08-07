"use client";

import { css } from '@/styled-system/css';

interface CandidatePortalHeaderProps {
  candidateName?: string;
  candidateEmail?: string;
}

export function CandidatePortalHeader({ candidateName, candidateEmail }: CandidatePortalHeaderProps) {
  return (
    <header
      className={css({
        width: '100%',
        height: '56px',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'Inter, sans-serif'
      })}
    >
      <div
        className={css({
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px'
          })}
        >
          <span
            className={css({
              fontSize: '15px',
              fontWeight: 600,
              color: '#111827'
            })}
          >
            GrowXLabs
          </span>
          <span
            className={css({
              fontSize: '15px',
              fontWeight: 400,
              color: '#6B7280'
            })}
          >
            Careers
          </span>
        </div>

        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          })}
        >
          <a
            href="mailto:recruitment@growxlabs.tech"
            className={css({
              fontSize: '13px',
              fontWeight: 500,
              color: '#6B7280',
              textDecoration: 'none',
              _hover: {
                color: '#111827'
              }
            })}
          >
            Help
          </a>
          <span
            className={css({
              fontSize: '13px',
              fontWeight: 500,
              color: '#111827'
            })}
          >
            {candidateName || 'Account'}
          </span>
        </div>
      </div>
    </header>
  );
}
