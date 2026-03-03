"use client";
import { useState, useEffect } from "react";
import { supabase, signInWithGoogle, hasSubmittedToday } from "@/lib/supabase";
import { getThemeOfTheDay } from "@/lib/themes";
import Logo from "@/components/Logo";
import Ticker from "@/components/Ticker";
import Countdown from "@/components/Countdown";
import type { User } from "@supabase/supabase-js";

function getVideoId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export default function HomePage() {
  const theme = getThemeOfTheDay();
  const [user, setUser] = useState<User | null>(null);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const videoId = getVideoId(link);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
  }, []);

  useEffect(() => {
    if (user) {
      hasSubmittedToday(user.id, theme).then(setAlreadySubmitted);
    }
  }, [user, theme]);

  async function handleSubmit() {
    if (!videoId || !user) return;
    setLoading(true);
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await res.json();
      await supabase.from("submissions").insert({
        video_id: videoId,
        title: data.title,
        theme,
        user_id: user.id,
        submitter: user.user_metadata?.full_name ?? "anonymous",
      });
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, paddingTop: 4 }}>
          <span className="stamp" style={{ transform: "rotate(-5deg)" }}>LIVE NOW</span>
          <span style={{ fontFamily: "var(--fb)", fontSize: 10, color: "var(--faded)", fontWeight: 800 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}
          </span>
        </div>
      </div>

      <Ticker items={["MUSIC BY HUMANS", "NOT ALGORITHMS", "SUBMIT BEFORE MIDNIGHT", "NO ROBOTS ALLOWED"]} />

      <div style={{ padding: "20px 18px 0" }} className="fade-up1">
        <div style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--faded)", marginBottom: 6 }}>— today's prompt —</div>
        <div style={{ borderLeft: "5px solid var(--red)", paddingLeft: 14, marginBottom: 20 }}>
          <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(26px,7vw,38px)", lineHeight: 1.1, color: "var(--ink)" }}>{theme}</h1>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 14 }}>
            <Countdown />
          </div>
        </div>

        {/* NOT LOGGED IN */}
        {!user && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontFamily: "var(--fm)", fontSize: 14, color: "var(--faded)", marginBottom: 16 }}>
              sign in to drop your pick
            </p>
            <button onClick={signInWithGoogle}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--ff)", fontSize: 13, letterSpacing: "0.1em", background: "var(--ink)", color: "#fff", border: "2.5px solid var(--ink)", borderRadius: 8, padding: "12px 20px", cursor: "pointer", boxShadow: "4px 4px 0 var(--red)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              SIGN IN WITH GOOGLE
            </button>
          </div>
        )}

        {/* ALREADY SUBMITTED */}
        {user && alreadySubmitted && (
          <div style={{ textAlign: "center", padding: "28px 16px", border: "2.5px dashed var(--border)", borderRadius: 8 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <p style={{ fontFamily: "var(--fd)", fontSize: 22, color: "var(--ink)" }}>YOU'RE IN THE MIX</p>
            <p style={{ fontFamily: "var(--fb)", fontSize: 12, color: "var(--faded)", marginTop: 6, fontWeight: 700 }}>
              you already submitted today · come back tomorrow
            </p>
          </div>
        )}

        {/* SUBMISSION FORM */}
        {user && !alreadySubmitted && (
          <>
            {videoId && (
              <div style={{ marginBottom: 12, border: "2.5px solid var(--ink)", borderRadius: 8, overflow: "hidden", boxShadow: "3px 3px 0 var(--ink)", animation: "popIn .3s ease both" }}>
                <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="preview" style={{ width: "100%", display: "block", maxHeight: 155, objectFit: "cover" }} />
                <div style={{ background: "var(--red-pale)", borderTop: "2px solid var(--red)", padding: "7px 12px", fontSize: 12, fontFamily: "var(--ff)", color: "var(--red)", letterSpacing: "0.06em" }}>
                  ✓ VALID YOUTUBE LINK
                </div>
              </div>
            )}
            <div className="input-wrap">
              <label>YOUR PICK:</label>
              <input value={link} onChange={e => setLink(e.target.value)} placeholder="paste a youtube link..." />
            </div>
            <button className="btn-primary" onClick={handleSubmit} disabled={!videoId || loading}>
              {loading ? <span className="spinner" /> : "SUBMIT YOUR PICK →"}
            </button>
            <p style={{ textAlign: "center", marginTop: 8, fontFamily: "var(--fb)", fontSize: 11, color: "var(--faded)", fontWeight: 700 }}>
              one submission per person · results at midnight
            </p>
          </>
        )}
      </div>
    </div>
  );
}
