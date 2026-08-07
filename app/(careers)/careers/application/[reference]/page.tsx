"use client";

import React, { useState, useEffect, use } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { css } from "@/styled-system/css";

import { CandidatePortalHeader } from "@/components/careers/CandidatePortalHeader";
import { ApplicationHeader } from "@/components/careers/ApplicationHeader";
import { ApplicationStepper } from "@/components/careers/ApplicationStepper";
import { ContentGrid } from "@/components/careers/ContentGrid";
import { ApplicationActivity } from "@/components/careers/ApplicationActivity";
import { InterviewSection } from "@/components/careers/InterviewSection";
import { AssessmentSection } from "@/components/careers/AssessmentSection";
import { OfferSection } from "@/components/careers/OfferSection";
import { MessagesSection } from "@/components/careers/MessagesSection";
import { ApplicationDetails } from "@/components/careers/ApplicationDetails";
import { DocumentsSection } from "@/components/careers/DocumentsSection";
import { ContactDetails } from "@/components/careers/ContactDetails";
import { ProfileDrawer } from "@/components/careers/ProfileDrawer";

export default function CandidateApplicationPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const pathname = usePathname();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  // Modals / Drawers
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [preferredTimes, setPreferredTimes] = useState("");

  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: "",
    address: "",
    linkedInURL: "",
    portfolioURL: "",
  });

  const [offerNotes, setOfferNotes] = useState("");

  useEffect(() => {
    fetchApplicationDetails();
    const interval = setInterval(() => fetchApplicationDetails(true), 30000);
    return () => clearInterval(interval);
  }, [reference]);

  const fetchApplicationDetails = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const url = `/api/v1/candidate/portal?reference=${encodeURIComponent(reference)}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load application details");

      setData(json);
      if (pathname.startsWith("/careers/application/") && json.application?.id) router.replace(`/careers/applications/${json.application.id}`);
      if (json.candidate) {
        setProfileForm({
          phone: json.candidate.phone || "",
          address: json.candidate.location || "",
          linkedInURL: json.candidate.linkedInURL || "",
          portfolioURL: json.candidate.portfolioURL || "",
        });
      }
    } catch (err: any) {
      if (!isBackground) setError(err.message || "Failed to load application details");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.interviews?.[0]?.id || !rescheduleReason) return;

    try {
      setActionLoading(true);
      setActionMsg("");
      const res = await fetch("/api/v1/candidate/interviews/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: data.interviews[0].id,
          applicationId: data.application.id,
          reason: rescheduleReason,
          preferredTimes,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit request");

      setActionMsg("Reschedule request submitted to HR team.");
      setShowRescheduleModal(false);
      fetchApplicationDetails();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOfferDecision = async (decision: "accepted" | "rejected") => {
    try {
      setActionLoading(true);
      setActionMsg("");
      const res = await fetch("/api/v1/candidate/offers/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: data?.offer?.id,
          applicationId: data?.application?.id,
          decision,
          notes: offerNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to record offer decision");

      setActionMsg(`Offer ${decision} successfully.`);
      fetchApplicationDetails();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setActionMsg("");
      const res = await fetch("/api/v1/candidate/portal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          ...profileForm,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update profile");

      setActionMsg("Profile updated successfully.");
      setShowProfileDrawer(false);
      fetchApplicationDetails();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className={css({ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bg: '#F7F8FA' })}>
        <Loader2 className={css({ animation: 'spin 1s linear infinite', color: '#0075de' })} size={28} />
      </main>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className={css({ minHeight: '100vh', bg: '#F7F8FA' })}>
        <CandidatePortalHeader />
        <main className={css({ maxWidth: '480px', margin: '0 auto', py: '80px', px: '24px', textAlign: 'center' })}>
          <div className={css({ p: '16px', bg: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA', color: '#991B1B', fontSize: '14px', fontWeight: '500', mb: '24px' })}>
            {error || "Application not found."}
          </div>
          <Link
            href="/careers/login"
            className={css({ display: 'inline-flex', alignItems: 'center', gap: '8px', px: '20px', py: '10px', borderRadius: '6px', bg: '#0075de', color: 'white', fontSize: '13px', fontWeight: '600', textDecoration: 'none' })}
          >
            Return to login
          </Link>
        </main>
      </div>
    );
  }

  const { candidate, application, timeline = [], interviews = [], messages = [], offer, rescheduleRequests = [], documents = [] } = data;

  return (
    <div className={css({ minHeight: '100vh', bg: '#F7F8FA', color: '#111827', colorScheme: 'light', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' })}>
      <CandidatePortalHeader candidateName={candidate.name} candidateEmail={candidate.email} />

      <main className={css({ maxWidth: '1240px', margin: '0 auto', px: '24px', py: '32px', '@media (max-width: 767px)': { px: '16px' } })}>
        {/* Action message */}
        {actionMsg && (
          <div className={css({
            p: '12px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            mb: '24px',
            border: '1px solid',
            ...(actionMsg.startsWith("Error")
              ? { bg: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }
              : { bg: '#ECFDF5', borderColor: '#A7F3D0', color: '#065F46' })
          })}>
            {actionMsg}
          </div>
        )}

        {/* Breadcrumb */}
        <div className={css({ mb: '24px' })}>
          <Link
            href="/careers/portal"
            className={css({ fontSize: '13px', fontWeight: '500', color: '#6B7280', textDecoration: 'none', _hover: { color: '#111827' } })}
          >
            ← All applications
          </Link>
        </div>

        {/* Application Header */}
        <ApplicationHeader
          jobTitle={application.jobTitle}
          jobDepartment={application.jobDepartment}
          candidateName={candidate.name}
          applicationReference={application.reference}
          appliedAt={new Date(application.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          updatedAt={new Date(application.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          currentStage={application.stage}
          onEditProfile={() => setShowProfileDrawer(true)}
        />

        {/* Stepper */}
        <div className={css({ mb: '40px', borderBottom: '1px solid #E5E7EB', pb: '8px' })}>
          <ApplicationStepper timeline={timeline} currentStage={application.stage} />
        </div>

        {/* Content Grid */}
        <ContentGrid>
          {/* Main content */}
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '32px' })}>
            {/* Interview Section */}
            {interviews.length > 0 && (
              <section className={css({ pb: '32px', borderBottom: '1px solid #E5E7EB' })}>
                <h2 className={css({ fontSize: '16px', fontWeight: '600', color: '#111827', mb: '16px' })}>Interview</h2>
                {interviews.map((inv: any, idx: number) => {
                  const scheduledAt = new Date(inv.scheduled_at);
                  return (
                    <div key={inv.id || idx} className={css({ mb: idx < interviews.length - 1 ? '24px' : '0' })}>
                      <div className={css({ fontSize: '14px', fontWeight: '500', color: '#111827', mb: '4px' })}>
                        {scheduledAt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className={css({ fontSize: '13px', color: '#6B7280', mb: '16px' })}>
                        {scheduledAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {inv.duration_minutes || 30} minutes · {inv.meeting_provider || 'Google Meet'}
                      </div>

                      <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '8px', mb: '12px' })}>
                        {inv.is_join_enabled && inv.meeting_link ? (
                          <a
                            href={inv.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={css({ display: 'inline-flex', alignItems: 'center', gap: '6px', bg: '#0075de', color: 'white', fontSize: '13px', fontWeight: '600', borderRadius: '6px', px: '16px', height: '34px', textDecoration: 'none', cursor: 'pointer' })}
                          >
                            Join interview
                          </a>
                        ) : null}

                        <a
                          href={inv.google_calendar_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={css({ display: 'inline-flex', alignItems: 'center', gap: '6px', bg: 'transparent', color: '#111827', fontSize: '13px', fontWeight: '500', borderRadius: '6px', border: '1px solid #D1D5DB', px: '16px', height: '34px', textDecoration: 'none', cursor: 'pointer' })}
                        >
                          Add to Google Calendar
                        </a>

                        <button
                          onClick={() => setShowRescheduleModal(true)}
                          className={css({ bg: 'transparent', color: '#111827', fontSize: '13px', fontWeight: '500', borderRadius: '6px', border: '1px solid #D1D5DB', px: '16px', height: '34px', cursor: 'pointer' })}
                        >
                          Request reschedule
                        </button>
                      </div>

                      {!inv.is_join_enabled && (
                        <div className={css({ fontSize: '13px', color: '#9CA3AF' })}>
                          The join link will be available 15 minutes before your interview.
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            )}

            {/* Offer Section */}
            {offer && (
              <section className={css({ pb: '32px', borderBottom: '1px solid #E5E7EB' })}>
                <OfferSection
                  offer={offer}
                  documents={documents}
                  offerNotes={offerNotes}
                  onOfferNotesChange={setOfferNotes}
                  onOfferDecision={handleOfferDecision}
                  actionLoading={actionLoading}
                />
              </section>
            )}

            {/* Activity Timeline */}
            <section className={css({ pb: '32px', borderBottom: '1px solid #E5E7EB' })}>
              <ApplicationActivity
                timeline={timeline}
                interviews={interviews}
                messages={messages}
              />
            </section>

            {/* Messages */}
            <section>
              <MessagesSection messages={messages} />
            </section>
          </div>

          {/* Sidebar */}
          <aside className={css({ display: 'flex', flexDirection: 'column', gap: '32px' })}>
            <ApplicationDetails
              applicationId={application.reference}
              appliedAt={new Date(application.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              currentStage={application.stage}
              updatedAt={new Date(application.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            />

            <div className={css({ borderTop: '1px solid #E5E7EB', pt: '24px' })}>
              <DocumentsSection documents={documents} />
            </div>

            <div className={css({ borderTop: '1px solid #E5E7EB', pt: '24px' })}>
              <ContactDetails
                email={candidate.email}
                phone={candidate.phone}
                location={candidate.location}
                linkedInURL={candidate.linkedInURL}
                portfolioURL={candidate.portfolioURL}
              />
            </div>
          </aside>
        </ContentGrid>
      </main>

      {/* Profile Drawer */}
      <ProfileDrawer
        open={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        profileForm={profileForm}
        onFormChange={setProfileForm}
        onSubmit={handleUpdateProfile}
        loading={actionLoading}
      />

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className={css({ position: 'fixed', inset: '0', zIndex: 50, bg: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: '16px' })}>
          <div className={css({ bg: 'white', borderRadius: '8px', p: '24px', maxWidth: '440px', width: '100%' })}>
            <h3 className={css({ fontSize: '16px', fontWeight: '600', color: '#111827', mb: '20px' })}>Request reschedule</h3>
            <form onSubmit={handleRescheduleSubmit} className={css({ display: 'flex', flexDirection: 'column', gap: '16px' })}>
              <div>
                <label className={css({ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', mb: '6px' })}>Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Explain why you need to reschedule..."
                  className={css({ width: '100%', p: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', resize: 'vertical', outline: 'none', _focus: { borderColor: '#0075de' } })}
                />
              </div>

              <div>
                <label className={css({ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', mb: '6px' })}>Preferred alternate times</label>
                <input
                  type="text"
                  value={preferredTimes}
                  onChange={(e) => setPreferredTimes(e.target.value)}
                  placeholder="e.g. Next Tuesday after 2:00 PM IST"
                  className={css({ width: '100%', height: '42px', p: '0 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', outline: 'none', _focus: { borderColor: '#0075de' } })}
                />
              </div>

              <div className={css({ display: 'flex', gap: '8px', pt: '8px' })}>
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className={css({ flex: '1', height: '38px', borderRadius: '6px', border: '1px solid #D1D5DB', bg: 'white', fontSize: '13px', fontWeight: '500', color: '#374151', cursor: 'pointer' })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={css({ flex: '1', height: '38px', borderRadius: '6px', border: 'none', bg: '#0075de', fontSize: '13px', fontWeight: '600', color: 'white', cursor: 'pointer', _disabled: { opacity: 0.5 } })}
                >
                  Submit request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
