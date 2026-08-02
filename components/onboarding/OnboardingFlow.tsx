"use client";

import { useRef, useState } from "react";
import { css, cx } from "@/styled-system/css";
import { DocumentActionBar } from "@/components/document/DocumentActionBar";
import { DocumentFooter } from "@/components/document/DocumentFooter";
import { DocumentHeader } from "@/components/document/DocumentHeader";
import { DocumentContainer, DocumentShell } from "@/components/document/DocumentShell";

type AssessmentData = Record<string, string | string[]>;
type UploadedAsset = { id: string; name: string; size: number; type: string; version: number };

const SECTIONS = [
  ["Company Profile", "Establish the organisation, its leadership contact and operating footprint."],
  ["Business Overview", "Document how the organisation creates value and serves its markets."],
  ["Business Challenges", "Identify the commercial and operational constraints requiring attention."],
  ["Current Technology Landscape", "Create an inventory of systems currently supporting the business."],
  ["Digital Presence Assessment", "Review the organisation's owned, social and paid digital channels."],
  ["Business Objectives", "Prioritise the outcomes expected from this consulting engagement."],
  ["Project Scope", "Define the services and capabilities required from GrowXLabs."],
  ["Commercial Information", "Align investment expectations, timing and decision authority."],
  ["Operational Information", "Capture the operating model, network and internal workflow."],
  ["Documentation & Assets", "Provide the materials required for discovery and solution design."],
  ["Project Readiness Review", "Confirm stakeholder, commercial and delivery readiness."],
  ["Executive Declaration & Final Review", "Review the assessment and formally authorise submission."],
] as const;

const CHALLENGES = ["Lead Generation", "Branding", "Website", "CRM", "Sales", "Inventory", "Distribution", "Dealer Network", "Marketing", "SEO", "Operations", "Reporting", "Customer Experience", "Automation", "Other"];
const OBJECTIVES = ["Increase Revenue", "Generate More Leads", "Expand Distribution", "Launch New Products", "Improve Operations", "Reduce Manual Work", "Improve Customer Experience", "Digital Transformation", "Improve Brand Position"];
const SERVICES = ["Website", "Branding", "CRM", "Custom Software", "Dealer Management", "Distributor Management", "Inventory", "ERP", "Automation", "SEO", "AEO", "GEO", "Google Ads", "Meta Ads", "Video Marketing", "Analytics", "Training", "Support"];
const READINESS = ["Business Goals Defined", "Stakeholders Identified", "Budget Approved", "Timeline Confirmed", "Assets Ready", "Decision Makers Confirmed"];

const field = css({ display: "grid", gap: "7px" });
const label = css({ color: "#273348", fontSize: "12px", fontWeight: "650", letterSpacing: "0.025em" });
const input = css({ width: "100%", minH: "44px", border: "1px solid #cfd6df", borderRadius: "4px", bg: "#fff", color: "#152033", px: "13px", fontSize: "14px", outline: "none", transition: "border-color .15s, box-shadow .15s", _focus: { borderColor: "#1d4f7a", boxShadow: "0 0 0 3px rgba(29,79,122,.10)" }, _placeholder: { color: "#8993a3" } });
const textarea = cx(input, css({ minH: "116px", py: "11px", resize: "vertical" }));
const grid2 = css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "repeat(2,minmax(0,1fr))" }, gap: "20px" });
const optionGrid = css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "repeat(2,minmax(0,1fr))", md: "repeat(3,minmax(0,1fr))" }, gap: "9px" });

export default function OnboardingFlow() {
  const [section, setSection] = useState(0);
  const [data, setData] = useState<AssessmentData>({ assessment_date: new Date().toISOString().slice(0, 10) });
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const selected = (key: string) => Array.isArray(data[key]) ? data[key] as string[] : [];
  const setValue = (key: string, value: string | string[]) => setData((current) => ({ ...current, [key]: value }));
  const toggle = (key: string, value: string) => setValue(key, selected(key).includes(value) ? selected(key).filter((item) => item !== value) : [...selected(key), value]);
  const progress = ((section + 1) / SECTIONS.length) * 100;

  const summary = {
    company: String(data.business_name || "Not provided"),
    contact: [data.primary_contact, data.designation, data.business_email].filter(Boolean).join(" · ") || "Not provided",
    objectives: selected("objectives"), services: selected("services"),
    timeline: String(data.timeline || "Not selected"), budget: String(data.budget || "Not selected"),
  };

  function saveDraft() {
    localStorage.setItem("growxlabs-business-assessment-draft", JSON.stringify({ data, assets, section, savedAt: new Date().toISOString() }));
    setMessage("Draft saved on this device.");
  }

  function loadDraft() {
    const raw = localStorage.getItem("growxlabs-business-assessment-draft");
    if (!raw) return setMessage("No saved draft was found on this device.");
    const draft = JSON.parse(raw) as { data?: AssessmentData; assets?: UploadedAsset[]; section?: number };
    if (draft.data) setData(draft.data);
    if (draft.assets) setAssets(draft.assets);
    if (typeof draft.section === "number") setSection(Math.min(draft.section, 11));
    setMessage("Draft restored.");
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    setAssets((current) => [...current, ...Array.from(files).map((file) => ({ id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type || "Document", version: 1 }))]);
  }

  async function submitAssessment() {
    if (!data.consent || !data.signature_name || !data.business_name || !data.business_email) {
      setMessage("Complete the company, signature and consent fields before submission."); return;
    }
    setSubmitting(true); setMessage("");
    try {
      const response = await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, assets }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Submission failed");
      localStorage.removeItem("growxlabs-business-assessment-draft"); setSubmitted(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Submission failed. Please try again."); }
    finally { setSubmitting(false); }
  }

  if (submitted) return <Success />;

  return (
    <DocumentShell>
      <DocumentHeader />
      <main>
      <DocumentContainer className={css({ pt: { base: "20px", md: "34px" } })}>
        <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "end", mb: "9px" })}><div><span className={css({ color: "#1d4f7a", fontSize: "11px", fontWeight: "750", letterSpacing: ".12em", textTransform: "uppercase" })}>Section {section + 1} of 12</span><div className={css({ fontSize: "13px", color: "#596578", mt: "3px" })}>{SECTIONS[section][0]}</div></div><span className={css({ color: "#7b8491", fontSize: "12px" })}>{Math.round(progress)}% complete</span></div>
        <div className={css({ h: "3px", bg: "#d9dee5", mb: "24px" })}><div className={css({ h: "100%", bg: "#1d4f7a", transition: "width .25s" })} style={{ width: `${progress}%` }} /></div>

        <form onSubmit={(event) => event.preventDefault()} className={css({ bg: "#fff", border: "1px solid #d9dee5", borderRadius: "6px 6px 0 0", boxShadow: "0 8px 28px rgba(28,39,54,.045)" })}>
          <div className={css({ px: { base: "20px", md: "46px" }, py: { base: "28px", md: "42px" }, borderBottom: "1px solid #e2e6eb" })}><div className={css({ color: "#7c8796", fontSize: "11px", fontWeight: "700", letterSpacing: ".12em", textTransform: "uppercase", mb: "8px" })}>GrowXLabs Consulting Assessment</div><h2 className={css({ fontFamily: "Georgia, serif", fontSize: { base: "27px", md: "34px" }, fontWeight: "500" })}>{SECTIONS[section][0]}</h2><p className={css({ color: "#657184", fontSize: "14px", lineHeight: "1.7", mt: "9px", maxW: "650px" })}>{SECTIONS[section][1]}</p></div>
          <div className={cx("assessment-section", css({ px: { base: "20px", md: "46px" }, py: { base: "28px", md: "38px" }, display: "grid", gap: "26px" }))}>{renderSection(section, data, setValue, selected, toggle, assets, addFiles, setAssets, fileInput, summary)}</div>
          {message && <div role={section === 11 ? "alert" : "status"} className={css({ mx: { base: "20px", md: "46px" }, mb: "24px", borderLeft: "3px solid #9a6425", bg: "#fbf7f0", color: "#65451e", px: "14px", py: "11px", fontSize: "13px", lineHeight: "1.55" })}>{message}</div>}
        </form>
        <DocumentActionBar section={section} submitting={submitting} onPrevious={() => setSection((value) => Math.max(0, value - 1))} onSave={saveDraft} onNext={() => { setSection((value) => Math.min(11, value + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} onSubmit={submitAssessment} />
        <DocumentFooter section={section} progress={progress} onRestoreDraft={loadDraft} />
      </DocumentContainer>
      </main>
    </DocumentShell>
  );
}

function TextField({ name, title, data, setValue, type = "text", required = false }: { name: string; title: string; data: AssessmentData; setValue: (key: string, value: string) => void; type?: string; required?: boolean }) { return <label className={field}><span className={label}>{title}{required && " *"}</span><input className={input} name={name} type={type} required={required} value={String(data[name] || "")} onChange={(e) => setValue(name, e.target.value)} /></label>; }
function TextArea({ name, title, data, setValue, rows = 5 }: { name: string; title: string; data: AssessmentData; setValue: (key: string, value: string) => void; rows?: number }) { return <label className={field}><span className={label}>{title}</span><textarea className={textarea} rows={rows} value={String(data[name] || "")} onChange={(e) => setValue(name, e.target.value)} /></label>; }
function SelectField({ name, title, options, data, setValue }: { name: string; title: string; options: string[]; data: AssessmentData; setValue: (key: string, value: string) => void }) { return <label className={field}><span className={label}>{title}</span><select className={input} value={String(data[name] || "")} onChange={(e) => setValue(name, e.target.value)}><option value="">Select an option</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function Options({ name, options, selected, toggle }: { name: string; options: string[]; selected: (key: string) => string[]; toggle: (key: string, value: string) => void }) { return <fieldset><legend className={label}>Select all that apply</legend><div className={cx(optionGrid, css({ mt: "10px" }))}>{options.map((option) => <label key={option} className={css({ display: "flex", alignItems: "center", gap: "9px", border: "1px solid #d7dde5", borderRadius: "4px", px: "12px", py: "11px", color: "#344154", fontSize: "13px", cursor: "pointer", bg: selected(name).includes(option) ? "#eef4f8" : "#fff" })}><input type="checkbox" checked={selected(name).includes(option)} onChange={() => toggle(name, option)} className={css({ accentColor: "#173f63" })} />{option}</label>)}</div></fieldset>; }

function renderSection(section: number, data: AssessmentData, setValue: (key: string, value: string | string[]) => void, selected: (key: string) => string[], toggle: (key: string, value: string) => void, assets: UploadedAsset[], addFiles: (files: FileList | null) => void, setAssets: React.Dispatch<React.SetStateAction<UploadedAsset[]>>, fileInput: React.RefObject<HTMLInputElement | null>, summary: { company: string; contact: string; objectives: string[]; services: string[]; timeline: string; budget: string }) {
  const sf = (key: string, value: string) => setValue(key, value);
  if (section === 0) return <><div className={grid2}><TextField name="business_name" title="Business / Company Name" data={data} setValue={sf} required /><TextField name="legal_entity_name" title="Legal Entity Name" data={data} setValue={sf} /><TextField name="industry" title="Industry" data={data} setValue={sf} /><TextField name="primary_contact" title="Primary Contact" data={data} setValue={sf} required /><TextField name="designation" title="Designation" data={data} setValue={sf} /><TextField name="business_email" title="Business Email" type="email" data={data} setValue={sf} required /><TextField name="phone" title="Phone" type="tel" data={data} setValue={sf} /><TextField name="website" title="Website" type="url" data={data} setValue={sf} /><TextField name="headquarters" title="Headquarters" data={data} setValue={sf} /><TextField name="operating_regions" title="Operating Regions" data={data} setValue={sf} /><TextField name="employee_count" title="Number of Employees" data={data} setValue={sf} /><TextField name="years_in_business" title="Years in Business" data={data} setValue={sf} /></div></>;
  if (section === 1) return <><TextArea name="company_overview" title="Company Overview" data={data} setValue={sf} /><div className={grid2}><TextArea name="products" title="Products" data={data} setValue={sf} /><TextArea name="services_overview" title="Services" data={data} setValue={sf} /><TextArea name="primary_customers" title="Primary Customers" data={data} setValue={sf} /><TextArea name="business_model" title="Business Model" data={data} setValue={sf} /></div><SelectField name="annual_revenue" title="Annual Revenue Range" options={["Pre-revenue", "Below ₹1 crore", "₹1–5 crore", "₹5–25 crore", "₹25–100 crore", "₹100 crore+"]} data={data} setValue={sf} /><TextArea name="markets_served" title="Markets Served" data={data} setValue={sf} /><TextArea name="competitive_advantage" title="Competitive Advantage" data={data} setValue={sf} /></>;
  if (section === 2) return <><Options name="challenges" options={CHALLENGES} selected={selected} toggle={toggle} /><TextArea name="biggest_challenge" title="Describe your biggest business challenge." data={data} setValue={sf} rows={7} /></>;
  if (section === 3) return <div className={grid2}>{["Website", "CRM", "ERP", "Inventory", "Accounting", "Marketing Tools", "Hosting", "Analytics", "Email Platform", "Integrations"].map((item) => <TextArea key={item} name={`technology_${item.toLowerCase().replaceAll(" ", "_")}`} title={item} data={data} setValue={sf} rows={3} />)}</div>;
  if (section === 4) return <div className={grid2}>{["Website URL", "Google Business Profile", "Instagram", "Facebook", "LinkedIn", "YouTube", "Google Analytics", "Search Console", "Google Ads", "Meta Ads", "SEO Status"].map((item) => <TextField key={item} name={`digital_${item.toLowerCase().replaceAll(" ", "_")}`} title={item} data={data} setValue={sf} />)}</div>;
  if (section === 5) return <><Options name="objectives" options={OBJECTIVES} selected={selected} toggle={toggle} /><SelectField name="objective_priority" title="Overall Priority" options={["High", "Medium", "Low"]} data={data} setValue={sf} /></>;
  if (section === 6) return <Options name="services" options={SERVICES} selected={selected} toggle={toggle} />;
  if (section === 7) return <div className={grid2}><SelectField name="budget" title="Estimated Investment" options={["< ₹5 lakh", "₹5–10 lakh", "₹10–25 lakh", "₹25 lakh+"]} data={data} setValue={sf} /><SelectField name="timeline" title="Timeline" options={["Immediate", "30 Days", "60 Days", "90 Days", "Planning Stage"]} data={data} setValue={sf} /><SelectField name="decision_maker" title="Decision Maker" options={["Owner", "CEO", "Director", "Marketing Head", "Operations Head", "IT Head"]} data={data} setValue={sf} /></div>;
  if (section === 8) return <div className={grid2}>{["Sales Process", "Lead Sources", "Current Team", "Warehouses", "Branches", "Distribution Regions", "Dealer Network", "Current Challenges", "Internal Workflow"].map((item) => <TextArea key={item} name={`operations_${item.toLowerCase().replaceAll(" ", "_")}`} title={item} data={data} setValue={sf} rows={3} />)}</div>;
  if (section === 9) return <><div onClick={() => fileInput.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }} className={css({ border: "1px dashed #9ba8b7", borderRadius: "4px", bg: "#fafbfc", py: "42px", px: "20px", textAlign: "center", cursor: "pointer" })}><strong className={css({ display: "block", fontSize: "14px" })}>Select or drop discovery documents</strong><span className={css({ display: "block", color: "#748092", fontSize: "12px", mt: "6px" })}>Logo, brand guidelines, catalogues, profiles, presentations, media and certificates</span><input ref={fileInput} hidden multiple type="file" onChange={(e) => addFiles(e.target.files)} /></div><div className={css({ display: "grid", gap: "8px" })}>{assets.map((asset) => <div key={asset.id} className={css({ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e6eb", py: "11px", fontSize: "13px" })}><div><strong>{asset.name}</strong><span className={css({ color: "#788393", ml: "10px" })}>Version {asset.version} · {(asset.size / 1024).toFixed(1)} KB</span></div><button type="button" onClick={() => setAssets((current) => current.filter((item) => item.id !== asset.id))} className={css({ color: "#8a3030", fontSize: "12px", cursor: "pointer" })}>Remove</button></div>)}</div></>;
  if (section === 10) return <><Options name="readiness" options={READINESS} selected={selected} toggle={toggle} /><TextArea name="additional_notes" title="Additional Notes" data={data} setValue={sf} /><TextArea name="questions" title="Questions" data={data} setValue={sf} /><TextArea name="comments" title="Comments" data={data} setValue={sf} /><TextArea name="dependencies" title="Dependencies" data={data} setValue={sf} /></>;
  return <><div className={css({ border: "1px solid #ccd3dc" })}>{[["Business", summary.company], ["Primary Contact", summary.contact], ["Selected Services", summary.services.join(", ") || "None selected"], ["Project Objectives", summary.objectives.join(", ") || "None selected"], ["Estimated Timeline", summary.timeline], ["Budget Range", summary.budget], ["Uploaded Assets", `${assets.length} document(s)`]].map(([key, value]) => <div key={key} className={css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "190px 1fr" }, borderBottom: "1px solid #e2e6eb", _last: { borderBottom: "0" } })}><div className={css({ bg: "#f4f6f8", px: "15px", py: "12px", fontSize: "12px", fontWeight: "700" })}>{key}</div><div className={css({ px: "15px", py: "12px", color: "#4f5c6f", fontSize: "13px" })}>{value}</div></div>)}</div><section className={css({ borderTop: "2px solid #25364b", pt: "26px", mt: "8px" })}><h3 className={css({ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "500" })}>Executive Declaration</h3><p className={css({ color: "#4f5c6f", fontSize: "13px", lineHeight: "1.75", mt: "12px" })}>I confirm that the information provided in this assessment is accurate to the best of my knowledge and will be used by GrowXLabs for business discovery, consulting analysis, solution design, proposal preparation, and project planning.</p><div className={cx(grid2, css({ mt: "24px" }))}><TextField name="signature_name" title="Digital Signature — Typed Full Name" data={data} setValue={sf} required /><TextField name="signature_designation" title="Designation" data={data} setValue={sf} /><TextField name="assessment_date" title="Date" type="date" data={data} setValue={sf} /></div><label className={css({ display: "flex", gap: "10px", alignItems: "flex-start", mt: "22px", fontSize: "13px", lineHeight: "1.6", color: "#3d4a5d" })}><input type="checkbox" checked={data.consent === "yes"} onChange={(e) => setValue("consent", e.target.checked ? "yes" : "")} className={css({ mt: "4px", accentColor: "#173f63" })} />I provide my consent for GrowXLabs to process this assessment for the stated consulting purposes.</label></section></>;
}

function Success() { const steps = ["Internal Business Review", "Discovery Meeting", "Technology Assessment", "Consulting Recommendations", "Commercial Proposal", "Project Kickoff"]; return <main className={css({ minH: "100vh", bg: "#f3f5f7", color: "#152033", px: "20px", py: { base: "50px", md: "90px" } })}><article className={css({ maxW: "760px", mx: "auto", bg: "#fff", border: "1px solid #d5dbe3", px: { base: "24px", md: "58px" }, py: { base: "36px", md: "56px" } })}><div className={css({ color: "#1d5f4a", fontSize: "12px", fontWeight: "750", letterSpacing: ".12em", textTransform: "uppercase" })}>Submission confirmed</div><h1 className={css({ fontFamily: "Georgia, serif", fontSize: { base: "31px", md: "40px" }, fontWeight: "500", mt: "12px" })}>Business Discovery Assessment Submitted</h1><p className={css({ color: "#566376", fontSize: "15px", lineHeight: "1.75", mt: "18px" })}>Thank you. Our consulting team will now begin reviewing your business.</p><h2 className={css({ fontSize: "13px", letterSpacing: ".1em", textTransform: "uppercase", mt: "38px", mb: "12px" })}>Next steps</h2><ol className={css({ borderTop: "1px solid #d9dee5" })}>{steps.map((step, index) => <li key={step} className={css({ display: "grid", gridTemplateColumns: "36px 1fr", py: "13px", borderBottom: "1px solid #e2e6eb", fontSize: "14px" })}><span className={css({ color: "#7b8695" })}>{String(index + 1).padStart(2, "0")}</span>{step}</li>)}</ol><div className={css({ mt: "30px", bg: "#f4f6f8", borderLeft: "3px solid #173f63", px: "17px", py: "14px" })}><div className={css({ color: "#748092", fontSize: "11px", textTransform: "uppercase", letterSpacing: ".1em" })}>Estimated review time</div><strong className={css({ display: "block", mt: "4px", fontSize: "15px" })}>2–3 Business Days</strong></div></article></main>; }
