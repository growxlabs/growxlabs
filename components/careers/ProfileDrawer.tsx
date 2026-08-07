'use client'

import React, { useEffect } from 'react'
import { css } from '@/styled-system/css'
import { X } from 'lucide-react'

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  profileForm: { phone: string; address: string; linkedInURL: string; portfolioURL: string };
  onFormChange: (form: { phone: string; address: string; linkedInURL: string; portfolioURL: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function ProfileDrawer({
  open,
  onClose,
  profileForm,
  onFormChange,
  onSubmit,
  loading
}: ProfileDrawerProps) {
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={css({
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)'
    })}>
      <div className={css({
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#FFFFFF',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.05)',
        animation: 'slideIn 0.3s ease-out forwards',
        borderLeft: '1px solid #E5E7EB'
      })}>
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
        
        <div className={css({
          padding: '24px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        })}>
          <h2 className={css({ fontSize: '16px', fontWeight: 600, color: '#111827' })}>
            Edit profile
          </h2>
          <button 
            onClick={onClose}
            className={css({ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: '#6B7280',
              _hover: { color: '#111827' }
            })}
          >
            <X size={20} />
          </button>
        </div>

        <form 
          onSubmit={onSubmit} 
          className={css({ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden'
          })}
        >
          <div className={css({
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          })}>
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '6px' })}>
              <label className={css({ fontSize: '13px', fontWeight: 500, color: '#374151' })}>Phone</label>
              <input 
                type="tel"
                value={profileForm.phone}
                onChange={e => onFormChange({ ...profileForm, phone: e.target.value })}
                className={css({
                  height: '42px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none',
                  _focus: { border: '1px solid #0075de', boxShadow: '0 0 0 1px #0075de' }
                })}
              />
            </div>

            <div className={css({ display: 'flex', flexDirection: 'column', gap: '6px' })}>
              <label className={css({ fontSize: '13px', fontWeight: 500, color: '#374151' })}>Location</label>
              <input 
                type="text"
                value={profileForm.address}
                onChange={e => onFormChange({ ...profileForm, address: e.target.value })}
                className={css({
                  height: '42px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none',
                  _focus: { border: '1px solid #0075de', boxShadow: '0 0 0 1px #0075de' }
                })}
              />
            </div>

            <div className={css({ display: 'flex', flexDirection: 'column', gap: '6px' })}>
              <label className={css({ fontSize: '13px', fontWeight: 500, color: '#374151' })}>LinkedIn</label>
              <input 
                type="url"
                value={profileForm.linkedInURL}
                onChange={e => onFormChange({ ...profileForm, linkedInURL: e.target.value })}
                className={css({
                  height: '42px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none',
                  _focus: { border: '1px solid #0075de', boxShadow: '0 0 0 1px #0075de' }
                })}
              />
            </div>

            <div className={css({ display: 'flex', flexDirection: 'column', gap: '6px' })}>
              <label className={css({ fontSize: '13px', fontWeight: 500, color: '#374151' })}>Portfolio</label>
              <input 
                type="url"
                value={profileForm.portfolioURL}
                onChange={e => onFormChange({ ...profileForm, portfolioURL: e.target.value })}
                className={css({
                  height: '42px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none',
                  _focus: { border: '1px solid #0075de', boxShadow: '0 0 0 1px #0075de' }
                })}
              />
            </div>
          </div>

          <div className={css({
            padding: '24px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: '#F7F8FA'
          })}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={css({
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '6px',
                _hover: { backgroundColor: '#E5E7EB' },
                _disabled: { opacity: 0.5, cursor: 'not-allowed' }
              })}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={css({
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#0075de',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '6px',
                _hover: { backgroundColor: '#005bb5' },
                _disabled: { opacity: 0.5, cursor: 'not-allowed' }
              })}
            >
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
