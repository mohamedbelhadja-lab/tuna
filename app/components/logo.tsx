export default function Logo({ size = "lg" }: { size?: "lg" | "sm" }) {
  const big = size === "lg";
  return (
    <div style={{ lineHeight: 1, userSelect: "none", display: "inline-block" }}>
      <div style={{ display: "inline-block", position: "relative" }}>
        <span style={{ fontFamily: "var(--fd)", fontSize: big ? 50 : 21, color: "var(--ink)", display: "block", lineHeight: 1, letterSpacing: "0.03em" }}>
          ALGO
        </span>
        <span style={{ position: "absolute", left: -2, right: -2, top: "48%", transform: "translateY(-2px)", display: "block", pointerEvents: "none" }}>
          <span style={{ display: "block", height: big ? 3 : 2, background: "var(--red)", marginBottom: big ? 4 : 2, borderRadius: 1 }} />
          <span style={{ display: "block", height: big ? 2 : 1.5, background: "var(--red)", opacity: 0.5, borderRadius: 1 }} />
        </span>
      </div>
      <div style={{ fontFamily: "var(--fd)", fontSize: big ? 54 : 23, color: "var(--red)", lineHeight: 0.9, letterSpacing: "0.01em", marginTop: big ? -2 : -1 }}>
        RHYTHMS
      </div>
    </div>
  );
}
