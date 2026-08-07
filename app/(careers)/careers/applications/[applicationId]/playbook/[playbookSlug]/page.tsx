"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { css } from "@/styled-system/css";

export default function CandidatePlaybookPage() {
  const params = useParams<{ applicationId: string; playbookSlug: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => { fetch(`/api/v1/candidate/playbooks/${encodeURIComponent(params.playbookSlug)}`, { cache: "no-store" }).then(async (res) => { const body = await res.json(); if (res.status === 401) { router.replace(`/careers/login?redirect=${encodeURIComponent(window.location.pathname)}`); return; } if (!res.ok) throw new Error(body.error || "Playbook unavailable."); setData(body); }).catch((err) => setError(err.message)); }, [params.playbookSlug, router]);
  if (!data && !error) return <main className={css({ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bg: '#F7F8FA' })}><Loader2 className={css({ color: '#0075de', animation: 'spin 1s linear infinite' })} size={24} /></main>;
  if (error) return <main className={css({ minHeight: '100vh', bg: '#F7F8FA', p: '32px', color: '#111827' })}><p>{error}</p><Link href={`/careers/applications/${params.applicationId}`} className={css({ color: '#0075de' })}>Back to application</Link></main>;
  const { playbook } = data;
  return <main className="candidate-portal-theme" style={{ minHeight: '100vh', background: '#F7F8FA' }}><header className={css({ borderBottom: '1px solid #E5E7EB', bg: '#FFFFFF' })}><div className={css({ maxWidth: '820px', margin: '0 auto', px: '24px', py: '20px', '@media (max-width: 767px)': { px: '16px' } })}><Link href={`/careers/applications/${params.applicationId}`} className={css({ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px', textDecoration: 'none' })}><ArrowLeft size={14} /> Back to application</Link></div></header><article className={css({ maxWidth: '820px', margin: '0 auto', px: '24px', py: '48px', '@media (max-width: 767px)': { px: '16px', py: '32px' } })}><p className={css({ fontSize: '12px', fontWeight: 600, color: '#0075de', mb: '10px' })}>GrowXLabs Careers</p><h1 className={css({ fontSize: '28px', lineHeight: 1.25, fontWeight: 600, color: '#111827', mb: '8px' })}>{playbook.title}</h1><p className={css({ fontSize: '15px', color: '#475569', mb: '8px' })}>{playbook.subtitle}</p><p className={css({ fontSize: '12px', color: '#64748B', pb: '24px', borderBottom: '1px solid #E5E7EB' })}>Version {playbook.version} · Updated {new Date(playbook.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p><div className={css({ pt: '28px' })}>{(playbook.content || []).map((section: any) => <section key={section.heading} className={css({ pb: '24px', mb: '24px', borderBottom: '1px solid #F0F1F3', _last: { borderBottom: 'none' } })}><h2 className={css({ fontSize: '18px', fontWeight: 600, color: '#111827', mb: '8px' })}>{section.heading}</h2><p className={css({ fontSize: '15px', lineHeight: 1.8, color: '#334155', maxWidth: '760px' })}>{section.body}</p></section>)}</div></article></main>;
}
