import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  const orgId = "8e7d6c54-68f1-4d19-9bf5-c20fe6c37721";
  const employeeId = "231f3d4d-3608-4809-9d0b-63562881f8c0"; // Sai Varshith
  const shahidEmployeeId = "e468a149-86ff-41af-bbcf-57d617419667"; // Mohamad Shahid

  const healthcareLeadData = {
    organisation_id: orgId,
    business_name: "Apex Multispeciality Hospital",
    name: "Dr. K. Srinivas Rao",
    designation: "Managing Director",
    phone: "+91 98490 12345",
    email: "director@apexhospital-hyd.com",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    website_url: "https://apexhospital-hyd.com",
    priority: "high",
    status: "new",
    source_label: "Outbound research",
    assigned_employee_id: employeeId,
    assigned_at: new Date().toISOString(),
    custom_fields: {
      healthcare: {
        facility_type: "Hospital",
        specialties: ["Cardiology", "Neurology", "Orthopedics", "Emergency Care"],
        bed_capacity: 120,
        doctor_count: 24,
        accreditation: ["NABH", "ISO 9001"],
        emr_system: "Legacy Desktop Software (Local Server)",
        opd_daily_volume: 350,
        pharmacy_attached: true,
        lab_attached: true,
        target_decision_maker: "Dr. K. Srinivas Rao (Managing Director)",
        notes: "Expanding new OPD wing next quarter. Interested in cutting patient wait times."
      },
      growx_intelligence: {
        company_overview: {
          en: "Apex Multispeciality Hospital is a reputable 120-bed hospital operating in Kukatpally, Hyderabad for over 12 years. They handle 350+ daily outpatients across Cardiology, Orthopedics, and Internal Medicine.",
          te: "ఎపెక్స్ మల్టీస్పెషాలిటీ హాస్పిటల్ హైదరాబాద్ కూకట్‌పల్లిలో 12 ఏళ్లుగా నడుస్తున్న 120 పడకల ఆసుపత్రి. రోజూ 350 మందికి పైగా ఔట్ పేషెంట్లకు కార్డియాలజీ మరియు ఆర్థోపెడిక్స్ సేవలు అందిస్తున్నారు."
        },
        what_they_do: {
          en: "Provides primary and tertiary healthcare services with 24/7 emergency care, in-house laboratory testing, advanced radiology, and inpatient surgical procedures.",
          te: "24/7 ఎమర్జెన్సీ కేర్, ల్యాబ్ టెస్టులు, రేడియాలజీ మరియు సర్జరీలతో కూడిన సూపర్ స్పెషాలిటీ వైద్య సేవలను అందిస్తుంది."
        },
        business_model: {
          en: "Revenue is driven by OPD consultations (20%), inpatient surgeries and admissions (55%), diagnostic lab services (15%), and attached 24/7 pharmacy (10%).",
          te: "ఆదాయం ప్రధానంగా ఇన్-పేషెంట్ సర్జరీలు (55%), ఓపీడీ సంప్రదింపులు (20%), డయాగ్నస్టిక్ ల్యాబ్ (15%), మరియు ఫార్మసీ (10%) ద్వారా వస్తుంది."
        },
        current_operations: {
          en: "Front desk currently uses physical token slips and an outdated on-premise desktop EMR that cannot send WhatsApp reminders or synchronize doctor schedules across branches.",
          te: "ప్రస్తుతం రిసెప్షన్ వద్ద టోకెన్ స్లిప్పులు మరియు పాత కంప్యూటర్ సాఫ్ట్‌వేర్ వాడుతున్నారు. వాట్సాప్ రిమైండర్లు లేదా డిజిటల్ అపాయింట్‌మెంట్లు లేవు."
        },
        digital_presence: {
          website_quality: "average",
          booking_system: false,
          whatsapp_integrated: false,
          teleconsultation: false,
          seo_score: "42/100",
          reviews_rating: 4.1,
          reviews_count: 310,
          notes: {
            en: "Website does not have online booking. Multiple Google reviews complain about 45-minute front-desk queue times.",
            te: "వెబ్‌సైట్‌లో ఆన్‌లైన్ బుకింగ్ లేదు. కౌంటర్ వద్ద 45 నిమిషాల వెయిటింగ్ సమయం ఉందని గూగుల్ రివ్యూల్లో ఫిర్యాదులు ఉన్నాయి."
          }
        },
        key_findings: [
          {
            title: {
              en: "Severe Front-Desk OPD Bottleneck",
              te: "ఓపీడీ రిసెప్షన్ వద్ద తీవ్రమైన రద్దీ"
            },
            detail: {
              en: "Peak morning hours (9 AM - 12 PM) create 30-45 minute waiting times for manual billing and paper registrations.",
              te: "ఉదయం 9 నుండి 12 గంటల మధ్య బిల్లింగ్ మరియు పేపర్ రిజిస్ట్రేషన్ల కోసం రోగులు 30-45 నిమిషాలు వేచి ఉండాల్సి వస్తోంది."
            },
            type: "gap",
            evidence: "18 recent 1-star and 2-star Google Reviews citing reception queue delays."
          },
          {
            title: {
              en: "High Outpatient Volume with Expansion Readiness",
              te: "అధిక పేషెంట్ రద్దీ మరియు విస్తరణ ప్రణాళిక"
            },
            detail: {
              en: "Operating at 85% capacity with an approved budget to modernize clinic workflow for their new wing opening next quarter.",
              te: "85% సామర్థ్యంతో నడుస్తోంది. వచ్చే త్రైమాసికంలో ప్రారంభమయ్యే కొత్త వింగ్ కోసం డిజిటల్ వర్క్‌ఫ్లో బడ్జెట్ సిద్ధంగా ఉంది."
            },
            type: "opportunity",
            evidence: "Local healthcare industry press release and LinkedIn hiring posts for front-office supervisors."
          }
        ],
        identified_gaps: [
          {
            area: {
              en: "Automated WhatsApp Appointment Confirmation & Token Tracking",
              te: "వాట్సాప్ ఆటోమేటిక్ అపాయింట్‌మెంట్ మరియు లైవ్ టోకెన్ ట్రాకింగ్"
            },
            impact: {
              en: "Eliminates waiting room crowding and reduces front-desk staff telephone call volume by 60%.",
              te: "వెయిటింగ్ హాల్‌లో రద్దీ తగ్గిపోతుంది మరియు రిసెప్షన్ సిబ్బందికి ఫోన్ కాల్స్ భారం 60% తగ్గుతుంది."
            },
            recommendation: {
              en: "Deploy GrowXLabs Smart OPD Workflow with automated WhatsApp alerts and instant QR-code check-in.",
              te: "వాట్సాప్ అలర్ట్‌లు మరియు తక్షణ క్యూఆర్ చెక్-ఇన్‌తో కూడిన గ్రోఎక్స్ స్మార్ట్ ఓపీడీ సిస్టమ్‌ను ప్రవేశపెట్టండి."
            }
          }
        ],
        opportunity_score: {
          score: 88,
          level: "critical",
          rationale: {
            en: "Urgent need to solve OPD wait times before next month's NABH re-audit, combined with verified executive decision-maker contact details.",
            te: "వచ్చే నెల నాబ్ (NABH) రీ-ఆడిట్ లోపు ఓపీడీ రద్దీని తగ్గించాల్సిన అవసరం ఉంది, మేనేజింగ్ డైరెక్టర్ నేరుగా నిర్ణయం తీసుకుంటారు."
          }
        },
        action_plan: {
          your_goal: {
            en: "Schedule a 15-minute Discovery Demo with Dr. Srinivas Rao or Hospital Administrator to demonstrate automated WhatsApp queue management and NABH compliance reporting.",
            te: "వాట్సాప్ క్యూ మేనేజ్‌మెంట్ మరియు నాబ్ కంప్లయన్స్‌ను వివరించడానికి డాక్టర్ శ్రీనివాసరావు లేదా హాస్పిటల్ అడ్మినిస్ట్రేటర్‌తో 15 నిమిషాల డెమో కాల్ ఫిక్స్ చేయడం మీ ముఖ్య లక్ష్యం."
          },
          pitch_angle: {
            en: "Focus on zero-wait-time patient check-in and automated doctor OPD schedule sync without replacing their existing accounting software.",
            te: "వారి ప్రస్తుత సాఫ్ట్‌వేర్‌ను మార్చాల్సిన అవసరం లేకుండానే, వాట్సాప్ ద్వారా రోగుల వెయిటింగ్ టైమ్ తగ్గించే విధానంపై మాట్లాడండి."
          },
          questions_to_ask: [
            {
              en: "How are you currently managing patient arrival surges during peak OPD hours (9 AM - 12 PM)?",
              te: "ఉదయం 9-12 గంటల మధ్య రద్దీ సమయాల్లో రోగుల క్యూలను ఎలా నిర్వహిస్తున్నారు?"
            },
            {
              en: "Are your receptionists manually calling patients to confirm specialist doctor availability?",
              te: "స్పెషలిస్ట్ డాక్టర్లు అందుబాటులో ఉన్నారా లేదా అని పేషెంట్లకు ఫోన్ ద్వారా తెలియజేస్తున్నారా?"
            },
            {
              en: "Would an automated WhatsApp token alert system help improve your patient Google ratings before NABH inspection?",
              te: "నాబ్ ఇన్‌స్పెక్షన్ ముందు ఆటోమేటిక్ వాట్సాప్ టోకెన్ సిస్టమ్ ద్వారా పేషెంట్ సంతృప్తిని పెంచడం మీకు ఉపయోగపడుతుందా?"
            }
          ],
          next_step_recommendation: {
            en: "Send a brief WhatsApp message highlighting the Kukatpally healthcare clinic case study, followed by a call at 11:30 AM.",
            te: "కూకట్‌పల్లి క్లినిక్ కేస్ స్టడీని వాట్సాప్ ద్వారా పంపి, ఉదయం 11:30 గంటలకు కాల్ చేయండి."
          }
        },
        sources: [
          {
            title: "Apex Hospital Google Maps & Reviews Profile",
            url: "https://maps.google.com/?q=Apex+Hospital+Kukatpally"
          },
          {
            title: "Telangana Private Hospitals & Nursing Homes Registry",
            url: "https://telangana.gov.in/health"
          }
        ]
      }
    }
  };

  console.log("Seeding test healthcare lead for Sai Varshith...");
  const { data: existing1 } = await supabase
    .from("leads")
    .select("id")
    .eq("business_name", healthcareLeadData.business_name)
    .maybeSingle();

  let lead1Id = existing1?.id;
  if (lead1Id) {
    await supabase.from("leads").update(healthcareLeadData).eq("id", lead1Id);
    console.log("Updated Lead 1 with ID:", lead1Id);
  } else {
    const { data: ins1, error: err1 } = await supabase
      .from("leads")
      .insert(healthcareLeadData)
      .select("id, business_name")
      .single();
    if (err1) console.error("Error inserting lead 1:", err1.message);
    else console.log("Created Lead 1:", ins1);
  }

  // Also assign a second lead to Shahid
  const leadDataShahid = {
    ...healthcareLeadData,
    business_name: "Sanjeevani Children & Maternity Hospital",
    name: "Dr. P. Madhavi",
    designation: "Chief Medical Officer",
    phone: "+91 99887 65432",
    email: "cmo@sanjeevanikids.in",
    assigned_employee_id: shahidEmployeeId,
    city: "Vijayawada",
    state: "Andhra Pradesh",
  };

  const { data: existing2 } = await supabase
    .from("leads")
    .select("id")
    .eq("business_name", leadDataShahid.business_name)
    .maybeSingle();

  let lead2Id = existing2?.id;
  if (lead2Id) {
    await supabase.from("leads").update(leadDataShahid).eq("id", lead2Id);
    console.log("Updated Lead 2 with ID:", lead2Id);
  } else {
    const { data: ins2, error: err2 } = await supabase
      .from("leads")
      .insert(leadDataShahid)
      .select("id, business_name")
      .single();
    if (err2) console.error("Error inserting lead 2:", err2.message);
    else console.log("Created Lead 2:", ins2);
  }
}

seed();
