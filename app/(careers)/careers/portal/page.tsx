"use client";

import React, { useEffect, useState } from "react";
import { Loader2, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { css } from "@/styled-system/css";

import { CandidatePortalHeader } from "@/components/careers/CandidatePortalHeader";

const stages = ["Applied", "Under review", "Screening", "Interview", "Assessment", "Offer", "Hired"];
const stageKeys = ["applied", "under_review", "screening", "interview", "assessment", "offer", "hired"];

export default function CandidatePortalDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/candidate/portal", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load portal data");
        setData(json);
      })
      .catch((err) => setError(err.message || "Failed to load candidate applications"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={css({ minHeight: '100vh', bg: '#F7F8FA' })}>
        <CandidatePortalHeader />
        <main className={css({ display: 'flex', minHeight: '70vh', alignItems: 'center', justifyContent: 'center' })}>
          <Loader2 className={css({ animation: 'spin 1s linear infinite', color: '#0075de' })} size={28} />
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={css({ minHeight: '100vh', bg: '#F7F8FA' })}>
        <CandidatePortalHeader />
        <main className={css({ maxWidth: '480px', margin: '0 auto', px: '24px', py: '80px', textAlign: 'center' })}>
          <div className={css({ p: '16px', bg: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA', color: '#991B1B', fontSize: '14px', fontWeight: '500', mb: '24px' })}>
            {error || "Session expired or application not found."}
          </div>
          <Link
            href="/careers/login"
            className={css({ display: 'inline-flex', px: '20px', py: '10px', borderRadius: '6px', bg: '#0075de', fontSize: '13px', fontWeight: '600', color: 'white', textDecoration: 'none' })}
          >
            Return to login
          </Link>
        </main>
      </div>
    );
  }

  const { candidate, allApplications = [] } = data;

  return (
    <div className={css({ minHeight: '100vh', bg: '#F7F8FA', color: '#111827', colorScheme: 'light', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' })}>
      <CandidatePortalHeader candidateName={candidate.name} candidateEmail={candidate.email} />

      <main className={css({ maxWidth: '1240px', margin: '0 auto', px: '24px', py: '32px', '@media (max-width: 767px)': { px: '16px' } })}>
        {/* Page header */}
        <div className={css({ mb: '32px' })}>
          <h1 className={css({ fontSize: '24px', fontWeight: '600', color: '#111827', mb: '4px' })}>
            Your applications
          </h1>
          <p className={css({ fontSize: '14px', color: '#6B7280' })}>
            {candidate.name} · {candidate.email}
          </p>
        </div>

        {/* Applications grid */}
        <div className={css({
          display: 'grid',
          gap: '32px',
          gridTemplateColumns: '1fr',
          '@media (min-width: 1024px)': {
            gridTemplateColumns: 'minmax(0, 1fr) 320px',
            gap: '40px',
          }
        })}>
          {/* Main content */}
          <div>
            <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '16px' })}>
              <h2 className={css({ fontSize: '16px', fontWeight: '600', color: '#111827' })}>Applications</h2>
              <span className={css({ fontSize: '13px', color: '#9CA3AF' })}>{allApplications.length} total</span>
            </div>

            <div className={css({ display: 'flex', flexDirection: 'column', gap: '1px' })}>
              {allApplications.map((app: any) => {
                const current = Math.max(0, stageKeys.indexOf(String(app.stage || "applied").toLowerCase()));
                return (
                  <article
                    key={app.id}
                    className={css({
                      bg: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      p: '20px 24px',
                      mb: '12px',
                      transition: 'border-color 150ms ease, box-shadow 150ms ease',
                      _hover: { borderColor: '#CBD5E1', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)' },
                    })}
                  >
                    {/* Title row */}
                    <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', mb: '8px' })}>
                      <div>
                        <span className={css({ fontSize: '12px', fontWeight: '500', color: '#64748B', fontFamily: 'monospace' })}>{app.reference}</span>
                        <h3 className={css({ fontSize: '16px', fontWeight: '600', color: '#111827', mt: '2px' })}>{app.jobTitle}</h3>
                      </div>
                      <span className={css({
                        display: 'inline-flex',
                        px: '10px',
                        py: '3px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        bg: '#F3F4F6',
                        color: '#374151',
                        flexShrink: 0,
                      })}>
                        {app.stage || "Applied"}
                      </span>
                    </div>

                    <p className={css({ fontSize: '13px', color: '#64748B', mb: '20px' })}>
                      Applied {new Date(app.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>

                    {/* Stepper */}
                    <div className={css({ display: 'flex', alignItems: 'center', mb: '20px', gap: '0' })}>
                      {stages.map((stage, index) => (
                        <React.Fragment key={stage}>
                          <div className={css({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '0', flex: index === stages.length - 1 ? '0 0 auto' : '0 0 auto' })}>
                            <span className={css({
                              display: 'flex',
                              width: '22px',
                              height: '22px',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '9999px',
                              fontSize: '10px',
                              fontWeight: '600',
                              flexShrink: 0,
                              ...(index < current
                                ? { bg: '#374151', color: 'white' }
                                : index === current
                                  ? { bg: '#0075de', color: 'white' }
                                  : { bg: 'white', border: '1.5px solid #D1D5DB', color: '#9CA3AF' }),
                            })}>
                              {index < current ? <Check size={11} strokeWidth={3} /> : index + 1}
                            </span>
                            <span className={css({
                              fontSize: '10px',
                              fontWeight: '500',
                              color: index === current ? '#0075de' : '#9CA3AF',
                              display: 'none',
                              '@media (min-width: 640px)': { display: 'block' },
                              whiteSpace: 'nowrap',
                            })}>
                              {stage}
                            </span>
                          </div>
                          {index < stages.length - 1 && (
                            <span className={css({
                              flex: '1',
                              height: '1px',
                              minWidth: '8px',
                              bg: index < current ? '#374151' : '#E5E7EB',
                              mx: '4px',
                            })} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* View button */}
                    <div className={css({ display: 'flex', justifyContent: 'flex-end' })}>
                      <Link
                        href={`/careers/applications/${encodeURIComponent(app.id)}`}
                        className={css({
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#0075de',
                          textDecoration: 'none',
                          _hover: { textDecoration: 'underline' },
                        })}
                      >
                        View application <ChevronRight size={14} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <aside className={css({ display: 'flex', flexDirection: 'column', gap: '24px' })}>
            {/* Candidate info */}
            <div>
              <h2 className={css({ fontSize: '14px', fontWeight: '600', color: '#111827', mb: '16px' })}>Account</h2>
              <dl className={css({ display: 'flex', flexDirection: 'column', gap: '12px' })}>
                <div className={css({ display: 'flex', justifyContent: 'space-between', gap: '12px' })}>
                  <dt className={css({ fontSize: '13px', color: '#9CA3AF' })}>Name</dt>
                  <dd className={css({ fontSize: '13px', fontWeight: '500', color: '#111827' })}>{candidate.name}</dd>
                </div>
                <div className={css({ display: 'flex', justifyContent: 'space-between', gap: '12px' })}>
                  <dt className={css({ fontSize: '13px', color: '#9CA3AF' })}>Email</dt>
                  <dd className={css({ fontSize: '13px', fontWeight: '500', color: '#111827', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{candidate.email}</dd>
                </div>
                <div className={css({ display: 'flex', justifyContent: 'space-between', gap: '12px' })}>
                  <dt className={css({ fontSize: '13px', color: '#9CA3AF' })}>Applications</dt>
                  <dd className={css({ fontSize: '13px', fontWeight: '500', color: '#111827' })}>{allApplications.length}</dd>
                </div>
              </dl>
            </div>

            <div className={css({ borderTop: '1px solid #E5E7EB', pt: '24px' })}>
              <h2 className={css({ fontSize: '14px', fontWeight: '600', color: '#111827', mb: '8px' })}>Need help?</h2>
              <p className={css({ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' })}>
                Contact the recruitment team at{' '}
                <a href="mailto:recruitment@growxlabs.tech" className={css({ color: '#0075de', textDecoration: 'none' })}>
                  recruitment@growxlabs.tech
                </a>
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
