"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getThemeForDate } from "@/lib/themes";
import Ticker from "@/components/Ticker";

type Video = {
  id: string;
  title: string;
  submitter: string;
  likes: number;
  submission_id: number;
};

export default function ArchiveDayPage() {
  const params  = useParams();
  const router  = useRouter();
  const dateStr = params.date as string; // e.g. "2026-02-14"

  const [videos, setVideos] = useState<Video[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme]   = useState("");
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    // Validate date format
    const parsed = new Date(dateStr + "T00:00:00");
    if (isNaN(parsed.getTime())) { setInvalid(true); return; }

    // Must be in the past
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (parsed >= today) { setInvalid(true); return; }

    const t = getThemeForDate(parsed);
    setTheme(t);

    async function load() {
      const { data } = await supabase
        .from("submissions")
        .select("id, video_id, title, submitter, likes")
        .eq("theme", t)
        // Filter to submissions made on this specific date
        .gte("created_at", dateStr + "T00:00:00.000Z")
        .lt("created_at",  dateStr + "T23:59:59.999Z")
        .order("likes", { ascending: false });

      setVideos(
        (data ?? []).map(d => ({
          id: d.video_id,
          submission_id: d.id,
          title: d.title,
          submitter: d.submitter ?? "anonymous",
          likes: d.likes ?? 0,
        }))
      );
      setLoading(false);
    }

    load();
  }, [dateStr]);

  const parsed = new Date(dateStr + "T00:00:00");
  const formattedDate = isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  if (invalid) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 28, color: "var(--ink)", marginBottom: 12 }}>
          INVALID DATE
        </div>
        <p style={{ fontFamily: "var(--fb)", fontWeight: 700, color: "var(--faded)", fontSize: 13, marginBottom: 20 }}>
          That date doesn't exist in the archive.
        </p>
        <button
          onClick={() => router.push("/archive")}
          style={{
            fontFamily: "var(--fd)", fontSize: 16, letterSpacing: "0.06em",
            background: "var(--red)", color: "#fff",
            border: "2.5px solid var(--ink)", borderRadius: 8,
            padding: "12px 24px", cursor: "pointer",
            boxShadow: "3px 3px 0 var(--ink)",
          }}
        >
          ← BACK TO ARCHIVE
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "2.5px solid var(--ink)" }}>
        <button
          onClick={() => router.push("/archive")}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontFamily: "var(--ff)", fontSize: 11, letterSpacing: "0.1em",
            color: "var(--faded)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6,
          }}
        >
          ← ARCHIVE
        </button>

        <div style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--faded)", marginBottom: 6 }}>
          {formattedDate.toUpperCase()}
        </div>
        <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(22px, 6vw, 36px)", lineHeight: 1.1, color: "var(--ink)", marginBottom: 12 }}>
          {theme}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!loading && (
            <span style={{
              fontFamily: "var(--ff)", fontSize: 10, letterSpacing: "0.12em", color: "var(--faded)",
            }}>
              {videos.length} TRACK{videos.length !== 1 ? "S" : ""}
            </span>
          )}
          <span className="stamp" style={{ transform: "rotate(-3deg)" }}>
            THE VAULT
          </span>
        </div>
      </div>

      <Ticker items={["FROM THE VAULT", "HUMAN PICKS ONLY", "ZERO ALGORITHMS", "PURE TASTE"]} />

      <div style={{ padding: "12px 16px" }}>
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                height: 72, background: "var(--white)",
                border: "2.5px solid var(--ink)", borderRadius: 12,
                boxShadow: "3px 3px 0 var(--ink)",
                animation: "pulse 1.4s ease infinite",
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 28, color: "var(--border)", marginBottom: 12 }}>
              NO PICKS
            </div>
            <p style={{ fontFamily: "var(--fb)", fontWeight: 700, color: "var(--faded)", fontSize: 13 }}>
              nobody submitted on this day
            </p>
          </div>
        )}

        {videos.map((video, i) => {
          const isA = active === video.id;
          return (
            <div
              key={video.id}
              className="card"
              style={{
                marginBottom: 10,
                overflow: "hidden",
                animation: `fadeUp .35s ${i * 0.05}s ease both`,
                opacity: 0,
                animationFillMode: "forwards",
              }}
            >
              <div style={{ height: 4, background: isA ? "var(--red)" : "var(--cream2)", transition: "background .2s" }} />

              <div
                onClick={() => setActive(isA ? null : video.id)}
                style={{ display: "flex", gap: 10, padding: "10px 12px", alignItems: "center", cursor: "pointer" }}
              >
                {/* Track number */}
                <div style={{
                  fontFamily: "var(--fd)", fontSize: 24,
                  color: isA ? "var(--red)" : "var(--border)",
                  minWidth: 32, flexShrink: 0,
                  transition: "color .2s",
                }}>
                  {isA ? "▶" : String(i + 1).padStart(2, "0")}
                </div>

                {/* Thumbnail */}
                <img
                  src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                  alt={video.title}
                  style={{
                    width: 56, height: 40, objectFit: "cover",
                    borderRadius: 6, border: "2px solid var(--ink)", flexShrink: 0,
                  }}
                />

                {/* Title + submitter */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "var(--fb)", fontWeight: 800, fontSize: 13,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    color: "var(--ink)", marginBottom: 2,
                  }}>
                    {video.title}
                  </p>
                  <p style={{ fontFamily: "var(--fb)", fontWeight: 700, fontSize: 11, color: "var(--faded)" }}>
                    by {video.submitter}
                  </p>
                </div>

                {/* Likes (read-only in archive) */}
                {video.likes > 0 && (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    background: "var(--cream2)", border: "2px solid var(--border)",
                    borderRadius: 8, padding: "6px 10px", flexShrink: 0, minWidth: 44,
                  }}>
                    <span style={{ fontSize: 12, lineHeight: 1 }}>♥</span>
                    <span style={{
                      fontFamily: "var(--ff)", fontSize: 10,
                      color: "var(--faded)", letterSpacing: "0.05em",
                    }}>
                      {video.likes}
                    </span>
                  </div>
                )}
              </div>

              {/* Expanded embed */}
              {isA && (
                <div style={{ borderTop: "2px solid var(--ink)" }}>
                  <iframe
                    width="100%"
                    height="200"
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    style={{ display: "block", border: "none" }}
                  />
                </div>
              )}
            </div>
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
