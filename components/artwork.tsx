import { useId } from "react";

export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 52"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 15 24 4l19 11v23L24 49 5 38Z M5 15l19 11 19-11M24 26v23M14 10l20 11v17l-10 6M14 10v11l20 12M5 26l10-6 19 11 9-5" />
    </svg>
  );
}

function branches(
  x: number,
  y: number,
  length: number,
  angle: number,
  depth: number,
  seed: number,
): string {
  if (!depth) return "";
  const nx = x + Math.cos(angle) * length,
    ny = y + Math.sin(angle) * length;
  const spread = 0.32 + (Math.sin(seed * 4.1) + 1) * 0.17;
  return (
    `M${x.toFixed(1)},${y.toFixed(1)}L${nx.toFixed(1)},${ny.toFixed(1)} ` +
    branches(nx, ny, length * 0.72, angle - spread, depth - 1, seed + 1) +
    branches(nx, ny, length * 0.69, angle + spread, depth - 1, seed + 3) +
    (depth > 3
      ? branches(nx, ny, length * 0.52, angle + 0.04, depth - 2, seed + 7)
      : "")
  );
}
const tree = branches(0, 0, 72, -Math.PI / 2, 8, 4);
export function Tree({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill="none"
      stroke="currentColor"
    >
      <path d={tree} strokeWidth=".65" opacity=".8" />
      <path d="M-2 0 0-80 2 0" fill="currentColor" strokeWidth=".4" />
      <path d="M-35 1H36" strokeWidth=".5" />
    </g>
  );
}

export function ElevationDrawing({ shaded = true }: { shaded?: boolean }) {
  const id = useId().replaceAll(":", "");
  return (
    <g className={shaded ? "elevation-render" : "elevation-sketch"}>
      <defs>
        <pattern
          id={`hatch${id}`}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(35)"
        >
          <path d="M0 0V5" stroke="#282828" strokeWidth=".45" opacity=".32" />
        </pattern>
        <pattern
          id={`concrete${id}`}
          width="17"
          height="13"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M2 3h1m8 5h.6m-6 3h.7m9-9h.5"
            stroke="#282828"
            strokeWidth=".7"
            opacity=".3"
          />
        </pattern>
      </defs>
      <g stroke="#8e8e87" strokeWidth=".55" fill="none" opacity=".55">
        {[160, 250, 390, 520, 650, 745, 850].map((x) => (
          <path key={x} d={`M${x} 108V529`} />
        ))}
        {[153, 260, 370, 468].map((y) => (
          <path key={y} d={`M135 ${y}H875`} />
        ))}
        <path d="M155 525H856M155 519v12m700-12v12M228 126H762M228 119v14m534-14v14" />
        <path d="m148 532 14-14m687 14 14-14M219 134l15-15m521 15 15-15" />
      </g>
      <g fill="none" stroke="#282828" strokeWidth="1">
        <Tree x={174} y={480} scale={0.95} />
        <Tree x={817} y={480} scale={1.12} />
        <path d="M105 482H890" />
        <path d="M242 164H730V480H242Z" fill={shaded ? "#b8b9af" : "none"} />
        {shaded && (
          <path d="M242 164H730V480H242Z" fill={`url(#concrete${id})`} />
        )}
        <path
          d="M252 171H718V266H252Z M252 287H718V374H252Z"
          fill={shaded ? "#72776f" : "none"}
        />
        <path
          d="M258 178H366V254H258Z M400 178H510V254H400Z M542 178H709V254H542Z"
          fill={shaded ? "#d8dcd1" : "none"}
        />
        <path
          d="M258 297H367V365H258Z M400 296H511V365H400Z M542 296H709V365H542Z"
          fill={shaded ? "#c9ccc1" : "none"}
        />
        {shaded && (
          <g fill={`url(#hatch${id})`} stroke="none">
            <path d="M258 178h108v76H258ZM400 296h111v69H400ZM542 178h167v76H542Z" />
          </g>
        )}
        <g strokeWidth=".6">
          {[282, 316, 351, 421, 452, 486, 560, 599, 638, 678].map((x) => (
            <path key={x} d={`M${x} 178V254M${x} 297V365`} />
          ))}
        </g>
        {shaded && (
          <g fill="#51544d" opacity=".38" stroke="none">
            <path d="M242 276h488v17H242ZM242 382h488v12H242ZM268 171l99 84H268ZM540 300l128 64H540ZM533 396l105 84H533Z" />
          </g>
        )}
        <path
          d="M234 153h13v327h-13ZM371 149h13v331h-13ZM516 145h12v335h-12ZM723 153h13v327h-13Z"
          fill={shaded ? "#c7c9be" : "none"}
        />
        <path
          d="M244 265H726v12H244ZM244 372H726v11H244Z"
          fill={shaded ? "#777c73" : "none"}
        />
        <path d="M384 265h132v129H384Z" fill={shaded ? "#cdd0c5" : "none"} />
        <path d="M392 279h116v102H392ZM427 279v102m40-102v102" fill="none" />
        <path d="M397 385h106v7H397" />
        <path
          d="M284 399h45v81h-45ZM570 402h49v78h-49Z"
          fill={shaded ? "#73766e" : "none"}
        />
        <path
          d="M288 402h37v78h-37ZM574 405h41v75h-41Z"
          fill={shaded ? "#c8cbbf" : "none"}
        />
        <path
          d="M187 419h96v61h-96ZM188 480H146v-6h5v-6h5v-6h5v-6h5v-6h5v-6h5v-6h5v-6h6Z"
          fill={shaded ? "#d6d7cd" : "none"}
        />
        {Array.from({ length: 10 }, (_, i) => (
          <path
            key={i}
            d={`M${149 + i * 4} ${476 - i * 5.4}H283`}
            strokeWidth=".65"
          />
        ))}
        <path d="M190 419v-40m-4 2h95m-12-3v41m-52-39v39" />
        <path
          d="M650 406h99v74h-99ZM749 439h88v41h-88Z"
          fill={shaded ? "#c9cbc1" : "none"}
        />
        {shaded && <path d="M650 406h99v74h-99Z" fill={`url(#hatch${id})`} />}
        <path d="M637 406V383h117v56m-10-56v23m-28-23v23m-30-23v23m-27-23v23" />
        <path
          d="M224 480V153h33m458 0h33M234 158h13m124-4h13m132-4h12m195 8h13"
          strokeWidth=".65"
        />
        <path d="M302 480v-69m302 69v-66" strokeWidth=".5" />
      </g>
      <g fontFamily="monospace" fontSize="7" fill="#77776f">
        <text x="460" y="538">
          SOUTH ELEVATION · 1:100
        </text>
        <text x="453" y="121">
          18 400
        </text>
        <text x="139" y="502">
          ± 0.000
        </text>
        <text x="770" y="267">
          + 6.200
        </text>
      </g>
    </g>
  );
}
export function Elevation({
  className = "",
  shaded = true,
}: {
  className?: string;
  shaded?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 1000 620"
      role="img"
      aria-label="Original architectural elevation of a concrete pavilion, detailed glazing, stairs and trees"
    >
      <ElevationDrawing shaded={shaded} />
    </svg>
  );
}

export function FloorPlan({
  className = "",
  highlight = false,
}: {
  className?: string;
  highlight?: boolean;
}) {
  return (
    <svg
      className={`floor-plan ${className}`}
      viewBox="0 0 700 640"
      role="img"
      aria-label="Architectural floor plan with meeting rooms, workspaces, door swings and dimension lines"
    >
      <g fill="none" stroke="#999b91" strokeWidth=".6">
        {Array.from({ length: 10 }, (_, i) => (
          <path
            key={i}
            d={`M${95 + i * 55} 35V603M60 ${55 + i * 58}H660`}
            strokeDasharray="3 4"
            opacity=".4"
          />
        ))}
        <path d="M131 58H575M124 73v-25m462 25v-25M106 81V549m-10-468h25M96 549h25M135 583h446m-446-14v23m446-23v23" />
        {[130, 285, 422, 581].map((x) => (
          <path key={x} d={`M${x} 564v30m-5-7 10-10`} />
        ))}
        <path d="M137 86H576V540H137Z" />
      </g>
      {highlight && (
        <rect
          className="plan-alert"
          x="148"
          y="94"
          width="265"
          height="151"
          fill="#fa3600"
          opacity=".75"
        />
      )}
      <g stroke="#363831" strokeWidth="9" fill="none" strokeLinecap="square">
        <path d="M132 163V82h89m49 0h127m47 0h137v195m0 56v210H447m-49 0H286m-56 0h-98V402m0-55V212" />
        <path d="M137 251h70m50 0h166m0-164v104m0 54v154m0 45v99M426 252h66m53 0h35M137 397h195m55 0h193M283 83v59m0 49v59M135 170h147M214 251v92m0 45v7M135 334h78M285 400v82m0 38v23" />
      </g>
      <g fill="none" stroke="#92958b" strokeWidth="1">
        <path d="M221 82v49a49 49 0 0 0 49-49M397 82v47a47 47 0 0 0 47-47M207 251v50a50 50 0 0 0 50-50M492 252v53a53 53 0 0 0 53-53M283 142h49a49 49 0 0 1-49 49M332 398v55a55 55 0 0 0 55-55M285 482h38a38 38 0 0 1-38 38M230 543v-56a56 56 0 0 1 56 56" />
        <path className="editable-door" d="M423 191h-54a54 54 0 0 0 54 54" />
        <rect x="321" y="110" width="62" height="94" rx="6" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x="308" y={117 + i * 22} width="10" height="16" rx="2" />
            <rect x="386" y={117 + i * 22} width="10" height="16" rx="2" />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={270 + i * 47} y="288" width="39" height="54" />
            <path d={`M${275 + i * 47} 284v-12h29v12m-29 63v12h29v-12`} />
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x="474" y={107 + i * 25} width="57" height="21" />
            <rect x="539" y={108 + i * 25} width="15" height="18" rx="3" />
          </g>
        ))}
        <path d="M148 103h40v45h-40ZM150 110h36M148 194h39v38h-39ZM151 201h33" />
        <ellipse cx="167" cy="215" rx="10" ry="12" />
        <ellipse cx="167" cy="126" rx="10" ry="12" />
        <path d="M150 271h22v45h-22m4-39h14v14h-14M176 279h23v29h-23Z" />
        <path d="M151 416h114v19H151ZM151 440h19v65h-19ZM176 506h86v18h-86" />
        <rect x="190" y="463" width="54" height="26" rx="2" />
        <path d="M304 422h91v96h-91Z M309 429h80v83h-80Z" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={i} d={`M309 ${432 + i * 11}h80`} />
        ))}
        <rect x="461" y="427" width="80" height="69" rx="3" />
        <path d="M469 435h64v19h-64ZM460 501h82" />
        <path d="M147 352h47v28h-47Z" />
        <path d="M439 283h121v92H439Z" strokeDasharray="3 3" />
        <circle cx="499" cy="329" r="30" />
        <path d="M478 308l42 42m0-42-42 42" />
      </g>
      <g fill="#73766c" fontFamily="monospace" fontSize="7" textAnchor="middle">
        <text x="352" y="224">
          MEETING / 01
        </text>
        <text x="335" y="378">
          OPEN WORKSPACE
        </text>
        <text x="495" y="520">
          STUDIO / 04
        </text>
        <text x="214" y="536">
          LOUNGE
        </text>
        <text x="350" y="53">
          24 000
        </text>
        <text x="206" y="601">
          8 400
        </text>
        <text x="359" y="601">
          7 200
        </text>
        <text x="499" y="601">
          8 400
        </text>
        <text transform="translate(93 320) rotate(-90)">18 000</text>
      </g>
      <g className="plan-issue-pins" fill="#fa3600">
        <rect x="123" y="179" width="18" height="18" />
        <rect x="413" y="213" width="18" height="18" />
        <rect x="204" y="352" width="18" height="18" />
      </g>
    </svg>
  );
}

export function Pavilion({ className = "" }: { className?: string }) {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      viewBox="0 0 800 800"
      className={className}
      role="img"
      aria-label="Original perspective drawing of a modern pavilion on a paved plaza"
    >
      <defs>
        <pattern
          id={`pav${id}`}
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 0v4" stroke="#282828" strokeWidth=".45" />
        </pattern>
      </defs>
      <circle cx="164" cy="210" r="114" fill="#b7b8ae" />
      <path d="M595 0h138v496H595Z" fill="#c1c3b7" />
      <g stroke="#60645b" strokeWidth="1" fill="none">
        <path d="M0 657 800 337M0 698 800 391M0 742 800 453M0 792 800 526M130 800 800 610M390 800 800 707" />
        {[0, 90, 210, 350, 530, 760, 1000, 1350].map((x, i) => (
          <path key={i} d={`M510 380 ${x - 200} 800`} />
        ))}
      </g>
      <path
        d="m68 462 666-238 66 54L122 540Z"
        fill="#b9bcb0"
        stroke="#53574d"
      />
      <path d="m122 498 678-220v43L122 546Z" fill="#dddcd2" stroke="#666b5e" />
      <path d="m165 535 563-185v152L165 684Z" fill="#6d7566" />
      <path
        d="m165 535 563-185v152L165 684Z"
        fill={`url(#pav${id})`}
        opacity=".45"
      />
      <path d="m165 552 563-185v21L165 572Z" fill="#cfcec2" />
      {[235, 375, 570, 720].map((x, i) => (
        <g key={x}>
          <path
            d={`M${x} ${500 - i * 52}l30-10v173l-30 10Z`}
            fill="#c3c6b8"
            stroke="#555d4d"
          />
          <path
            d={`M${x + 30} ${490 - i * 52}l14 5v164l-14 4Z`}
            fill="#909985"
          />
        </g>
      ))}
      <path d="m68 462 54 36v48l-54-39Z" fill="#8b9280" stroke="#535b4c" />
      {Array.from({ length: 16 }, (_, i) => (
        <path
          key={i}
          d={`M${100 + i * 41} ${451 - i * 14.7}v41`}
          stroke="#e0e0da"
          strokeWidth="3"
        />
      ))}
      <path d="m513 579 112-35 86 94-114 35Z" fill="#646e5d" opacity=".5" />
      <g fill="#393f32">
        <circle cx="325" cy="626" r="4" />
        <path
          d="m321 632 8-1 2 27h-12ZM323 657l-3 16m7-16 4 16"
          stroke="#393f32"
          strokeWidth="2"
        />
      </g>
      <g fontFamily="monospace" fontSize="8" fill="#75786f">
        <text x="25" y="766">
          HERON / PAVILION STUDY
        </text>
        <text x="640" y="766">
          PERSPECTIVE 02
        </text>
      </g>
    </svg>
  );
}

export function Terrain() {
  const id = useId().replaceAll(":", "");
  const ridge = [
    [0, 190],
    [70, 156],
    [145, 34],
    [220, 165],
    [293, 114],
    [365, 201],
    [439, 102],
    [502, 142],
    [581, 57],
    [658, 149],
    [736, 92],
    [800, 152],
  ];
  return (
    <svg viewBox="0 0 800 320" aria-hidden="true">
      <defs>
        <pattern
          id={`terrain-hatch-${id}`}
          width="3"
          height="4"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(24)"
        >
          <path d="M0 0v4" stroke="#454940" strokeWidth=".5" />
        </pattern>
      </defs>
      <path
        d={`M0 250 ${ridge.map((p) => `L${p.join(" ")}`).join(" ")} L800 320H0Z`}
        fill="#b9bcb0"
      />
      {ridge.slice(0, -1).map(([x, y], i) => (
        <g key={x}>
          <path
            d={`M${x} ${y} L${ridge[i + 1].join(" ")} ${x + 65} 320Z`}
            fill={i % 2 ? "#d4d5cc" : "#818779"}
          />
          <path
            d={`M${x} ${y} L${x + 65} 320 ${x - 50} 320Z`}
            fill={`url(#terrain-hatch-${id})`}
            opacity=".55"
          />
          {Array.from({ length: 6 }, (_, n) => (
            <path
              key={n}
              d={`M${x} ${y}Q${x + 10 + n * 4} ${y + 55} ${x - 30 + n * 18} 320`}
              fill="none"
              stroke="#626958"
              strokeWidth=".5"
              opacity=".6"
            />
          ))}
        </g>
      ))}
      <path
        d="M0 285 160 232 292 277 391 231 506 280 649 241 800 287V320H0Z"
        fill="#d8d9cf"
      />
      <path
        d="m71 320 95-82 110 82m40 0 77-81 86 81m57 0 119-75 85 75"
        stroke="#8c9383"
        fill="none"
        strokeWidth=".7"
      />
    </svg>
  );
}
