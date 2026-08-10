import { Resend } from "resend";
import { growxlabsEmailAction, growxlabsEmailFields, growxlabsEmailLayout, escapeGrowXLabsEmailHtml } from "@/lib/email/growxlabs-layout";

export async function sendCertificateEmail(email: string, studentName: string, courseName: string, grade: string, certId: string) {
  const certUrl = `https://growxlabs.tech/certificate/${encodeURIComponent(certId)}`;
  const content = `<p>Congratulations, ${escapeGrowXLabsEmailHtml(studentName)}.</p><p>You have successfully completed the assessment for <strong>${escapeGrowXLabsEmailHtml(courseName)}</strong>.</p>${growxlabsEmailFields([["Course", courseName], ["Grade", grade], ["Certificate reference", certId]])}<p>Your official Certificate of Mastery is ready to view, download, or share.</p>${growxlabsEmailAction("View Certificate", certUrl)}`;
  try {
    const result = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: "GrowXLabs Academy <academy@growxlabs.tech>", to: [email], subject: "Your GrowXLabs certificate is ready", html: growxlabsEmailLayout({ context: "CERTIFICATE READY", reference: certId, content }) });
    if (result.error) return { success: false, error: result.error };
    return { success: true, data: result.data };
  } catch (error) { console.error("Email delivery failure:", error); return { success: false, error }; }
}
