export function GrowXCrawlArchitecture() {
  return (
    <div className="w-full bg-[#08080A] rounded-xl border border-neutral-800/80 p-3 sm:p-5 md:p-6 shadow-xl">
      {/* ─── DESKTOP SVG VIEW ─── */}
      <svg
        viewBox="0 0 900 515"
        className="hidden md:block w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="GrowX Crawl Scraper Pipeline"
      >
        <defs>
          <marker
            id="pipe-arrow-down"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 5 5 L 0 8.5 z" fill="#C0F0FB" />
          </marker>
        </defs>

        {/* ─── TITLE ─── */}
        <text
          x="450"
          y="34"
          textAnchor="middle"
          fill="#C0F0FB"
          fontSize="13"
          fontWeight="700"
          fontFamily="monospace"
          letterSpacing="0.25em"
        >
          SCRAPER PIPELINE
        </text>

        {/* ─── TIER 1: API REQUEST ─── */}
        <g>
          <rect
            x="240"
            y="54"
            width="420"
            height="46"
            rx="6"
            fill="#101114"
            stroke="#2C3138"
            strokeWidth="1.2"
          />
          <text
            x="450"
            y="82"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="14"
            fontWeight="600"
            fontFamily="sans-serif"
          >
            API request (scrape / crawl / audit)
          </text>
        </g>

        {/* ─── CONNECTOR: TIER 1 → TIER 2 ─── */}
        <line
          x1="450"
          y1="100"
          x2="450"
          y2="124"
          stroke="#C0F0FB"
          strokeWidth="1.5"
          strokeOpacity="0.75"
          markerEnd="url(#pipe-arrow-down)"
        />

        {/* ─── TIER 2: AUTHENTICATION + RATE LIMIT + CACHE ─── */}
        <g>
          <rect
            x="240"
            y="126"
            width="420"
            height="46"
            rx="6"
            fill="#0E161C"
            stroke="#2A4857"
            strokeWidth="1.2"
          />
          <text
            x="450"
            y="154"
            textAnchor="middle"
            fill="#C0F0FB"
            fontSize="14"
            fontWeight="600"
            fontFamily="sans-serif"
          >
            Authentication + rate limit + cache
          </text>
        </g>

        {/* ─── CONNECTOR: TIER 2 → TIER 3 ─── */}
        <line
          x1="450"
          y1="172"
          x2="450"
          y2="196"
          stroke="#C0F0FB"
          strokeWidth="1.5"
          strokeOpacity="0.75"
          markerEnd="url(#pipe-arrow-down)"
        />

        {/* ─── TIER 3: AUTO-ESCALATING FETCHER ─── */}
        <g>
          <rect
            x="240"
            y="198"
            width="420"
            height="46"
            rx="6"
            fill="#101114"
            stroke="#2C3138"
            strokeWidth="1.2"
          />
          <text
            x="450"
            y="226"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="14"
            fontWeight="600"
            fontFamily="sans-serif"
          >
            Auto-escalating fetcher
          </text>
        </g>

        {/* ─── CONNECTOR: TIER 3 → 3 PARALLEL FETCHERS ─── */}
        <g stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.75">
          <line x1="450" y1="244" x2="450" y2="266" />
          <line x1="175" y1="266" x2="725" y2="266" />
          <line x1="175" y1="266" x2="175" y2="284" markerEnd="url(#pipe-arrow-down)" />
          <line x1="450" y1="266" x2="450" y2="284" markerEnd="url(#pipe-arrow-down)" />
          <line x1="725" y1="266" x2="725" y2="284" markerEnd="url(#pipe-arrow-down)" />
        </g>

        {/* ─── TIER 4: 3 PARALLEL FETCHERS ─── */}
        {/* Branch 1: Fast HTTP */}
        <g>
          <rect
            x="60"
            y="286"
            width="230"
            height="48"
            rx="6"
            fill="#101114"
            stroke="#2C3138"
            strokeWidth="1.2"
          />
          <text
            x="175"
            y="316"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="13.5"
            fontWeight="600"
            fontFamily="sans-serif"
          >
            Fast HTTP
          </text>
        </g>

        {/* Branch 2: Headless browser */}
        <g>
          <rect
            x="335"
            y="286"
            width="230"
            height="48"
            rx="6"
            fill="#101114"
            stroke="#2C3138"
            strokeWidth="1.2"
          />
          <text
            x="450"
            y="316"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="13.5"
            fontWeight="600"
            fontFamily="sans-serif"
          >
            Headless browser
          </text>
        </g>

        {/* Branch 3: Stealth mode */}
        <g>
          <rect
            x="610"
            y="286"
            width="230"
            height="48"
            rx="6"
            fill="#101114"
            stroke="#2C3138"
            strokeWidth="1.2"
          />
          <text
            x="725"
            y="316"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="13.5"
            fontWeight="600"
            fontFamily="sans-serif"
          >
            Stealth mode
          </text>
        </g>

        {/* ─── CONNECTOR: 3 FETCHERS → TIER 5 ─── */}
        <g stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.75">
          <line x1="175" y1="334" x2="175" y2="354" />
          <line x1="450" y1="334" x2="450" y2="354" />
          <line x1="725" y1="334" x2="725" y2="354" />
          <line x1="175" y1="354" x2="725" y2="354" />
          <line x1="450" y1="354" x2="450" y2="372" markerEnd="url(#pipe-arrow-down)" />
        </g>

        {/* ─── TIER 5: EXTRACT AND STRUCTURE DATA ─── */}
        <g>
          <rect
            x="240"
            y="374"
            width="420"
            height="46"
            rx="6"
            fill="#0E161C"
            stroke="#2A4857"
            strokeWidth="1.2"
          />
          <text
            x="450"
            y="402"
            textAnchor="middle"
            fill="#C0F0FB"
            fontSize="14"
            fontWeight="600"
            fontFamily="sans-serif"
          >
            Extract and structure data
          </text>
        </g>

        {/* ─── CONNECTOR: TIER 5 → TIER 6 ─── */}
        <line
          x1="450"
          y1="420"
          x2="450"
          y2="444"
          stroke="#C0F0FB"
          strokeWidth="1.5"
          strokeOpacity="0.75"
          markerEnd="url(#pipe-arrow-down)"
        />

        {/* ─── TIER 6: JSON RESPONSE / JOB POLLING / WEBHOOK ─── */}
        <g>
          <rect
            x="210"
            y="446"
            width="480"
            height="48"
            rx="6"
            fill="#121D24"
            stroke="#3D687D"
            strokeWidth="1.5"
          />
          <text
            x="450"
            y="476"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="14"
            fontWeight="700"
            fontFamily="sans-serif"
            letterSpacing="0.02em"
          >
            JSON response / job polling / webhook
          </text>
        </g>
      </svg>

      {/* ─── MOBILE SVG VIEW ─── */}
      <svg
        viewBox="0 0 340 430"
        className="md:hidden w-full h-auto mx-auto max-w-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="GrowX Crawl Scraper Pipeline Mobile"
      >
        <defs>
          <marker
            id="m-pipe-arrow-down"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 5 5 L 0 8.5 z" fill="#C0F0FB" />
          </marker>
        </defs>

        {/* Mobile Title */}
        <text
          x="170"
          y="22"
          textAnchor="middle"
          fill="#C0F0FB"
          fontSize="11"
          fontWeight="700"
          fontFamily="monospace"
          letterSpacing="0.2em"
        >
          SCRAPER PIPELINE
        </text>

        {/* Tier 1 */}
        <rect x="25" y="34" width="290" height="34" rx="5" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="170" y="56" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="600" fontFamily="sans-serif">
          API request (scrape / crawl / audit)
        </text>

        {/* Connector 1 → 2 */}
        <line x1="170" y1="68" x2="170" y2="84" stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.75" markerEnd="url(#m-pipe-arrow-down)" />

        {/* Tier 2 */}
        <rect x="25" y="86" width="290" height="34" rx="5" fill="#0E161C" stroke="#2A4857" strokeWidth="1.2" />
        <text x="170" y="108" textAnchor="middle" fill="#C0F0FB" fontSize="11" fontWeight="600" fontFamily="sans-serif">
          Authentication + rate limit + cache
        </text>

        {/* Connector 2 → 3 */}
        <line x1="170" y1="120" x2="170" y2="136" stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.75" markerEnd="url(#m-pipe-arrow-down)" />

        {/* Tier 3 */}
        <rect x="25" y="138" width="290" height="34" rx="5" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="170" y="160" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="600" fontFamily="sans-serif">
          Auto-escalating fetcher
        </text>

        {/* Connector 3 → 4 */}
        <g stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.75">
          <line x1="170" y1="172" x2="170" y2="186" />
          <line x1="72" y1="186" x2="268" y2="186" />
          <line x1="72" y1="186" x2="72" y2="198" markerEnd="url(#m-pipe-arrow-down)" />
          <line x1="170" y1="186" x2="170" y2="198" markerEnd="url(#m-pipe-arrow-down)" />
          <line x1="268" y1="186" x2="268" y2="198" markerEnd="url(#m-pipe-arrow-down)" />
        </g>

        {/* Tier 4: 3 Parallel Fetchers */}
        <rect x="26" y="200" width="92" height="42" rx="5" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="72" y="225" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="600" fontFamily="sans-serif">
          Fast HTTP
        </text>

        <rect x="124" y="200" width="92" height="42" rx="5" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="170" y="220" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">
          Headless
        </text>
        <text x="170" y="233" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">
          browser
        </text>

        <rect x="222" y="200" width="92" height="42" rx="5" fill="#101114" stroke="#2C3138" strokeWidth="1" />
        <text x="268" y="225" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="600" fontFamily="sans-serif">
          Stealth mode
        </text>

        {/* Connector 4 → 5 */}
        <g stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.75">
          <line x1="72" y1="242" x2="72" y2="254" />
          <line x1="170" y1="242" x2="170" y2="254" />
          <line x1="268" y1="242" x2="268" y2="254" />
          <line x1="72" y1="254" x2="268" y2="254" />
          <line x1="170" y1="254" x2="170" y2="266" markerEnd="url(#m-pipe-arrow-down)" />
        </g>

        {/* Tier 5 */}
        <rect x="25" y="268" width="290" height="34" rx="5" fill="#0E161C" stroke="#2A4857" strokeWidth="1.2" />
        <text x="170" y="290" textAnchor="middle" fill="#C0F0FB" fontSize="11" fontWeight="600" fontFamily="sans-serif">
          Extract and structure data
        </text>

        {/* Connector 5 → 6 */}
        <line x1="170" y1="302" x2="170" y2="318" stroke="#C0F0FB" strokeWidth="1.5" strokeOpacity="0.75" markerEnd="url(#m-pipe-arrow-down)" />

        {/* Tier 6 */}
        <rect x="15" y="320" width="310" height="44" rx="5" fill="#121D24" stroke="#3D687D" strokeWidth="1.4" />
        <text x="170" y="339" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="700" fontFamily="sans-serif">
          JSON response / job polling /
        </text>
        <text x="170" y="353" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="700" fontFamily="sans-serif">
          webhook
        </text>
      </svg>
    </div>
  );
}
