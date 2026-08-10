'use client'

import { css } from '@/styled-system/css'
import { FileText, Download } from 'lucide-react'

interface OfferSectionProps {
  offer: any;
  documents: any[];
  offerNotes: string;
  onOfferNotesChange: (val: string) => void;
  onOfferDecision: (decision: 'accepted' | 'rejected') => void;
  actionLoading: boolean;
}

export function OfferSection({
  offer,
  documents,
  offerNotes,
  onOfferNotesChange,
  onOfferDecision,
  actionLoading
}: OfferSectionProps) {
  if (!offer) return null;

  const offerLetter = documents.find(d => d.type === 'offer_letter' || d.name.toLowerCase().includes('offer'));
  const terms = offer.snapshot?.terms;

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '20px' })}>
      <h2 className={css({ fontSize: '16px', fontWeight: 600, color: '#111827' })}>
        Offer
      </h2>
      
      <div className={css({ display: 'flex', flexDirection: 'column', gap: '16px' })}>
        
        <div className={css({ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #E5E7EB' })}>
          <span className={css({ fontSize: '14px', color: '#6B7280' })}>Start date</span>
          <span className={css({ fontSize: '14px', fontWeight: 500, color: '#111827' })}>
            {offer.start_date ? new Date(offer.start_date).toLocaleDateString() : offer.startDate || 'TBD'}
          </span>
        </div>

        <div className={css({ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #E5E7EB' })}>
          <span className={css({ fontSize: '14px', color: '#6B7280' })}>Issued / status</span>
          <span className={css({ fontSize: '14px', fontWeight: 500, color: '#111827', textTransform: 'capitalize' })}>
            {offer.issued_at ? new Date(offer.issued_at).toLocaleDateString() : 'Not issued'} · {offer.status === 'sent' ? 'Issued' : offer.status === 'rejected' ? 'Declined' : offer.status}
          </span>
        </div>

        {offerLetter && (
          <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #E5E7EB' })}>
            <div className={css({ display: 'flex', alignItems: 'center', gap: '8px' })}>
              <FileText size={18} color="#6B7280" />
              <span className={css({ fontSize: '14px', fontWeight: 500, color: '#111827' })}>
                Offer Letter
              </span>
            </div>
            <a 
              href={offerLetter.url}
              target="_blank"
              rel="noopener noreferrer"
              className={css({ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px', 
                color: '#0075de', 
                textDecoration: 'none',
                _hover: { textDecoration: 'underline' }
              })}
            >
              <Download size={14} />
              Download
            </a>
          </div>
        )}

        {terms && (
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '8px' })}>
            {[
              ['Working terms', terms.workingTerms],
              ['Confidentiality & intellectual property', terms.confidentialityIp],
              [/intern/i.test(offer.snapshot?.employmentType || '') ? 'Ending the internship' : 'Ending the engagement', terms.termination],
              ['Acceptance', terms.acceptanceInstructions],
            ].filter(([, value]) => Boolean(value)).map(([label, value]) => (
              <section key={label} className={css({ borderTop: '1px solid #E5E7EB', paddingTop: '14px' })}>
                <h3 className={css({ fontSize: '12px', fontWeight: 700, color: '#075a9c', textTransform: 'uppercase', letterSpacing: '.06em' })}>{label}</h3>
                <p className={css({ marginTop: '8px', whiteSpace: 'pre-line', fontSize: '14px', lineHeight: 1.7, color: '#4B5563' })}>{value}</p>
              </section>
            ))}
          </div>
        )}

        {!offer.candidate_response?.decision ? (
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' })}>
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '6px' })}>
              <label className={css({ fontSize: '13px', fontWeight: 500, color: '#374151' })}>
                Notes (Optional)
              </label>
              <textarea
                value={offerNotes}
                onChange={e => onOfferNotesChange(e.target.value)}
                placeholder="Any questions or comments about the offer..."
                rows={3}
                className={css({
                  width: '100%',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  padding: '10px 12px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none',
                  resize: 'vertical',
                  _focus: { border: '1px solid #0075de', boxShadow: '0 0 0 1px #0075de' }
                })}
              />
            </div>
            
            <div className={css({ display: 'flex', gap: '12px', marginTop: '4px' })}>
              <button
                onClick={() => onOfferDecision('accepted')}
                disabled={actionLoading}
                className={css({
                  flex: 1,
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#059669',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  _hover: { backgroundColor: '#047857' },
                  _disabled: { opacity: 0.5, cursor: 'not-allowed' }
                })}
              >
                Accept offer
              </button>
              <button
                onClick={() => onOfferDecision('rejected')}
                disabled={actionLoading}
                className={css({
                  flex: 1,
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#DC2626',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  _hover: { backgroundColor: '#B91C1C' },
                  _disabled: { opacity: 0.5, cursor: 'not-allowed' }
                })}
              >
                Decline
              </button>
            </div>
          </div>
        ) : (
          <div className={css({ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#F7F8FA',
            borderRadius: '6px',
            border: '1px solid #E5E7EB'
          })}>
            <span className={css({ fontSize: '14px', color: '#6B7280' })}>Your response</span>
            <span className={css({ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: offer.candidate_response?.decision === 'accepted' ? '#059669' : '#DC2626',
              textTransform: 'capitalize'
            })}>
              {offer.candidate_response?.decision}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
