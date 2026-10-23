"use client";

import React from "react";

/**
 * AtmosphericHeroBackground
 * 
 * An original, purpose-designed atmospheric vector cloudscape for GrowxLabs
 * matching the visual direction of the Jev / TypeSafe reference:
 * 
 * - Organic, turbulent cloud-like boundaries driven by fractal noise displacement
 * - Distinct formations of hot magenta/fuchsia, Air Force Blue, soft cyan, and lavender
 * - Tactile risograph micro-dither texture and fine stippling
 * - Tailored responsive compositions for both Desktop and Mobile viewports
 * - Smooth transition into Snow White (#FAFCFD) near the typography
 * - Completely static with zero distracting animations
 */
export function AtmosphericHeroBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Base Snow White Ground */}
      <div className="absolute inset-0 bg-[#FAFCFD]" />

      {/* ═══ 2. DESKTOP SVG CLOUDSCAPE (Hidden on Mobile) ═══ */}
      <svg
        className="hidden sm:block absolute inset-0 w-full h-[90%] md:h-[95%] lg:h-full object-cover"
        viewBox="0 0 1600 950"
        preserveAspectRatio="xMidYMin slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Turbulence displacement filter: breaks geometric paths into organic watercolor/billowing cloud contours */}
          <filter id="desk-cloud-turb-1" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.009 0.015"
              numOctaves="5"
              seed="43"
              result="noise1"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise1"
              scale="80"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced1"
            />
            <feGaussianBlur in="displaced1" stdDeviation="5" result="smoothed1" />
          </filter>

          <filter id="desk-cloud-turb-2" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014 0.022"
              numOctaves="4"
              seed="88"
              result="noise2"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise2"
              scale="55"
              xChannelSelector="B"
              yChannelSelector="R"
              result="displaced2"
            />
            <feGaussianBlur in="displaced2" stdDeviation="3.5" result="smoothed2" />
          </filter>

          {/* Color Gradients */}
          {/* Central Atmospheric Sky: Air Force Blue to Soft Cyan */}
          <linearGradient id="desk-sky-grad" x1="50%" y1="0%" x2="50%" y2="80%">
            <stop offset="0%" stopColor="#4A8AA8" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#6AAECB" stopOpacity="0.82" />
            <stop offset="65%" stopColor="#9DE0F4" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FAFCFD" stopOpacity="0" />
          </linearGradient>

          {/* Left Cloud Bank: Hot Magenta / Fuchsia into Lavender and Air Force Blue */}
          <linearGradient id="desk-left-magenta" x1="0%" y1="10%" x2="90%" y2="85%">
            <stop offset="0%" stopColor="#DC2A88" stopOpacity="0.96" />
            <stop offset="32%" stopColor="#EB53A3" stopOpacity="0.88" />
            <stop offset="62%" stopColor="#AF75DD" stopOpacity="0.75" />
            <stop offset="85%" stopColor="#78BCDC" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FAFCFD" stopOpacity="0" />
          </linearGradient>

          {/* Right Cloud Bank: Intense Magenta / Pink into Violet and Cyan */}
          <linearGradient id="desk-right-magenta" x1="100%" y1="5%" x2="15%" y2="90%">
            <stop offset="0%" stopColor="#E22485" stopOpacity="0.98" />
            <stop offset="28%" stopColor="#F256A7" stopOpacity="0.92" />
            <stop offset="58%" stopColor="#C46FDD" stopOpacity="0.8" />
            <stop offset="82%" stopColor="#86C2E2" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#FAFCFD" stopOpacity="0" />
          </linearGradient>

          {/* Soft Lavender / Lilac billow */}
          <linearGradient id="desk-lavender" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#B380E4" stopOpacity="0.85" />
            <stop offset="48%" stopColor="#CEA2F2" stopOpacity="0.7" />
            <stop offset="80%" stopColor="#E6C2F8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FAFCFD" stopOpacity="0" />
          </linearGradient>

          {/* Soft Cyan Rim */}
          <linearGradient id="desk-cyan-rim" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#62BCD9" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#92E4F7" stopOpacity="0.72" />
            <stop offset="82%" stopColor="#C4F4FE" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FAFCFD" stopOpacity="0" />
          </linearGradient>

          {/* Dissolve mask into Snow White */}
          <linearGradient id="desk-fade-mask" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="42%" stopColor="#ffffff" stopOpacity="0.96" />
            <stop offset="65%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <mask id="desk-mask">
            <rect width="1600" height="950" fill="url(#desk-fade-mask)" />
          </mask>
        </defs>

        <g mask="url(#desk-mask)">
          {/* Layer 1: Central Sky Backdrop */}
          <path
            d="M 100,-40 C 450,20 700,60 900,40 C 1150,20 1350,-20 1520,-40 L 1580,560 C 1200,640 850,580 500,620 C 250,640 80,580 -40,540 Z"
            fill="url(#desk-sky-grad)"
            filter="url(#desk-cloud-turb-1)"
          />

          {/* Layer 2: Mid-Sky Cyan & Lavender atmospheric wash */}
          <path
            d="M 220,10 C 500,90 850,110 1150,60 C 1350,20 1480,40 1560,10 L 1560,540 C 1250,610 920,530 620,580 C 380,620 180,540 60,480 Z"
            fill="url(#desk-cyan-rim)"
            filter="url(#desk-cloud-turb-2)"
            opacity="0.82"
          />

          {/* Layer 3: Left Primary Cloud Formations (Organic multi-lobe mounds) */}
          <path
            d="M -120,-60 L 520,-60 C 550,60 520,160 460,220 C 530,270 510,380 430,440 C 360,500 240,560 160,620 C 60,670 -40,650 -120,620 Z"
            fill="url(#desk-left-magenta)"
            filter="url(#desk-cloud-turb-1)"
          />

          {/* Layer 4: Right Primary Cloud Formations (Organic billowing lobes) */}
          <path
            d="M 1080,-60 L 1720,-60 L 1720,640 C 1600,680 1460,640 1370,570 C 1260,490 1200,380 1140,290 C 1080,210 1060,90 1080,-60 Z"
            fill="url(#desk-right-magenta)"
            filter="url(#desk-cloud-turb-1)"
          />

          {/* Layer 5: Left Secondary Lavender & Lilac Fold */}
          <path
            d="M -60,40 C 150,50 300,120 380,210 C 440,280 400,390 320,460 C 240,530 110,580 -60,590 Z"
            fill="url(#desk-lavender)"
            filter="url(#desk-cloud-turb-2)"
            opacity="0.85"
          />

          {/* Layer 6: Right Secondary Pink & Lavender Fold */}
          <path
            d="M 1660,20 C 1520,40 1360,120 1280,230 C 1200,330 1240,440 1320,530 C 1420,610 1560,620 1660,610 Z"
            fill="url(#desk-right-magenta)"
            filter="url(#desk-cloud-turb-2)"
            opacity="0.82"
          />

          {/* Layer 7: Central Bridging Cloud Lobes & Wisps */}
          <path
            d="M 340,160 C 560,240 780,210 980,170 C 1140,130 1260,200 1340,260 C 1260,340 1080,330 920,310 C 740,290 540,340 380,270 Z"
            fill="url(#desk-lavender)"
            filter="url(#desk-cloud-turb-2)"
            opacity="0.75"
          />

          {/* Layer 8: Cyan Light Accents on lower cloud margins */}
          <path
            d="M 180,380 C 480,480 820,440 1150,370 C 1320,330 1420,420 1400,500 C 1120,580 780,560 460,530 C 290,510 160,460 180,380 Z"
            fill="url(#desk-cyan-rim)"
            filter="url(#desk-cloud-turb-1)"
            opacity="0.7"
          />
        </g>
      </svg>

      {/* ═══ 3. MOBILE SVG CLOUDSCAPE (Visible only on Mobile) ═══ */}
      <svg
        className="block sm:hidden absolute inset-0 w-full h-[85%] object-cover"
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMin slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="mob-cloud-turb" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.024"
              numOctaves="4"
              seed="54"
              result="mobNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="mobNoise"
              scale="42"
              xChannelSelector="R"
              yChannelSelector="G"
              result="mobDisplaced"
            />
            <feGaussianBlur in="mobDisplaced" stdDeviation="3.5" result="mobSmoothed" />
          </filter>

          <linearGradient id="mob-sky-grad" x1="50%" y1="0%" x2="50%" y2="80%">
            <stop offset="0%" stopColor="#4A8AA8" stopOpacity="0.88" />
            <stop offset="40%" stopColor="#76B8D4" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#A2E2F5" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FAFCFD" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="mob-magenta-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2A88" stopOpacity="0.94" />
            <stop offset="35%" stopColor="#EB53A3" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#B378DD" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FAFCFD" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="mob-magenta-right" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E22485" stopOpacity="0.96" />
            <stop offset="35%" stopColor="#F256A7" stopOpacity="0.88" />
            <stop offset="70%" stopColor="#C46FDD" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FAFCFD" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="mob-fade-mask" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="38%" stopColor="#ffffff" stopOpacity="0.92" />
            <stop offset="58%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="76%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <mask id="mob-mask">
            <rect width="400" height="800" fill="url(#mob-fade-mask)" />
          </mask>
        </defs>

        <g mask="url(#mob-mask)">
          {/* Mobile sky canopy */}
          <path
            d="M -20,-20 L 420,-20 L 420,440 C 310,480 200,450 110,480 C 40,500 -10,470 -20,440 Z"
            fill="url(#mob-sky-grad)"
            filter="url(#mob-cloud-turb)"
          />

          {/* Mobile Top-Left Magenta / Fuchsia cloud */}
          <path
            d="M -40,-30 L 220,-30 C 230,60 190,130 150,180 C 110,230 60,300 -20,340 L -40,340 Z"
            fill="url(#mob-magenta-left)"
            filter="url(#mob-cloud-turb)"
          />

          {/* Mobile Top-Right Magenta / Violet cloud */}
          <path
            d="M 180,-30 L 440,-30 L 440,380 C 370,410 320,340 280,270 C 240,200 220,110 180,-30 Z"
            fill="url(#mob-magenta-right)"
            filter="url(#mob-cloud-turb)"
          />

          {/* Mobile Center Cyan & Lavender fold */}
          <path
            d="M 50,80 C 140,140 240,130 320,90 C 350,160 300,240 230,280 C 160,320 80,260 50,190 Z"
            fill="url(#desk-lavender)"
            filter="url(#mob-cloud-turb)"
            opacity="0.8"
          />

          {/* Mobile Lower Cyan wisp */}
          <path
            d="M 30,240 C 140,310 260,290 360,240 C 350,330 260,370 170,360 C 80,350 40,300 30,240 Z"
            fill="url(#desk-cyan-rim)"
            filter="url(#mob-cloud-turb)"
            opacity="0.75"
          />
        </g>
      </svg>

      {/* 4. Fine Risograph / Halftone Dither Dot Matrix Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(rgba(70, 95, 125, 0.7) 0.75px, transparent 0.75px)`,
          backgroundSize: "3px 3px",
          backgroundPosition: "0 0",
        }}
      />

      {/* 5. Tactile Micro-Grain / Film Dither Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='ditherNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23ditherNoise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* 6. Smooth Gradual Dissolve into Snow White (#FAFCFD) near Typography */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(250, 252, 253, 0) 0%, rgba(250, 252, 253, 0) 36%, rgba(250, 252, 253, 0.35) 54%, rgba(250, 252, 253, 0.8) 72%, rgba(250, 252, 253, 0.98) 86%, #FAFCFD 100%)",
        }}
      />
    </div>
  );
}
