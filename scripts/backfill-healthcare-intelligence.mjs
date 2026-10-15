import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const args = process.argv.slice(2);
const value = (flag) => args[args.indexOf(flag) + 1];
const organisationId = value("--organisation-id");
const apply = args.includes("--apply");
if (!organisationId || !/^[0-9a-f-]{36}$/i.test(organisationId)) {
  throw new Error("Pass --organisation-id with the production organisation UUID");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase configuration is missing");
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const start = "2026-10-12T00:00:00+05:30";
const end = "2026-10-13T00:00:00+05:30";

const categories = {
  "Diabetes clinics": {
    te: "మధుమేహం మరియు హార్మోన్ వైద్య కేంద్రం",
    modelEn: "consultations, tests, and ongoing care programmes",
    modelTe: "సంప్రదింపులు, పరీక్షలు, మరియు నిరంతర చికిత్స కార్యక్రమాలు",
    workflowEn: "repeat visits, lab results, and care-plan follow-ups",
    workflowTe: "పునఃసందర్శనలు, ల్యాబ్ ఫలితాలు, మరియు చికిత్స ప్రణాళిక ఫాలో-అప్‌లు",
    questionEn: "How are repeat visits and test-result follow-ups scheduled today?",
    questionTe: "ప్రస్తుతం పునఃసందర్శనలు, పరీక్ష ఫలితాల ఫాలో-అప్‌లను ఎలా షెడ్యూల్ చేస్తున్నారు?",
  },
  "Physiotherapy centres": {
    te: "ఫిజియోథెరపీ మరియు పునరావాస కేంద్రం",
    modelEn: "assessments and multi-session therapy plans",
    modelTe: "ప్రాథమిక అంచనాలు మరియు పలు సెషన్ల థెరపీ ప్రణాళికలు",
    workflowEn: "session scheduling, attendance, and progress follow-ups",
    workflowTe: "సెషన్ షెడ్యూలింగ్, హాజరు, మరియు పురోగతి ఫాలో-అప్‌లు",
    questionEn: "How do you track missed therapy sessions and patient progress?",
    questionTe: "మిస్ అయిన థెరపీ సెషన్లు, రోగి పురోగతిని ఎలా నమోదు చేస్తున్నారు?",
  },
  "Small speciality hospitals": {
    te: "ప్రత్యేక వైద్య సేవల ఆసుపత్రి",
    modelEn: "outpatient visits, procedures, and inpatient care where offered",
    modelTe: "ఔట్‌పేషెంట్ సందర్శనలు, వైద్య ప్రక్రియలు, మరియు అందుబాటులో ఉన్న ఇన్‌పేషెంట్ సేవలు",
    workflowEn: "OPD registration, specialist scheduling, and post-discharge follow-ups",
    workflowTe: "ఓపీడీ నమోదు, నిపుణుల షెడ్యూలింగ్, మరియు డిశ్చార్జ్ తర్వాత ఫాలో-అప్‌లు",
    questionEn: "How are OPD appointments and follow-ups coordinated across specialties?",
    questionTe: "వివిధ విభాగాల ఓపీడీ అపాయింట్‌మెంట్లు, ఫాలో-అప్‌లను ఎలా సమన్వయం చేస్తున్నారు?",
  },
  "Multi-speciality clinics": {
    te: "బహుళ వైద్య విభాగాల కేంద్రం",
    modelEn: "consultations and procedures across several specialties",
    modelTe: "అనేక వైద్య విభాగాల్లో సంప్రదింపులు మరియు చికిత్సలు",
    workflowEn: "cross-specialty appointment routing and patient follow-ups",
    workflowTe: "విభాగాల మధ్య అపాయింట్‌మెంట్ సమన్వయం మరియు రోగి ఫాలో-అప్‌లు",
    questionEn: "How are enquiries routed to the right specialist and followed through?",
    questionTe: "విచారణలను సరైన నిపుణుడికి ఎలా పంపించి, తర్వాత ఎలా ఫాలో-అప్ చేస్తున్నారు?",
  },
  "Child / paediatric clinics": {
    te: "శిశు మరియు బాలల వైద్య కేంద్రం",
    modelEn: "paediatric consultations, preventive care, and follow-up visits",
    modelTe: "పిల్లల వైద్య సంప్రదింపులు, నివారణ సేవలు, మరియు తదుపరి సందర్శనలు",
    workflowEn: "parent communication, vaccination reminders, and review visits",
    workflowTe: "తల్లిదండ్రులతో సమాచార మార్పిడి, టీకా గుర్తింపులు, మరియు పునఃసందర్శనలు",
    questionEn: "How do parents receive vaccination and follow-up reminders?",
    questionTe: "టీకాలు, తదుపరి సందర్శనల గుర్తింపులు తల్లిదండ్రులకు ఎలా చేరుతున్నాయి?",
  },
  "Women / maternity clinics": {
    te: "మహిళల ఆరోగ్యం మరియు ప్రసూతి వైద్య కేంద్రం",
    modelEn: "women's health consultations, antenatal care, and procedures where offered",
    modelTe: "మహిళల ఆరోగ్య సంప్రదింపులు, గర్భధారణ సంరక్షణ, మరియు అందుబాటులో ఉన్న చికిత్సలు",
    workflowEn: "antenatal visit schedules, reports, and postnatal follow-ups",
    workflowTe: "గర్భధారణ సందర్శనల షెడ్యూల్, నివేదికలు, మరియు ప్రసవానంతర ఫాలో-అప్‌లు",
    questionEn: "How are antenatal visits and report follow-ups coordinated?",
    questionTe: "గర్భధారణ సందర్శనలు, నివేదికల ఫాలో-అప్‌లను ఎలా సమన్వయం చేస్తున్నారు?",
  },
  "Diagnostic centres": {
    te: "వైద్య నిర్ధారణ పరీక్షల కేంద్రం",
    modelEn: "diagnostic tests, imaging, and health checks where offered",
    modelTe: "నిర్ధారణ పరీక్షలు, ఇమేజింగ్, మరియు అందుబాటులో ఉన్న ఆరోగ్య తనిఖీలు",
    workflowEn: "test bookings, sample or scan slots, and report delivery",
    workflowTe: "పరీక్షల బుకింగ్‌లు, నమూనా లేదా స్కాన్ సమయాలు, మరియు నివేదికల పంపిణీ",
    questionEn: "How do patients and referring doctors receive reports and updates?",
    questionTe: "రోగులకు, సూచించిన వైద్యులకు నివేదికలు మరియు సమాచారం ఎలా అందుతోంది?",
  },
  "ENT clinics": {
    te: "చెవి, ముక్కు, గొంతు వైద్య కేంద్రం",
    modelEn: "ENT consultations, diagnostics, and procedures where offered",
    modelTe: "ఈఎన్‌టీ సంప్రదింపులు, పరీక్షలు, మరియు అందుబాటులో ఉన్న చికిత్సలు",
    workflowEn: "specialist appointments, diagnostic referrals, and post-procedure reviews",
    workflowTe: "నిపుణుల అపాయింట్‌మెంట్లు, పరీక్షల సూచనలు, మరియు చికిత్స తర్వాత సమీక్షలు",
    questionEn: "How are diagnostic referrals and post-procedure reviews tracked?",
    questionTe: "పరీక్షల సూచనలు, చికిత్స తర్వాత సమీక్షలను ఎలా ట్రాక్ చేస్తున్నారు?",
  },
  "Eye clinics": {
    te: "కంటి వైద్య కేంద్రం",
    modelEn: "eye consultations, tests, and procedures where offered",
    modelTe: "కంటి వైద్య సంప్రదింపులు, పరీక్షలు, మరియు అందుబాటులో ఉన్న చికిత్సలు",
    workflowEn: "screening bookings, surgery counselling, and post-operative reviews",
    workflowTe: "కంటి పరీక్షల బుకింగ్‌లు, శస్త్రచికిత్స సలహాలు, మరియు శస్త్రచికిత్స తర్వాత సమీక్షలు",
    questionEn: "How do screening enquiries become appointments and follow-up visits?",
    questionTe: "కంటి పరీక్షల విచారణలు అపాయింట్‌మెంట్లు, ఫాలో-అప్‌లుగా ఎలా మారుతున్నాయి?",
  },
  "Fertility / IVF clinics": {
    te: "సంతానోత్పత్తి మరియు ఐవీఎఫ్ వైద్య కేంద్రం",
    modelEn: "fertility consultations and multi-stage treatment plans",
    modelTe: "సంతానోత్పత్తి సంప్రదింపులు మరియు పలు దశల చికిత్స ప్రణాళికలు",
    workflowEn: "private enquiry handling, consultation scheduling, and treatment milestones",
    workflowTe: "గోప్యమైన విచారణల నిర్వహణ, సంప్రదింపుల షెడ్యూల్, మరియు చికిత్స దశలు",
    questionEn: "How are private enquiries followed up without losing patient confidentiality?",
    questionTe: "రోగుల గోప్యతను కాపాడుతూ వ్యక్తిగత విచారణలను ఎలా ఫాలో-అప్ చేస్తున్నారు?",
  },
  "Orthopaedic clinics": {
    te: "ఎముకలు మరియు కీళ్ల వైద్య కేంద్రం",
    modelEn: "orthopaedic consultations, procedures, and rehabilitation where offered",
    modelTe: "ఎముకలు, కీళ్ల వైద్య సంప్రదింపులు, చికిత్సలు, మరియు అందుబాటులో ఉన్న పునరావాస సేవలు",
    workflowEn: "referrals, procedure planning, and rehabilitation follow-ups",
    workflowTe: "వైద్య సూచనలు, చికిత్స ప్రణాళిక, మరియు పునరావాస ఫాలో-అప్‌లు",
    questionEn: "How are surgery enquiries and rehabilitation follow-ups tracked?",
    questionTe: "శస్త్రచికిత్స విచారణలు, పునరావాస ఫాలో-అప్‌లను ఎలా నమోదు చేస్తున్నారు?",
  },
  "Dental clinics": {
    te: "దంత వైద్య కేంద్రం",
    modelEn: "dental consultations, treatment plans, and procedures",
    modelTe: "దంత వైద్య సంప్రదింపులు, చికిత్స ప్రణాళికలు, మరియు చికిత్సలు",
    workflowEn: "appointment requests, treatment-plan acceptance, and recall visits",
    workflowTe: "అపాయింట్‌మెంట్ అభ్యర్థనలు, చికిత్స ప్రణాళిక ఆమోదం, మరియు పునఃసందర్శనలు",
    questionEn: "How do you follow up after a treatment estimate or a missed appointment?",
    questionTe: "చికిత్స అంచనా ఇచ్చిన తర్వాత లేదా అపాయింట్‌మెంట్ మిస్ అయినప్పుడు ఎలా ఫాలో-అప్ చేస్తున్నారు?",
  },
  "Dermatology / skin clinics": {
    te: "చర్మం మరియు జుట్టు వైద్య కేంద్రం",
    modelEn: "skin and hair consultations and repeat treatment sessions",
    modelTe: "చర్మం, జుట్టు వైద్య సంప్రదింపులు మరియు పునరావృత చికిత్స సెషన్లు",
    workflowEn: "enquiry qualification, session scheduling, and treatment follow-ups",
    workflowTe: "విచారణల అర్హత అంచనా, సెషన్ షెడ్యూలింగ్, మరియు చికిత్స ఫాలో-అప్‌లు",
    questionEn: "How are enquiries converted into consultations and repeat sessions?",
    questionTe: "విచారణలను సంప్రదింపులు, తదుపరి సెషన్లుగా ఎలా మారుస్తున్నారు?",
  },
};

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function buildIntelligence(lead) {
  const fields = lead.custom_fields || {};
  const category = text(fields.category);
  const sector = categories[category];
  if (!sector) throw new Error(`Unknown category for ${lead.id}: ${category}`);
  const name = text(lead.business_name);
  const city = text(lead.city);
  const specialty = text(fields.specialty);
  const address = text(fields.address);
  const hours = text(fields.opening_hours);
  const website = text(lead.website_url);
  const reported = "CRM lead record; confirm with the clinic before treating this as verified.";
  const intelligence = {
    version: 1,
    generated_at: new Date().toISOString(),
    company_snapshot: {
      en: `The CRM lists ${name} in ${city} under ${category.toLowerCase()}. Use this brief to prepare for a call and verify the details with the clinic.`,
      te: `CRM రికార్డు ప్రకారం ${name}, ${city}లోని ${sector.te}. ఈ వివరాలు కాల్‌కు సిద్ధమవడానికి మాత్రమే; సంస్థపై ధృవీకరించిన నివేదిక కాదు.`,
    },
    what_they_do: {
      en: `The lead record lists these services: ${specialty}. Confirm the current service mix with the clinic.`,
      te: `లీడ్ రికార్డులో ఈ సేవలు ఉన్నాయి: ${specialty}. ప్రస్తుతం అందిస్తున్న సేవలను కేంద్రంతో నిర్ధారించండి.`,
    },
    business_model: {
      en: `This type of provider commonly earns from ${sector.modelEn}. The actual revenue mix for ${name} has not been verified.`,
      te: `ఈ తరహా కేంద్రాలకు ${sector.modelTe} నుండి ఆదాయం రావచ్చు. ${name} వాస్తవ ఆదాయ వనరులు ఇంకా నిర్ధారణ కాలేదు.`,
    },
    operations: {
      en: `${address ? `CRM address: ${address}. ` : ""}${hours ? `CRM-listed hours: ${hours}. ` : "Opening hours are not recorded. "}Confirm location, hours, and ${sector.workflowEn} during discovery.`,
      te: `${address ? `CRMలో ఉన్న చిరునామా: ${address}. ` : ""}${hours ? `CRMలో ఉన్న పని వేళలు: ${hours}. ` : "పని వేళలు రికార్డులో లేవు. "}స్థానం, వేళలు, అలాగే ${sector.workflowTe} గురించి మాట్లాడి నిర్ధారించండి.`,
    },
    digital_setup: {
      en: `${website ? `Website listed in CRM: ${website}. ` : "No website is recorded in CRM. "}Online booking, messaging automation, and internal software have not been verified.`,
      te: `${website ? `CRMలో ఉన్న వెబ్‌సైట్: ${website}. ` : "CRMలో వెబ్‌సైట్ నమోదు కాలేదు. "}ఆన్‌లైన్ బుకింగ్, సందేశాల ఆటోమేషన్, అంతర్గత సాఫ్ట్‌వేర్ వినియోగం ఇంకా నిర్ధారణ కాలేదు.`,
    },
    findings: [{
      title: "CRM service profile / CRM సేవల వివరాలు",
      en: `Recorded category: ${category}. Recorded services: ${specialty}.`,
      te: `రికార్డులోని విభాగం: ${sector.te}. రికార్డులోని సేవలు: ${specialty}.`,
      evidence: [reported],
    }],
    gaps: [{
      title: "Discovery question / తెలుసుకోవాల్సిన విషయం",
      en: `It is not yet known how ${name} manages ${sector.workflowEn}. Ask rather than assume there is a gap.`,
      te: `${name}లో ${sector.workflowTe} ఎలా నిర్వహిస్తున్నారో ఇంకా తెలియదు. లోపం ఉందని ఊహించకుండా, వారి విధానాన్ని అడిగి తెలుసుకోండి.`,
    }],
    opportunity: {
      strength: "medium",
      en: `Potential fit for patient enquiry and follow-up coordination if the clinic reports friction in ${sector.workflowEn}. This is a hypothesis, not a scored sales opportunity.`,
      te: `${sector.workflowTe} విషయంలో ఇబ్బందులు ఉన్నాయని కేంద్రం చెబితే, రోగుల విచారణలు మరియు ఫాలో-అప్‌ల సమన్వయానికి అవకాశం ఉండవచ్చు. ఇది పరిశీలించాల్సిన ఊహ మాత్రమే.`,
    },
    action_brief: {
      goal_en: `Confirm ${name}'s current services and identify who owns patient enquiry and follow-up workflows.`,
      goal_te: `${name} ప్రస్తుతం అందిస్తున్న సేవలను నిర్ధారించి, రోగుల విచారణలు మరియు ఫాలో-అప్‌లను ఎవరు నిర్వహిస్తున్నారో తెలుసుకోండి.`,
      questions_en: [sector.questionEn, "Which part of the current process takes the most staff time?"],
      questions_te: [sector.questionTe, "ప్రస్తుత ప్రక్రియలో సిబ్బందికి ఎక్కువ సమయం పట్టే పని ఏది?"],
      next_action_en: "Call the clinic, verify the CRM details, and record the actual workflow before suggesting a solution.",
      next_action_te: "కేంద్రానికి కాల్ చేసి CRM వివరాలను నిర్ధారించండి. పరిష్కారం సూచించే ముందు వాస్తవ పని విధానాన్ని నమోదు చేయండి.",
    },
    sources: website ? [{ label: "Website listed in CRM; affiliation and current content require verification", url: website }] : [],
  };
  const contact = text(fields.doctor_or_owner);
  if (contact) intelligence.decision_maker = {
    name: contact,
    title: "CRM-listed contact or role",
    confidence: "Unverified; confirm identity and purchasing authority",
  };
  return intelligence;
}

const { data: leads, error } = await db.from("leads")
  .select("id,organisation_id,business_name,city,website_url,custom_fields,updated_at")
  .eq("organisation_id", organisationId)
  .eq("source_label", "growx-crawl")
  .gte("created_at", start)
  .lt("created_at", end)
  .is("deleted_at", null)
  .order("id")
  .limit(500);
if (error) throw error;
if (leads.length !== 100) throw new Error(`Expected exactly 100 scoped healthcare leads; found ${leads.length}`);
const pending = leads.filter((lead) => !lead.custom_fields?.growx_intelligence);
const previews = pending.map((lead) => ({ id: lead.id, name: lead.business_name, brief: buildIntelligence(lead) }));
for (const { id, name, brief } of previews) {
  for (const section of [brief.company_snapshot, brief.what_they_do, brief.business_model, brief.operations, brief.digital_setup]) {
    if (!section.en || !section.te) throw new Error(`Incomplete bilingual brief: ${id}`);
  }
  if (!brief.action_brief.questions_en.length || brief.action_brief.questions_en.length !== brief.action_brief.questions_te.length) {
    throw new Error(`Incomplete bilingual questions: ${id}`);
  }
  if (name === "Relive Medical Rehabilitation & Physiotherapy") {
    brief.sources = [];
    brief.digital_setup.en = "The CRM-listed website returned a suspended-domain page during review. Ask the clinic for its current website. Online booking and internal software are unverified.";
    brief.digital_setup.te = "CRMలో ఉన్న వెబ్‌సైట్ పరిశీలనలో నిలిపివేసిన డొమైన్ పేజీగా కనిపించింది. ప్రస్తుతం వాడుతున్న వెబ్‌సైట్‌ను కేంద్రాన్ని అడగండి. ఆన్‌లైన్ బుకింగ్, అంతర్గత సాఫ్ట్‌వేర్ వివరాలు నిర్ధారణ కాలేదు.";
  }
}

console.log(JSON.stringify({ mode: apply ? "apply" : "preview", scoped: leads.length, pending: previews.length, existing: leads.length - previews.length, sample: previews.slice(0, 2) }, null, 2));
if (apply) {
  let written = 0;
  for (const { id, brief } of previews) {
    const lead = leads.find((row) => row.id === id);
    const { data, error: updateError } = await db.from("leads")
      .update({ custom_fields: { ...lead.custom_fields, growx_intelligence: brief } })
      .eq("id", id)
      .eq("organisation_id", organisationId)
      .eq("updated_at", lead.updated_at)
      .select("id,custom_fields")
      .maybeSingle();
    if (updateError || !data?.custom_fields?.growx_intelligence) {
      throw new Error(`Failed or conflicted at lead ${id}: ${updateError?.message || "no row updated"}`);
    }
    written++;
  }
  console.log(JSON.stringify({ written }));
}
