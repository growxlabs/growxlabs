const labels = ["Customers", "Dealers", "Website", "Enquiries", "Sales", "Management"];

const layouts = [
  {
    viewBox: "0 0 1120 320",
    className: "hidden w-full lg:block",
    width: 176,
    positions: [[8, 40], [8, 200], [240, 120], [472, 120], [704, 120], [936, 120]],
    paths: ["M184 80 H204 Q212 80 212 88 V152 Q212 160 220 160 H240", "M184 240 H204 Q212 240 212 232 V168 Q212 160 220 160 H240", "M416 160 H472", "M648 160 H704", "M880 160 H936"],
    arrows: ["234,156 240,160 234,164", "466,156 472,160 466,164", "698,156 704,160 698,164", "930,156 936,160 930,164"],
  },
  {
    viewBox: "0 0 360 620",
    className: "mx-auto w-full max-w-sm lg:hidden",
    width: 160,
    positions: [[8, 8], [192, 8], [100, 144], [100, 272], [100, 400], [100, 528]],
    paths: ["M88 88 V108 Q88 116 96 116 H172 Q180 116 180 124 V144", "M272 88 V108 Q272 116 264 116 H188 Q180 116 180 124 V144", "M180 224 V272", "M180 352 V400", "M180 480 V528"],
    arrows: ["176,138 180,144 184,138", "176,266 180,272 184,266", "176,394 180,400 184,394", "176,522 180,528 184,522"],
  },
];

export function TrionyxArchitecture() {
  return (
    <div className="border-y border-neutral-800 py-8 sm:py-12">
      {layouts.map((layout) => (
        <svg key={layout.viewBox} viewBox={layout.viewBox} className={layout.className} role="img" aria-label="Customers and Dealers connect to the Website. The Website passes Enquiries to Sales, then Management." fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#C0F0FB" strokeOpacity="0.5" strokeWidth="1.5">
            {layout.paths.map((path) => <path key={path} d={path} />)}
          </g>
          <g fill="#C0F0FB">
            {layout.arrows.map((points) => <polygon key={points} points={points} />)}
          </g>
          {layout.positions.map(([x, y], index) => (
            <g key={labels[index]}>
              <rect x={x} y={y} width={layout.width} height={80} rx={12} fill={index === 2 ? "#142329" : "#101113"} stroke={index === 2 ? "#9BC9D4" : "#34383B"} />
              <text x={x + layout.width / 2} y={y + 41} textAnchor="middle" dominantBaseline="middle" fill={index === 2 ? "#C0F0FB" : "#F5F5F5"} fontSize={18} fontWeight={500} className="font-sans">
                {labels[index]}
              </text>
            </g>
          ))}
        </svg>
      ))}
    </div>
  );
}
