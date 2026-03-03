export default function Ticker({ items }: { items: string[] }) {
  const text = items.join("  ✦  ") + "  ✦  ";
  return (
    <div style={{ background: "var(--red)", color: "var(--cream)", overflow: "hidden", whiteSpace: "nowrap", padding: "7px 0", fontFamily: "var(--ff)", fontSize: 11, letterSpacing: "0.14em", borderTop: "2.5px solid var(--ink)", borderBottom: "2.5px solid var(--ink)" }}>
      <span style={{ display: "inline-block", animation: "ticker 20s linear infinite" }}>
        {text}{text}
      </span>
    </div>
  );
}
