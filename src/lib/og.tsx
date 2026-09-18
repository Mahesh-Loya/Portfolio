import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const VOID = "#0a0a0b";
const BONE = "#edede8";
const MUTED = "#a1a1a6";
const FAINT = "#6b6b72";
const LINE = "#232327";
const SIGNAL = "#c6f24e";

/** Satori needs real font data; these are bundled so rendering never depends on the network. */
export async function loadOgFonts() {
  const dir = join(process.cwd(), "assets");
  const [serif, sans, mono] = await Promise.all([
    readFile(join(dir, "instrument-serif.ttf")),
    readFile(join(dir, "inter-tight-500.ttf")),
    readFile(join(dir, "jetbrains-mono.ttf")),
  ]);

  return [
    { name: "Serif", data: serif, weight: 400 as const, style: "normal" as const },
    { name: "Sans", data: sans, weight: 500 as const, style: "normal" as const },
    { name: "Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}

/**
 * A resolved waveform, echoing the hero shader — the one visual motif that
 * ties a shared card back to the site it came from.
 */
function Waveform({ count = 68 }: { count?: number }) {
  const bars = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const envelope = Math.sin(t * Math.PI);
    const wave =
      Math.sin(t * Math.PI * 6) * 0.6 +
      Math.sin(t * Math.PI * 11 + 1.2) * 0.28 +
      Math.sin(t * Math.PI * 3 - 0.4) * 0.34;
    return Math.max(3, Math.abs(wave) * envelope * 92);
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        height: 100,
        flexShrink: 0,
        opacity: 0.55,
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: h,
            borderRadius: 2,
            background: i % 9 === 0 ? SIGNAL : LINE,
          }}
        />
      ))}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: VOID,
        padding: "64px 72px",
        fontFamily: "Sans",
      }}
    >
      {children}
    </div>
  );
}

function Header({ eyebrow }: { eyebrow: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 10, height: 10, borderRadius: 5, background: SIGNAL }} />
      <div
        style={{
          fontFamily: "Mono",
          fontSize: 20,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: BONE,
        }}
      >
        Mahesh Loya
      </div>
      <div style={{ width: 1, height: 20, background: LINE }} />
      <div
        style={{
          fontFamily: "Mono",
          fontSize: 20,
          letterSpacing: 2,
          color: FAINT,
        }}
      >
        {eyebrow}
      </div>
    </div>
  );
}

function Footer({ right }: { right: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}
    >
      <Waveform count={44} />
      <div
        style={{
          fontFamily: "Mono",
          fontSize: 19,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: FAINT,
          whiteSpace: "nowrap",
          paddingBottom: 4,
        }}
      >
        {right}
      </div>
    </div>
  );
}

/** The homepage card: the thesis, given the whole frame. */
export function HomeCard({ thesis, role }: { thesis: string; role: string }) {
  return (
    <Shell>
      <Header eyebrow="Full-stack & AI engineer" />
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
        <div
          style={{
            fontFamily: "Serif",
            fontSize: 92,
            lineHeight: 1.04,
            color: BONE,
            letterSpacing: -1,
          }}
        >
          {thesis}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 27,
            lineHeight: 1.4,
            color: MUTED,
            maxWidth: 780,
          }}
        >
          Voice pipelines, retrieval over live inventory, and AI products in daily
          production use.
        </div>
      </div>
      <Footer right={role} />
    </Shell>
  );
}

/** A case-study card: the project names itself, the premise says why it matters. */
export function CaseCard({
  title,
  premise,
  stack,
}: {
  title: string;
  premise: string;
  stack: string[];
}) {
  return (
    <Shell>
      <Header eyebrow="Case study" />
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
        <div
          style={{
            fontSize: 74,
            lineHeight: 1.05,
            color: BONE,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: "Serif",
            fontSize: 38,
            lineHeight: 1.28,
            color: MUTED,
            maxWidth: 900,
          }}
        >
          {premise}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 820 }}>
          {stack.slice(0, 5).map((item) => (
            <div
              key={item}
              style={{
                fontFamily: "Mono",
                fontSize: 18,
                color: FAINT,
                border: `1px solid ${LINE}`,
                padding: "7px 13px",
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 2 }}>
          <Waveform count={22} />
        </div>
      </div>
    </Shell>
  );
}
