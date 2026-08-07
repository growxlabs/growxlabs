import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { css } from '@/styled-system/css';

export function InterviewPreparation({ playbooks, applicationId, interviews = [] }: { playbooks: any[]; applicationId: string; interviews?: any[] }) {
  if (!playbooks?.length) return null;
  const item = playbooks[0];
  const playbook = item.playbook;
  return <section className={css({ pb: '32px', borderBottom: '1px solid #E5E7EB' })}>
    <h2 className={css({ fontSize: '16px', fontWeight: 600, color: '#111827', mb: '12px' })}>Interview preparation</h2>
    <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', py: '4px' })}>
      <div>
        <div className={css({ fontSize: '14px', fontWeight: 600, color: '#111827' })}>{playbook.title}</div>
        <div className={css({ mt: '4px', fontSize: '13px', color: '#475569' })}>Preparation guide for your upcoming interview.</div>
        <div className={css({ mt: '6px', fontSize: '12px', color: '#64748B' })}>Shared {new Date(item.published_at || item.assigned_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        {interviews[0]?.scheduled_at && <div className={css({ mt: '8px', fontSize: '12px', color: '#475569' })}>Interview: {new Date(interviews[0].scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(interviews[0].scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>}
      </div>
      <Link href={`/careers/applications/${encodeURIComponent(applicationId)}/playbook/${encodeURIComponent(playbook.slug)}`} className={css({ display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0, fontSize: '13px', fontWeight: 500, color: '#0075de', textDecoration: 'none', _hover: { textDecoration: 'underline' } })}>Open playbook <ArrowRight size={14} /></Link>
    </div>
  </section>;
}
