"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getThemeOfTheDay } from "@/lib/themes";
import Logo from "@/components/Logo";
import Ticker from "@/components/Ticker";
import Countdown from "@/components/Countdown";

function getVideoId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export default function HomePage() {
  const theme = getThemeOfTheDay();
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const videoId = getVideoId(link);

  async function handleSubmit() {
    if (!videoId) return alert("Invalid YouTube link");
    setLoading(true);
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await res.json();
      await supabase.from("submissions").insert({ video_id: videoId, title: data.title, theme });
      window.location.href = "/success";
    } catch {
      alert("Submission failed");
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Logo size="lg" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, paddingTop: 4 }}>
          <span className="stamp" style={{ transform: "rotate(-5deg)" }}>LIVE NOW</span>
          <span style={{ fontFamily: "var(--fb)", fontSize: 10, color: "var(--faded)", fontWeight: 800, letterSpacing: "0.06em" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}
          </span>
        </div>
      </div>

      <Ticker items={["MUSIC BY HUMANS", "NOT ALGORITHMS", "SUBMIT BEFORE MIDNIGHT", "NO ROBOTS ALLOWED"]} />

      {/* Prompt + form */}
      <div style={{ padding: "20px 18px 0" }} className="fade-up1">
        <div style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--faded)", marginBottom: 6 }}>— today's prompt —</div>
        <div style={{ borderLeft: "5px solid var(--red)", paddingLeft: 14, marginBottom: 20 }}>
          <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(26px,7vw,38px)", lineHeight: 1.1, color: "var(--ink)" }}>{theme}</h1>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 14 }}>
            <Countdown />
          </div>
        </div>

        {/* Preview */}
        {videoId && (
          <div style={{ marginBottom: 12, border: "2.5px solid var(--ink)", borderRadius: 8, overflow: "hidden", boxShadow: "3px 3px 0 var(--ink)", animation: "popIn .3s ease both" }}>
            <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="preview" style={{ width: "100%", display: "block", maxHeight: 155, objectFit: "cover" }} />
            <div style={{ background: "var(--red-pale)", borderTop: "2px solid var(--red)", padding: "7px 12px", fontSize: 12, fontFamily: "var(--ff)", color: "var(--red)", letterSpacing: "0.06em" }}>
              ✓ VALID YOUTUBE LINK
            </div>
          </div>
        )}

        {/* Input */}
        <div className="input-wrap">
          <label>YOUR PICK:</label>
          <input
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="paste a youtube link..."
          />
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={!videoId || loading}>
          {loading ? <span className="spinner" /> : "SUBMIT YOUR PICK →"}
        </button>
        <p style={{ textAlign: "center", marginTop: 8, fontFamily: "var(--fb)", fontSize: 11, color: "var(--faded)", fontWeight: 700 }}>
          one submission per person · results at midnight
        </p>
      </div>
    </div>
  );
}
