export function TrionyxArchitecture() {
  return (
    <div className="w-full bg-[#08080A] rounded-xl border border-neutral-800/80 p-3 sm:p-5 md:p-6 shadow-xl">
      {/* ─── DESKTOP SVG VIEW ─── */}
      <svg
        viewBox="0 0 1000 398"
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
          <rect x="100" y="16" width="220" height="44" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="210" y="43" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="600" fontFamily="sans-serif">
            Customer Website
          </text>
        </g>

        {/* Dealer Portal */}
        <g>
          <rect x="390" y="16" width="220" height="44" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="500" y="43" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="600" fontFamily="sans-serif">
            Dealer Portal
          </text>
        </g>

        {/* Staff Dashboard */}
        <g>
          <rect x="680" y="16" width="220" height="44" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="790" y="43" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="600" fontFamily="sans-serif">
            Staff Dashboard
          </text>
        </g>

        {/* ─── CONNECTORS: TIER 1 → TIER 2 ─── */}
        <g stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7">
          <path d="M 210 60 L 210 80 L 500 80" />
          <path d="M 790 60 L 790 80 L 500 80" />
          <line x1="500" y1="60" x2="500" y2="80" />
          <line x1="500" y1="80" x2="500" y2="98" markerEnd="url(#arrow-down)" />
        </g>

        {/* ─── TIER 2: SIGN-IN & ACCESS CONTROL ─── */}
        <g>
          <rect x="340" y="100" width="320" height="40" rx="6" fill="#0E161C" stroke="#2A4857" strokeWidth="1.2" />
          <text x="500" y="125" textAnchor="middle" fill="#C0F0FB" fontSize="13.5" fontWeight="600" fontFamily="sans-serif">
            Sign-in &amp; Access Control
          </text>
        </g>

        {/* ─── CONNECTORS: TIER 2 → TIER 3 ─── */}
        <g stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7">
          <line x1="500" y1="140" x2="500" y2="162" markerEnd="url(#arrow-down)" />
        </g>

        {/* ─── TIER 3: SHARED BUSINESS SERVICES ─── */}
        <g>
          <rect x="340" y="164" width="320" height="40" rx="6" fill="#0E161C" stroke="#2A4857" strokeWidth="1.2" />
          <text x="500" y="189" textAnchor="middle" fill="#C0F0FB" fontSize="13.5" fontWeight="600" fontFamily="sans-serif">
            Shared Business Services
          </text>
        </g>

        {/* ─── CONNECTORS: TIER 3 → TIER 4 ─── */}
        <g stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7">
          <line x1="500" y1="204" x2="500" y2="222" />
          <line x1="135" y1="222" x2="865" y2="222" />
          <line x1="135" y1="222" x2="135" y2="240" markerEnd="url(#arrow-down)" />
          <line x1="380" y1="222" x2="380" y2="240" markerEnd="url(#arrow-down)" />
          <line x1="620" y1="222" x2="620" y2="240" markerEnd="url(#arrow-down)" />
          <line x1="865" y1="222" x2="865" y2="240" markerEnd="url(#arrow-down)" />
        </g>

        {/* ─── TIER 4: 4 CORE MODULES ─── */}
        {/* Module 1: Product Catalogue */}
        <g>
          <rect x="25" y="242" width="220" height="56" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="135" y="275" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="600" fontFamily="sans-serif">
            Product Catalogue
          </text>
        </g>

        {/* Module 2: Inventory & Requests */}
        <g>
          <rect x="270" y="242" width="220" height="56" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="380" y="275" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="600" fontFamily="sans-serif">
            Inventory &amp; Requests
          </text>
        </g>

        {/* Module 3: Dealer & Distributor Management */}
        <g>
          <rect x="510" y="242" width="220" height="56" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="620" y="266" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" fontFamily="sans-serif">
            Dealer &amp; Distributor
          </text>
          <text x="620" y="284" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" fontFamily="sans-serif">
            Management
          </text>
        </g>

        {/* Module 4: Warranty Management */}
        <g>
          <rect x="755" y="242" width="220" height="56" rx="6" fill="#101114" stroke="#2C3138" strokeWidth="1.2" />
          <text x="865" y="275" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="600" fontFamily="sans-serif">
            Warranty Management
          </text>
        </g>

        {/* ─── CONNECTORS: TIER 4 ↔ TIER 5 (BI-DIRECTIONAL) ─── */}
        <g stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7">
          <line x1="135" y1="298" x2="135" y2="316" />
          <line x1="380" y1="298" x2="380" y2="316" />
          <line x1="620" y1="298" x2="620" y2="316" />
          <line x1="865" y1="298" x2="865" y2="316" />
          <line x1="135" y1="316" x2="865" y2="316" />
          <line x1="500" y1="318" x2="500" y2="338" markerStart="url(#arrow-up)" markerEnd="url(#arrow-down)" />
        </g>

        {/* ─── TIER 5: CENTRAL DATABASE ─── */}
        <g>
          <rect x="360" y="340" width="280" height="42" rx="6" fill="#121D24" stroke="#3D687D" strokeWidth="1.5" />
          <text x="500" y="366" textAnchor="middle" fill="#C0F0FB" fontSize="13.5" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.04em">
            Central Database
          </text>
        </g>
      </svg>

      {/* ─── MOBILE SVG VIEW ─── */}
      <svg
        viewBox="0 0 340 460"
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
        <rect x="30" y="12" width="280" height="30" rx="5" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="170" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="600" fontFamily="sans-serif">
          Customer Website
        </text>

        <rect x="30" y="48" width="280" height="30" rx="5" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="170" y="68" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="600" fontFamily="sans-serif">
          Dealer Portal
        </text>

        <rect x="30" y="84" width="280" height="30" rx="5" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="170" y="104" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="600" fontFamily="sans-serif">
          Staff Dashboard
        </text>

        {/* Connector 1 → 2 */}
        <line x1="170" y1="116" x2="170" y2="132" stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7" markerEnd="url(#m-arrow-down)" />

        {/* Tier 2: Sign-in & Access Control */}
        <rect x="30" y="134" width="280" height="36" rx="5" fill="#0E161C" stroke="#2A4857" strokeWidth="1.2" />
        <text x="170" y="156" textAnchor="middle" fill="#C0F0FB" fontSize="12" fontWeight="600" fontFamily="sans-serif">
          Sign-in &amp; Access Control
        </text>

        {/* Connector 2 → 3 */}
        <line x1="170" y1="170" x2="170" y2="186" stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7" markerEnd="url(#m-arrow-down)" />

        {/* Tier 3: Shared Business Services */}
        <rect x="30" y="188" width="280" height="36" rx="5" fill="#0E161C" stroke="#2A4857" strokeWidth="1.2" />
        <text x="170" y="210" textAnchor="middle" fill="#C0F0FB" fontSize="12" fontWeight="600" fontFamily="sans-serif">
          Shared Business Services
        </text>

        {/* Connector 3 → 4 */}
        <line x1="170" y1="224" x2="170" y2="240" stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7" markerEnd="url(#m-arrow-down)" />

        {/* Tier 4: 4 Modules */}
        <rect x="30" y="242" width="280" height="32" rx="5" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="170" y="262" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="600" fontFamily="sans-serif">
          Product Catalogue
        </text>

        <rect x="30" y="278" width="280" height="32" rx="5" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="170" y="298" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="600" fontFamily="sans-serif">
          Inventory &amp; Requests
        </text>

        <rect x="30" y="314" width="280" height="32" rx="5" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="170" y="334" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="600" fontFamily="sans-serif">
          Dealer &amp; Distributor Management
        </text>

        <rect x="30" y="350" width="280" height="32" rx="5" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="170" y="370" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="600" fontFamily="sans-serif">
          Warranty Management
        </text>

        {/* Connector 4 ↔ 5 (Bi-directional) */}
        <line x1="170" y1="384" x2="170" y2="406" stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.7" markerStart="url(#m-arrow-up)" markerEnd="url(#m-arrow-down)" />

        {/* Tier 5: Central Database */}
        <rect x="30" y="408" width="280" height="38" rx="5" fill="#121D24" stroke="#3D687D" strokeWidth="1.5" />
        <text x="170" y="431" textAnchor="middle" fill="#C0F0FB" fontSize="12.5" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.04em">
          Central Database
        </text>
      </svg>
    </div>
  );
}
