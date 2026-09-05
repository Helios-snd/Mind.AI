/**
 * Original SVG artwork for Mind.AI — hand-authored, no third-party assets.
 * Palette follows the brand tokens: brand (deep olive) #56663A, light (sage)
 * #87945A, sage #D9DCA8, cream #F5EBD7, ink #2F3325, earth #8C8A6E.
 */

const INK = "#17213E";
const BRAND = "#4056C8";
const LIGHT = "#8494E8";
const PEACH = "#DCE5FF";
const CREAM = "#F5F7FF";
const LAV = "#7384C8";

type ArtProps = { className?: string };

function Frame({
  children,
  className = "",
  viewBox = "0 0 400 300",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  viewBox?: string;
  label: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={label}
      className={`block ${className || "h-full w-full"}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {children}
    </svg>
  );
}

/* ---------- Hero: meditating figure ---------- */
export function MeditationScene({ className }: ArtProps) {
  return (
    <Frame
      className={className}
      viewBox="52 40 300 225"
      label="Illustration of a person meditating"
    >
      <rect x="-20" y="-20" width="440" height="340" fill={CREAM} />
      <circle cx="205" cy="150" r="115" fill="#fff" opacity="0.55" />
      <path d="M60 250c40-60 80-70 140-70s100 10 140 70z" fill={PEACH} opacity="0.6" />
      {/* leaves */}
      <path d="M120 210c-18-6-30-24-28-44 20 2 36 20 34 44z" fill={LAV} />
      <path d="M285 208c18-8 28-28 24-48-20 4-34 24-30 48z" fill={LIGHT} opacity="0.8" />
      {/* body */}
      <path d="M150 236c8-46 26-70 55-70s47 24 55 70z" fill={BRAND} />
      <path d="M205 166c-30 0-46 22-52 56 34-14 70-14 104 0-6-34-22-56-52-56z" fill={LIGHT} />
      {/* arms resting on knees */}
      <circle cx="158" cy="212" r="9" fill={LIGHT} />
      <circle cx="252" cy="212" r="9" fill={LIGHT} />
      {/* head */}
      <circle cx="205" cy="120" r="26" fill={PEACH} />
      <path d="M181 118c2-20 12-32 24-32s22 12 24 32c-16-8-32-8-48 0z" fill={INK} />
      {/* sprout */}
      <path d="M205 92c0-12 6-20 16-22-2 12-8 20-16 22z" fill="#6E8C4A" />
      <path d="M205 92c0-10-5-17-14-19 1 11 6 17 14 19z" fill="#8AA96A" />
      <line x1="205" y1="98" x2="205" y2="86" stroke="#6E8C4A" strokeWidth="3" />
      {/* face */}
      <path d="M197 122q4 4 8 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M211 122q4 4 8 0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* birds */}
      <path d="M300 70q8-8 16 0" stroke={BRAND} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M318 84q6-6 12 0" stroke={LIGHT} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M96 84q6-6 12 0" stroke={BRAND} strokeWidth="3" fill="none" strokeLinecap="round" />
    </Frame>
  );
}

/* ---------- Two figures / matching ---------- */
export function MatchScene({ className }: ArtProps) {
  return (
    <Frame
      className={className}
      viewBox="88 84 250 188"
      label="Illustration of two people talking"
    >
      <rect x="-20" y="-20" width="440" height="340" fill={CREAM} />
      <circle cx="140" cy="150" r="90" fill="#fff" opacity="0.6" />
      <circle cx="275" cy="165" r="80" fill={PEACH} opacity="0.5" />
      {/* person A */}
      <path d="M96 244c4-38 20-58 44-58s40 20 44 58z" fill={BRAND} />
      <circle cx="140" cy="150" r="22" fill={PEACH} />
      <path d="M120 148c2-16 9-26 20-26s18 10 20 26c-13-7-27-7-40 0z" fill={INK} />
      {/* person B */}
      <path d="M232 246c4-34 18-52 40-52s36 18 40 52z" fill={LAV} />
      <circle cx="272" cy="164" r="20" fill={PEACH} />
      <path d="M254 162c2-14 8-24 18-24s16 10 18 24c-12-6-24-6-36 0z" fill="#4A443A" />
      {/* speech bubbles */}
      <rect x="150" y="96" width="60" height="34" rx="14" fill="#fff" />
      <circle cx="168" cy="113" r="4" fill={BRAND} />
      <circle cx="180" cy="113" r="4" fill={BRAND} />
      <circle cx="192" cy="113" r="4" fill={BRAND} />
      <path d="M164 130l-8 12 18-6z" fill="#fff" />
      <rect x="214" y="120" width="46" height="28" rx="12" fill={BRAND} />
      <path d="M244 148l8 10-16-4z" fill={BRAND} />
    </Frame>
  );
}

/* ---------- Care / heart ---------- */
export function CareScene({ className }: ArtProps) {
  return (
    <Frame
      className={className}
      viewBox="80 90 240 180"
      label="Illustration of a person holding a heart"
    >
      <rect x="-20" y="-20" width="440" height="340" fill={CREAM} />
      <circle cx="200" cy="150" r="110" fill="#fff" opacity="0.55" />
      <path d="M70 252c36-56 74-66 130-66s94 10 130 66z" fill={PEACH} opacity="0.55" />
      <path d="M150 244c6-42 24-64 50-64s44 22 50 64z" fill={LAV} />
      <circle cx="200" cy="132" r="24" fill={PEACH} />
      <path d="M178 130c2-18 10-28 22-28s20 10 22 28c-14-8-30-8-44 0z" fill={INK} />
      <path
        d="M200 214c-26-16-42-30-42-48a20 20 0 0 1 38-8 20 20 0 0 1 38 8c0 18-16 32-42 48z"
        fill={BRAND}
      />
    </Frame>
  );
}

/* ---------- Coming soon / generic scene ---------- */
export function CalmScene({ className }: ArtProps) {
  return (
    <Frame
      className={className}
      viewBox="86 82 235 176"
      label="Abstract calm illustration"
    >
      <rect x="-20" y="-20" width="440" height="340" fill={CREAM} />
      <circle cx="200" cy="150" r="96" fill="#fff" opacity="0.6" />
      <path d="M120 175a80 44 0 0 1 160 0z" fill={PEACH} opacity="0.7" />
      <circle cx="200" cy="120" r="34" fill={LIGHT} />
      <circle cx="200" cy="120" r="20" fill={BRAND} />
      <path d="M80 230q120-70 240 0" stroke={LIGHT} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M96 250q104-56 208 0" stroke={BRAND} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
    </Frame>
  );
}

/* ---------- Condition glyphs (circular) ---------- */
export function ConditionGlyph({
  kind,
  className,
}: ArtProps & { kind: "depression" | "anxiety" | "adhd" }) {
  return (
    <Frame className={className} viewBox="0 0 64 64" label={`${kind} icon`}>
      <circle cx="32" cy="32" r="32" fill={CREAM} />
      {kind === "depression" && (
        <>
          <path
            d="M20 34a9 9 0 0 1 2-17 12 12 0 0 1 23 3 8 8 0 0 1-1 15z"
            fill={LIGHT}
          />
          <line x1="24" y1="42" x2="21" y2="49" stroke={BRAND} strokeWidth="3" strokeLinecap="round" />
          <line x1="33" y1="42" x2="30" y2="50" stroke={BRAND} strokeWidth="3" strokeLinecap="round" />
          <line x1="42" y1="42" x2="39" y2="49" stroke={BRAND} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {kind === "anxiety" && (
        <path
          d="M18 40c8 0 8-8 16-8s8 8 16 8M16 30c8 0 8-8 16-8s8 8 16 8M20 20c6 0 6-6 12-6"
          stroke={BRAND}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {kind === "adhd" && (
        <>
          <path d="M34 14l-10 18h9l-5 18 18-22h-9z" fill={BRAND} />
          <circle cx="18" cy="20" r="3" fill={LIGHT} />
          <circle cx="47" cy="44" r="3" fill={LIGHT} />
          <circle cx="44" cy="17" r="2.5" fill={LAV} />
        </>
      )}
    </Frame>
  );
}

/* ---------- Feature glyphs (circular) ---------- */
export function FeatureGlyph({
  kind,
  className,
}: ArtProps & { kind: "diagnosis" | "therapy" | "holistic" }) {
  return (
    <Frame className={className} viewBox="0 0 64 64" label={`${kind} icon`}>
      <circle cx="32" cy="32" r="32" fill={PEACH} opacity="0.6" />
      {kind === "diagnosis" && (
        <>
          <circle cx="29" cy="29" r="12" fill="none" stroke={BRAND} strokeWidth="4" />
          <line x1="38" y1="38" x2="48" y2="48" stroke={BRAND} strokeWidth="4" strokeLinecap="round" />
          <path d="M24 29h10M29 24v10" stroke={BRAND} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {kind === "therapy" && (
        <>
          <path d="M16 22h24a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H26l-8 7v-7a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6z" fill={BRAND} />
          <circle cx="24" cy="33" r="2.5" fill="#fff" />
          <circle cx="32" cy="33" r="2.5" fill="#fff" />
        </>
      )}
      {kind === "holistic" && (
        <>
          <circle cx="32" cy="32" r="14" fill="none" stroke={BRAND} strokeWidth="4" />
          <path d="M32 18c8 6 8 22 0 28M32 18c-8 6-8 22 0 28" stroke={LIGHT} strokeWidth="3" fill="none" />
        </>
      )}
    </Frame>
  );
}

/* ---------- Small line icons ---------- */
const ICON_PATHS: Record<string, React.ReactNode> = {
  therapy: <path d="M8 12h24a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H18l-8 6v-6a4 4 0 0 1-4-4v-8a4 4 0 0 1 4-4z" />,
  progress: <path d="M8 32V20M18 32V12M28 32V22M38 32V8" strokeLinecap="round" />,
  community: (
    <>
      <circle cx="16" cy="16" r="6" />
      <circle cx="30" cy="16" r="6" />
      <path d="M6 34c1-7 5-10 10-10s9 3 10 10M20 34c1-7 5-10 10-10s9 3 10 10" />
    </>
  ),
  book: <path d="M10 8h16a4 4 0 0 1 4 4v22H14a4 4 0 0 0-4 4V8zM30 34V12" strokeLinecap="round" />,
  music: (
    <>
      <path d="M18 30V10l16-4v18" />
      <circle cx="14" cy="30" r="4" />
      <circle cx="30" cy="24" r="4" />
    </>
  ),
  video: (
    <>
      <rect x="6" y="12" width="24" height="18" rx="3" />
      <path d="M34 16l6-4v18l-6-4z" />
    </>
  ),
  clipboard: (
    <>
      <rect x="10" y="8" width="22" height="28" rx="3" />
      <rect x="16" y="5" width="10" height="7" rx="2" />
      <path d="M16 20h10M16 27h10" strokeLinecap="round" />
    </>
  ),
  leaf: <path d="M32 8C16 10 8 20 8 34c14 0 26-8 26-26zM12 30C20 22 24 18 30 14" strokeLinecap="round" />,
};

export function LineIcon({
  name,
  className,
}: ArtProps & { name: keyof typeof ICON_PATHS }) {
  return (
    <Frame className={className} viewBox="0 0 44 44" label={`${name} icon`}>
      <circle cx="22" cy="22" r="22" fill={CREAM} />
      <g
        transform="translate(2 2)"
        fill="none"
        stroke={BRAND}
        strokeWidth="2.6"
        strokeLinejoin="round"
      >
        {ICON_PATHS[name]}
      </g>
    </Frame>
  );
}

/* ---------- Topic thumbnail (rectangular, seeded hue) ---------- */
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function TopicThumb({
  title,
  className,
}: ArtProps & { title: string }) {
  const h = hash(title);
  const rot = h % 40;
  const palettes = [
    [BRAND, LIGHT],
    [LIGHT, PEACH],
    [LAV, LIGHT],
    ["#6E8C4A", LIGHT],
  ];
  const [a, b] = palettes[h % palettes.length];
  const gid = `g${h}`;
  return (
    <Frame className={className} viewBox="0 0 400 240" label={`Artwork for ${title}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${gid})`} />
      <g transform={`rotate(${rot} 200 120)`} opacity="0.9">
        <circle cx="120" cy="90" r="70" fill="#fff" opacity="0.18" />
        <circle cx="300" cy="170" r="90" fill="#fff" opacity="0.12" />
        <path
          d="M-20 180q110-80 220-30t240-10"
          stroke="#fff"
          strokeOpacity="0.35"
          strokeWidth="6"
          fill="none"
        />
      </g>
      <circle cx="200" cy="120" r="26" fill="#fff" opacity="0.9" />
      <circle cx="200" cy="120" r="13" fill={a} />
    </Frame>
  );
}

/* ---------- Avatar (initials) ---------- */
export function Avatar({ name, className }: ArtProps & { name: string }) {
  const initials = name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const h = hash(name);
  const bg = [BRAND, LIGHT, LAV, "#6E8C4A"][h % 4];
  return (
    <Frame className={className} viewBox="0 0 64 64" label={`${name} avatar`}>
      <circle cx="32" cy="32" r="32" fill={CREAM} />
      <circle cx="32" cy="32" r="26" fill={bg} />
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-display), sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#fff"
      >
        {initials}
      </text>
    </Frame>
  );
}
