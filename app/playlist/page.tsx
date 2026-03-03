"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getThemeOfTheDay } from "@/lib/themes";
import Ticker from "@/components/Ticker";

type Video = { id: string; title: string; submitter?: string; likes?: number; };

export default function PlaylistPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const theme = getThemeOfTheDay();
      const { data } = await supabase.from("submissions").select("*").eq("theme", theme).order("created_at", { ascending: false });
      setVideos(data?.map(d => ({ id: d.video_id, title: d.title, submitter: d.submitter ?? "anonymous", likes: d.likes ?? 0 })) || []);
    }
    fetch();
  }, []);

  return (
    <div>
      <div className="page-header fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--faded)", marginBottom: 6 }}>curated by humans</div>
          <h1 style={{ fontFamily: "var(--fd)", fontSize: 46, lineHeight: 1 }}>
            TODAY'S<br /><span style={{ color: "var(--red)" }}>MIX</span>
          </h1>
        </div>
        <span className="stamp" style={{ transform: "rotate(-4deg)", marginTop: 4 }}>{videos.length} TRACKS</span>
      </div>

      <Ticker items={["TAP A TRACK TO PLAY", "ZERO ALGORITHMS", "PURE HUMAN TASTE"]} />

      <div style={{ padding: "12px 16px" }}>
        {videos.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 32, color: "var(--border)", marginBottom: 12 }}>NO PICKS YET</div>
            <p style={{ fontFamily: "var(--fb)", fontWeight: 700, color: "var(--faded)", fontSize: 13 }}>be the first to drop a pick →</p>
          </div>
        )}
        {videos.map((video, i) => {
          const isA = active === video.id;
          const isL = liked[video.id];
          return (
            <div key={video.id} className="card" style={{ marginBottom: 10, overflow: "hidden", animation: `fadeUp .4s ${i * .05}s ease both`, opacity: 0, animationFillMode: "forwards" }}>
              <div style={{ height: 4, background: isA ? "var(--red)" : "var(--cream2)", transition: "background .2s" }} />
              <div style={{ display: "flex", gap: 10, padding: "10px 10px 10px 12px", cursor: "pointer", alignItems: "center" }} onClick={() => setActive(isA ? null : video.id)}>
                <div style={{ fontFamily: "var(--fd)", fontSize: 26, color: isA ? "var(--red)" : "var(--border)", width: 32, flexShrink: 0, lineHeight: 1, textAlign: "right", transition: "color .2s" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} alt={video.title} style={{ width: 72, height: 52, objectFit: "cover", display: "block", borderRadius: 6, border: "2px solid var(--ink)" }} />
                  <div style={{ position: "absolute", inset: 0, borderRadius: 6, background: isA ? "rgba(232,52,26,.55)" : "rgba(0,0,0,.18)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s" }}>
                    <span style={{ color: "#fff", fontSize: 20 }}>{isA ? "⏸" : "▶"}</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--fb)", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{video.title}</div>
                  <div style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--faded)", marginTop: 3, fontWeight: 700 }}>by @{video.submitter}</div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setLiked(p => ({ ...p, [video.id]: !p[video.id] })); }}
                  style={{ background: isL ? "var(--red)" : "var(--white)", border: "2px solid " + (isL ? "var(--red)" : "var(--border)"), borderRadius: 7, width: 40, height: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 1, flexShrink: 0, transition: "all .15s" }}>
                  <span style={{ fontSize: 14, color: isL ? "#fff" : "var(--faded)" }}>{isL ? "♥" : "♡"}</span>
                  <span style={{ fontSize: 9, fontFamily: "var(--ff)", color: isL ? "#fff" : "var(--faded)" }}>{(video.likes || 0) + (isL ? 1 : 0)}</span>
                </button>
              </div>
              {isA && (
                <div style={{ padding: "0 12px 12px" }}>
                  <iframe width="100%" height="195" src={`https://www.youtube.com/embed/${video.id}?autoplay=1`} title={video.title} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen style={{ display: "block", borderRadius: 8, border: "2px solid var(--ink)" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
