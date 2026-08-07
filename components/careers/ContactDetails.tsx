'use client'

import { css } from '@/styled-system/css'

interface ContactDetailsProps {
  email: string;
  phone?: string | null;
  location?: string | null;
  linkedInURL?: string | null;
  portfolioURL?: string | null;
}

export function ContactDetails({
  email,
  phone,
  location,
  linkedInURL,
  portfolioURL
}: ContactDetailsProps) {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '16px' })}>
      <h3 className={css({ fontSize: '14px', fontWeight: 600, color: '#111827' })}>
        Contact details
      </h3>
      
      <div className={css({ display: 'flex', flexDirection: 'column', gap: '16px' })}>
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '4px' })}>
          <span className={css({ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' })}>
            Email
          </span>
          <span className={css({ fontSize: '13px', fontWeight: 500, color: '#111827' })}>
            {email}
          </span>
        </div>

        {phone && (
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '4px' })}>
            <span className={css({ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' })}>
              Phone
            </span>
            <span className={css({ fontSize: '13px', fontWeight: 500, color: '#111827' })}>
              {phone}
            </span>
          </div>
        )}

        {location && (
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '4px' })}>
            <span className={css({ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' })}>
              Location
            </span>
            <span className={css({ fontSize: '13px', fontWeight: 500, color: '#111827' })}>
              {location}
            </span>
          </div>
        )}

        {linkedInURL && (
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '4px' })}>
            <span className={css({ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' })}>
              LinkedIn
            </span>
            <a 
              href={linkedInURL}
              target="_blank"
              rel="noopener noreferrer"
              className={css({ fontSize: '13px', fontWeight: 500, color: '#0075de', textDecoration: 'none', _hover: { textDecoration: 'underline' } })}
            >
              Open profile
            </a>
          </div>
        )}

        {portfolioURL && (
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '4px' })}>
            <span className={css({ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' })}>
              Portfolio
            </span>
            <a 
              href={portfolioURL}
              target="_blank"
              rel="noopener noreferrer"
              className={css({ fontSize: '13px', fontWeight: 500, color: '#0075de', textDecoration: 'none', _hover: { textDecoration: 'underline' } })}
            >
              Open link
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
