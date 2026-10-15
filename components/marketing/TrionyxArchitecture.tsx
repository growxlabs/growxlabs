export function TrionyxArchitecture() {
  return (
    <div className="w-full bg-[#08080A] rounded-xl border border-neutral-800/80 p-4 sm:p-8 md:p-10">
      {/* ─── DESKTOP SVG VIEW ─── */}
      <svg
        viewBox="0 0 1000 520"
        className="hidden md:block w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Trionyx Architecture Diagram"
      >
        <defs>
          <marker
            id="arrow-down"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 5 5 L 0 8.5 z" fill="#C0F0FB" />
          </marker>
          <marker
            id="arrow-up"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 5 1.5 L 0 5 L 5 8.5 z" fill="#C0F0FB" />
          </marker>
        </defs>

        {/* ─── TIER 1: CLIENT SURFACES ─── */}
        {/* Customer Website */}
        <g>
          <rect x="100" y="20" width="220" height="52" rx="8" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="210" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="600" fontFamily="sans-serif">
            Customer Website
          </text>
        </g>

        {/* Dealer Portal */}
        <g>
          <rect x="390" y="20" width="220" height="52" rx="8" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="500" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="600" fontFamily="sans-serif">
            Dealer Portal
          </text>
        </g>

        {/* Staff Dashboard */}
        <g>
          <rect x="680" y="20" width="220" height="52" rx="8" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="790" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="600" fontFamily="sans-serif">
            Staff Dashboard
          </text>
        </g>

        {/* ─── CONNECTORS: TIER 1 → TIER 2 ─── */}
        <g stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7">
          <path d="M 210 72 L 210 102 L 500 102" />
          <path d="M 790 72 L 790 102 L 500 102" />
          <line x1="500" y1="72" x2="500" y2="102" />
          <line x1="500" y1="102" x2="500" y2="124" markerEnd="url(#arrow-down)" />
        </g>

        {/* ─── TIER 2: SIGN-IN & ACCESS CONTROL ─── */}
        <g>
          <rect x="330" y="126" width="340" height="48" rx="8" fill="#0E161C" stroke="#2A4857" strokeWidth="1.2" />
          <text x="500" y="156" textAnchor="middle" fill="#C0F0FB" fontSize="14" fontWeight="600" fontFamily="sans-serif">
            Sign-in &amp; Access Control
          </text>
        </g>

        {/* ─── CONNECTORS: TIER 2 → TIER 3 ─── */}
        <g stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7">
          <line x1="500" y1="174" x2="500" y2="202" markerEnd="url(#arrow-down)" />
        </g>

        {/* ─── TIER 3: SHARED BUSINESS SERVICES ─── */}
        <g>
          <rect x="330" y="204" width="340" height="48" rx="8" fill="#0E161C" stroke="#2A4857" strokeWidth="1.2" />
          <text x="500" y="234" textAnchor="middle" fill="#C0F0FB" fontSize="14" fontWeight="600" fontFamily="sans-serif">
            Shared Business Services
          </text>
        </g>

        {/* ─── CONNECTORS: TIER 3 → TIER 4 ─── */}
        <g stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7">
          <line x1="500" y1="252" x2="500" y2="278" />
          <line x1="135" y1="278" x2="865" y2="278" />
          <line x1="135" y1="278" x2="135" y2="298" markerEnd="url(#arrow-down)" />
          <line x1="380" y1="278" x2="380" y2="298" markerEnd="url(#arrow-down)" />
          <line x1="620" y1="278" x2="620" y2="298" markerEnd="url(#arrow-down)" />
          <line x1="865" y1="278" x2="865" y2="298" markerEnd="url(#arrow-down)" />
        </g>

        {/* ─── TIER 4: 4 CORE MODULES ─── */}
        {/* Module 1: Product Catalogue */}
        <g>
          <rect x="25" y="300" width="220" height="66" rx="8" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="135" y="338" textAnchor="middle" fill="#FFFFFF" fontSize="13.5" fontWeight="600" fontFamily="sans-serif">
            Product Catalogue
          </text>
        </g>

        {/* Module 2: Inventory & Requests */}
        <g>
          <rect x="270" y="300" width="220" height="66" rx="8" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="380" y="338" textAnchor="middle" fill="#FFFFFF" fontSize="13.5" fontWeight="600" fontFamily="sans-serif">
            Inventory &amp; Requests
          </text>
        </g>

        {/* Module 3: Dealer & Distributor Management */}
        <g>
          <rect x="510" y="300" width="220" height="66" rx="8" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="620" y="328" textAnchor="middle" fill="#FFFFFF" fontSize="12.5" fontWeight="600" fontFamily="sans-serif">
            Dealer &amp; Distributor
          </text>
          <text x="620" y="348" textAnchor="middle" fill="#FFFFFF" fontSize="12.5" fontWeight="600" fontFamily="sans-serif">
            Management
          </text>
        </g>

        {/* Module 4: Warranty Management */}
        <g>
          <rect x="755" y="300" width="220" height="66" rx="8" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="865" y="338" textAnchor="middle" fill="#FFFFFF" fontSize="13.5" fontWeight="600" fontFamily="sans-serif">
            Warranty Management
          </text>
        </g>

        {/* ─── CONNECTORS: TIER 4 ↔ TIER 5 (BI-DIRECTIONAL) ─── */}
        <g stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7">
          <line x1="135" y1="366" x2="135" y2="392" />
          <line x1="380" y1="366" x2="380" y2="392" />
          <line x1="620" y1="366" x2="620" y2="392" />
          <line x1="865" y1="366" x2="865" y2="392" />
          <line x1="135" y1="392" x2="865" y2="392" />
          {/* Bi-directional vertical bus */}
          <line x1="500" y1="395" x2="500" y2="422" markerStart="url(#arrow-up)" markerEnd="url(#arrow-down)" />
        </g>

        {/* ─── TIER 5: CENTRAL DATABASE ─── */}
        <g>
          <rect x="360" y="426" width="280" height="52" rx="8" fill="#121D24" stroke="#3D687D" strokeWidth="1.5" />
          <text x="500" y="458" textAnchor="middle" fill="#C0F0FB" fontSize="14" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.04em">
            Central Database
          </text>
        </g>
      </svg>

      {/* ─── MOBILE SVG VIEW ─── */}
      <svg
        viewBox="0 0 360 620"
        className="md:hidden w-full h-auto mx-auto max-w-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Trionyx Architecture Diagram Mobile"
      >
        <defs>
          <marker
            id="m-arrow-down"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 5 5 L 0 8.5 z" fill="#C0F0FB" />
          </marker>
          <marker
            id="m-arrow-up"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 5 1.5 L 0 5 L 5 8.5 z" fill="#C0F0FB" />
          </marker>
        </defs>

        {/* Tier 1: Client Surfaces */}
        <rect x="30" y="16" width="300" height="34" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="180" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" fontFamily="sans-serif">
          Customer Website
        </text>

        <rect x="30" y="56" width="300" height="34" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="180" y="78" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" fontFamily="sans-serif">
          Dealer Portal
        </text>

        <rect x="30" y="96" width="300" height="34" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="180" y="118" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" fontFamily="sans-serif">
          Staff Dashboard
        </text>

        {/* Connector 1 → 2 */}
        <line x1="180" y1="130" x2="180" y2="152" stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7" markerEnd="url(#m-arrow-down)" />

        {/* Tier 2: Sign-in & Access Control */}
        <rect x="30" y="154" width="300" height="42" rx="6" fill="#0E161C" stroke="#2A4857" strokeWidth="1.2" />
        <text x="180" y="180" textAnchor="middle" fill="#C0F0FB" fontSize="12.5" fontWeight="600" fontFamily="sans-serif">
          Sign-in &amp; Access Control
        </text>

        {/* Connector 2 → 3 */}
        <line x1="180" y1="196" x2="180" y2="218" stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7" markerEnd="url(#m-arrow-down)" />

        {/* Tier 3: Shared Business Services */}
        <rect x="30" y="220" width="300" height="42" rx="6" fill="#0E161C" stroke="#2A4857" strokeWidth="1.2" />
        <text x="180" y="246" textAnchor="middle" fill="#C0F0FB" fontSize="12.5" fontWeight="600" fontFamily="sans-serif">
          Shared Business Services
        </text>

        {/* Connector 3 → 4 */}
        <line x1="180" y1="262" x2="180" y2="284" stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7" markerEnd="url(#m-arrow-down)" />

        {/* Tier 4: 4 Modules */}
        <rect x="30" y="286" width="300" height="36" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="180" y="309" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" fontFamily="sans-serif">
          Product Catalogue
        </text>

        <rect x="30" y="328" width="300" height="36" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="180" y="351" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" fontFamily="sans-serif">
          Inventory &amp; Requests
        </text>

        <rect x="30" y="370" width="300" height="36" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="180" y="393" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" fontFamily="sans-serif">
          Dealer &amp; Distributor Management
        </text>

        <rect x="30" y="412" width="300" height="36" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="180" y="435" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" fontFamily="sans-serif">
          Warranty Management
        </text>

        {/* Connector 4 ↔ 5 (Bi-directional) */}
        <line x1="180" y1="452" x2="180" y2="480" stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7" markerStart="url(#m-arrow-up)" markerEnd="url(#m-arrow-down)" />

        {/* Tier 5: Central Database */}
        <rect x="40" y="484" width="280" height="46" rx="6" fill="#121D24" stroke="#3D687D" strokeWidth="1.5" />
        <text x="180" y="512" textAnchor="middle" fill="#C0F0FB" fontSize="13" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.04em">
          Central Database
        </text>
      </svg>
    </div>
  );
}
