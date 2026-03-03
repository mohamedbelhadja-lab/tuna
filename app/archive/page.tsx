"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getPastDays } from "@/lib/themes";
import Ticker from "@/components/Ticker";

type DayEntry = {
  dateStr: string;
  date: Date;
  theme: string;
  trackCount: number | null; // null = loading
};

export default function ArchivePage() {
  const pastDays = getPastDays(30);
  const [entries, setEntries] = useState<DayEntry[]>(
    pastDays.map(d => ({ ...d, trackCount: null }))
  );

  useEffect(() => {
    async function loadCounts() {
      // Fetch track counts for all past themes in one query
      const themes = pastDays.map(d => d.theme);

      const { data } = await supabase
        .from("submissions")
        .select("theme")
        .in("theme", themes);

      if (!data) return;

      // Count per theme
      const counts: Record<string, number> = {};
      data.forEach(row => {
        counts[row.theme] = (counts[row.theme] ?? 0) + 1;
      });

      setEntries(
        pastDays.map(d => ({
          ...d,
          trackCount: counts[d.theme] ?? 0,
        }))
      );
    }

    loadCounts();
  }, []);

  // Only show days that have at least 1 track (or are still loading)
  const visible = entries.filter(e => e.trackCount === null || e.trackCount > 0);

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: "28px 20px 20px", borderBottom: "2.5px solid var(--ink)" }}>
        <div style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--faded)", marginBottom: 6 }}>
          the vault
        </div>
        <h1 style={{ fontFamily: "var(--fd)", fontSize: 46, lineHeight: 1 }}>
          PAST<br /><span style={{ color: "var(--red)" }}>PLAYLISTS</span>
        </h1>
        <p style={{ fontFamily: "var(--fb)", fontWeight: 700, fontSize: 13, color: "var(--faded)", marginTop: 10, lineHeight: 1.5 }}>
          Every prompt. Every pick. All the human taste, archived.
        </p>
      </div>

      <Ticker items={["THE VAULT", "PURE HUMAN TASTE", "EVERY DAY A NEW PROMPT", "ZERO ALGORITHMS"]} />

      <div style={{ padding: "16px 16px" }}>
        {visible.length === 0 && entries[0]?.trackCount !== null && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 28, color: "var(--border)", marginBottom: 12 }}>
              NOTHING YET
            </div>
            <p style={{ fontFamily: "var(--fb)", fontWeight: 700, color: "var(--faded)", fontSize: 13 }}>
              the archive fills up as days go by
            </p>
          </div>
        )}

        {visible.map((entry, i) => {
          const loading = entry.trackCount === null;
          const formattedDate = entry.date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }).toUpperCase();

          return (
            <Link
              key={entry.dateStr}
              href={`/archive/${entry.dateStr}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "var(--white)",
                  border: "2.5px solid var(--ink)",
                  borderRadius: 12,
                  marginBottom: 10,
                  overflow: "hidden",
                  boxShadow: "3px 3px 0 var(--ink)",
                  animation: `fadeUp .35s ${i * 0.04}s ease both`,
                  opacity: 0,
                  animationFillMode: "forwards",
                  transition: "transform .12s, box-shadow .12s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translate(-1px, -1px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "5px 5px 0 var(--ink)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 0 var(--ink)";
                }}
              >
                {/* Red top bar */}
                <div style={{ height: 4, background: i === 0 ? "var(--red)" : "var(--cream2)" }} />

                <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Date block */}
                  <div style={{
                    flexShrink: 0,
                    background: i === 0 ? "var(--red)" : "var(--cream2)",
                    border: "2px solid var(--ink)",
                    borderRadius: 8,
                    padding: "6px 10px",
                    textAlign: "center",
                    minWidth: 52,
                  }}>
                    <div style={{
                      fontFamily: "var(--ff)",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      color: i === 0 ? "#fff" : "var(--faded)",
                    }}>
                      {entry.date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                    </div>
                    <div style={{
                      fontFamily: "var(--fd)",
                      fontSize: 26,
                      lineHeight: 1,
                      color: i === 0 ? "#fff" : "var(--ink)",
                    }}>
                      {entry.date.getDate()}
                    </div>
                    <div style={{
                      fontFamily: "var(--ff)",
                      fontSize: 8,
                      letterSpacing: "0.08em",
                      color: i === 0 ? "rgba(255,255,255,.7)" : "var(--faded)",
                    }}>
                      {entry.date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                    </div>
                  </div>

                  {/* Theme */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: "var(--fd)",
                      fontSize: 15,
                      color: "var(--ink)",
                      lineHeight: 1.2,
                      marginBottom: 6,
                    }}>
                      {entry.theme}
                    </p>
                    {loading ? (
                      <div style={{
                        width: 60, height: 10,
                        background: "var(--cream2)",
                        borderRadius: 4,
                        animation: "pulse 1.4s ease infinite",
                      }} />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          fontFamily: "var(--ff)",
                          fontSize: 10,
                          letterSpacing: "0.1em",
                          color: "var(--faded)",
                        }}>
                          {entry.trackCount} TRACK{entry.trackCount !== 1 ? "S" : ""}
                        </span>
                        {i === 0 && (
                          <span style={{
                            fontFamily: "var(--fb)",
                            fontWeight: 800,
                            fontSize: 9,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            background: "var(--red)",
                            color: "#fff",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}>
                            YESTERDAY
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div style={{
                    fontFamily: "var(--fd)",
                    fontSize: 20,
                    color: "var(--border)",
                    flexShrink: 0,
                  }}>
                    →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
