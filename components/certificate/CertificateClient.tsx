"use client";

import Image from "next/image";
const cormorant = { className: "font-serif" };
const cinzel = { className: "font-serif" };
const montserrat = { className: "font-sans" };

interface CertificateClientProps {
  cert: {
    cert_id: string;
    student_name: string;
    course_name: string;
    issue_date: string;
    grade?: string;
  };
  qrCode: string;
}

export function CertificateClient({ cert, qrCode }: CertificateClientProps) {
  const issueDateFormatted = new Date(cert.issue_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-5 bg-[#0a0a0a] ${cormorant.className}`}>
      {/* Internal Styles for exact replication of user's design */}
      <style jsx global>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .print-btn { display: none !important; }
          .cert-wrapper { width: 100% !important; margin: 0 !important; }
          .certificate { box-shadow: none !important; width: 100% !important; }
        }
      `}</style>

      <div className="w-[1050px] relative cert-wrapper">
        <button 
          onClick={() => window.print()}
          className="print-btn block mx-auto mb-5 px-8 py-3 bg-[#c9a84c] color-black border-none text-[13px] font-medium tracking-[2px] uppercase cursor-pointer rounded-[2px]"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          🖨 Print / Save as PDF
        </button>

        <div className="certificate w-[1050px] min-h-[720px] bg-[#faf6ee] relative overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
          {/* Borders */}
          <div className="cert-border-outer absolute inset-3 border-2 border-[#c9a84c] pointer-events-none z-10" />
          <div className="cert-border-inner absolute inset-[18px] border-[0.5px] border-[#c9a84c88] pointer-events-none z-10" />

          {/* Corner Ornaments */}
          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />

          {/* Watermark */}
          <div className={`watermark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[160px] font-bold text-[#c9a84c]/[0.04] tracking-[-10px] whitespace-nowrap pointer-events-none z-0 select-none ${cinzel.className}`}>
            GXL
          </div>

          {/* Top Band */}
          <div className="top-band h-2 w-full bg-[linear-gradient(135deg,#1a1a1a_0%,#2c2c2c_50%,#1a1a1a_100%)]" />

          {/* Main Content */}
          <div className="cert-content relative z-[5] px-20 pt-[50px] pb-10 flex flex-col items-center">
            
            {/* Header */}
            <div className="cert-header flex items-center gap-4 mb-2">
              <div className="logo-mark w-11 h-11 bg-[#1a1a1a] rounded flex items-center justify-center p-2">
                <svg viewBox="0 0 44 44" fill="none" className="w-full h-full">
                  <path d="M10 22 L18 14 L26 22 L22 22 L22 30 L14 30 L14 22Z" fill="#c9a84c"/>
                  <path d="M22 14 L34 14 L34 22 L26 22Z" fill="#c9a84c" opacity="0.5"/>
                </svg>
              </div>
              <span className={`brand-name text-[22px] font-semibold text-[#1a1a1a] tracking-[4px] uppercase ${cinzel.className}`}>
                GROW<span className="text-[#c9a84c]">X</span> LABS
              </span>
              <div className="divider-line w-[1px] h-[30px] bg-[#c9a84c]/50" />
              <span className={`academy-tag text-[10px] font-medium tracking-[3px] text-[#888] uppercase ${montserrat.className}`}>
                Academy
              </span>
            </div>

            {/* Ornament */}
            <div className="ornament-line flex items-center gap-3 my-5 w-full justify-center">
              <div className="h-[1px] flex-1 max-w-[200px] bg-[linear-gradient(90deg,transparent,#c9a84c,transparent)]" />
              <div className="ornament-diamond w-2 h-2 bg-[#c9a84c] rotate-45" />
              <div className="h-[1px] flex-1 max-w-[200px] bg-[linear-gradient(90deg,transparent,#c9a84c,transparent)]" />
            </div>

            {/* Title */}
            <div className={`cert-title text-[13px] tracking-[6px] text-[#888] uppercase mb-1 ${cinzel.className}`}>
              Certificate of Mastery
            </div>
            <div className={`cert-subtitle text-[32px] font-semibold text-[#1a1a1a] tracking-[3px] text-center leading-[1.2] ${cinzel.className}`}>
              This is to Certify That
            </div>

            <div className="presented-to text-sm font-light tracking-[3px] text-[#999] uppercase mt-7 mb-2">
              the following individual
            </div>

            <div className="student-name text-[58px] font-light italic text-[#1a1a1a] text-center leading-[1.1] border-b border-[#c9a84c44] pb-3 min-w-[400px]">
              {cert.student_name}
            </div>

            <div className="stars text-[#c9a84c] text-base tracking-[4px] my-1">
              ✦ ✦ ✦
            </div>

            <div className="cert-body text-base font-normal text-[#555] text-center leading-[1.8] my-5 max-w-[600px]">
              has successfully completed all requirements and demonstrated exceptional mastery in
              <span className={`course-name text-[18px] font-semibold text-[#1a1a1a] tracking-[2px] block my-1 ${cinzel.className}`}>
                {cert.course_name}
              </span>
              {cert.grade && (
                <span className="text-[14px] text-[#888] block">with distinction ({cert.grade})</span>
              )}
              as offered by GrowX Labs Academy.
            </div>

            {/* Meta Row */}
            <div className="meta-row flex gap-10 my-2 justify-center">
              <div className="meta-item text-center">
                <span className={`meta-label text-[9px] tracking-[2px] text-[#aaa] uppercase block mb-[3px] ${montserrat.className}`}>Issue Date</span>
                <span className={`meta-value text-[13px] text-[#333] tracking-[1px] ${cinzel.className}`}>{issueDateFormatted}</span>
              </div>
              <div className="meta-sep w-[1px] bg-[#ddd] self-stretch" />
              <div className="meta-item text-center">
                <span className={`meta-label text-[9px] tracking-[2px] text-[#aaa] uppercase block mb-[3px] ${montserrat.className}`}>Duration</span>
                <span className={`meta-value text-[13px] text-[#333] tracking-[1px] ${cinzel.className}`}>12 Weeks</span>
              </div>
              <div className="meta-sep w-[1px] bg-[#ddd] self-stretch" />
              <div className="meta-item text-center">
                <span className={`meta-label text-[9px] tracking-[2px] text-[#aaa] uppercase block mb-[3px] ${montserrat.className}`}>Certificate ID</span>
                <span className={`meta-value text-[13px] text-[#333] tracking-[1px] ${cinzel.className}`}>{cert.cert_id}</span>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="cert-bottom flex justify-between items-end w-full mt-2 pt-5 border-t border-[#e8e0d0]">
              
              {/* Signature Block */}
              <div className="sign-block text-center min-w-[180px]">
                <div className="relative h-16 w-32 mx-auto">
                  <Image 
                    src="/founder-signature.png" 
                    alt="Founder Signature" 
                    fill 
                    className="object-contain" 
                  />
                </div>
                <div className="sign-line w-[180px] h-[1px] bg-[#c9a84c] mx-auto my-1.5" />
                <div className={`sign-title text-[9px] tracking-[2px] text-[#999] uppercase ${montserrat.className}`}>
                  Founder & Director · GrowX Labs
                </div>
              </div>

              {/* Seal */}
              <div className="seal-block text-center">
                <div className="seal w-[90px] h-[90px] rounded-full border-2 border-[#c9a84c] flex flex-col items-center justify-center bg-[linear-gradient(135deg,#faf6ee,#f0e8d5)] relative mx-auto mb-1.5">
                  <div className="absolute inset-1 rounded-full border border-dashed border-[#c9a84c88]" />
                  <div className={`seal-text text-[7px] tracking-[1.5px] text-[#c9a84c] uppercase text-center leading-[1.4] ${cinzel.className}`}>
                    GROWX<br/>LABS
                  </div>
                  <div className={`seal-year text-sm font-bold text-[#1a1a1a] my-[2px] ${cinzel.className}`}>
                    2026
                  </div>
                  <div className={`seal-text text-[7px] tracking-[1.5px] text-[#c9a84c] uppercase text-center leading-[1.4] ${cinzel.className}`}>
                    CERTIFIED
                  </div>
                </div>
                <div className={`cert-id text-[8px] text-[#bbb] tracking-[1px] mt-1 ${montserrat.className}`}>{cert.cert_id}</div>
              </div>

              {/* QR Block */}
              <div className="qr-block text-center min-w-[120px]">
                <div className="qr-container w-[90px] h-[90px] bg-white border border-[#e0d8c8] p-1.5 mx-auto mb-1.5 flex items-center justify-center">
                  <img src={qrCode} alt="Verification QR" className="w-full h-full" />
                </div>
                <div className={`qr-label text-[8px] tracking-[1.5px] text-[#aaa] uppercase ${montserrat.className}`}>Scan to Verify</div>
                <div className={`cert-id text-[8px] text-[#bbb] tracking-[1px] mt-1 ${montserrat.className}`}>Cryptographically Signed</div>
              </div>

            </div>

          </div>

          {/* Bottom Band */}
          <div className="bottom-band h-2 w-full bg-[linear-gradient(135deg,#1a1a1a_0%,#2c2c2c_50%,#1a1a1a_100%)] absolute bottom-0" />
        </div>
      </div>
    </div>
  );
}

function Corner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const styles = {
    tl: "top-2 left-2",
    tr: "top-2 right-2 scale-x-[-1]",
    bl: "bottom-2 left-2 scale-y-[-1]",
    br: "bottom-2 right-2 scale-[-1]",
  };

  return (
    <div className={`corner absolute w-[60px] h-[60px] z-[11] ${styles[position]}`}>
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M8 8 L8 50" stroke="#c9a84c" strokeWidth="1.5"/>
        <path d="M8 8 L50 8" stroke="#c9a84c" strokeWidth="1.5"/>
        <path d="M18 18 L18 42" stroke="#c9a84c88" strokeWidth="0.5"/>
        <path d="M18 18 L42 18" stroke="#c9a84c88" strokeWidth="0.5"/>
        <circle cx="8" cy="8" r="3" fill="#c9a84c"/>
        <circle cx="18" cy="18" r="1.5" fill="#c9a84c88"/>
        { (position === 'tl' || position === 'tr') && (
          <>
            <path d="M8 30 Q13 25 18 30" stroke="#c9a84c" strokeWidth="0.8" fill="none"/>
            <path d="M30 8 Q25 13 30 18" stroke="#c9a84c" strokeWidth="0.8" fill="none"/>
          </>
        )}
      </svg>
    </div>
  );
}
