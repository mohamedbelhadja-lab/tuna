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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) hasSubmittedToday(user.id, theme).then(setAlreadySubmitted);
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
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "2.5px solid var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Logo size="lg" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, paddingTop: 4 }}>
          <span style={{ display: "inline-block", border: "2.5px solid var(--red)", color: "var(--red)", fontFamily: "var(--ff)", fontSize: 10, letterSpacing: "0.14em", padding: "3px 8px", transform: "rotate(-4deg)" }}>LIVE NOW</span>
          <span style={{ fontFamily: "var(--fb)", fontSize: 10, color: "var(--faded)", fontWeight: 800, letterSpacing: "0.04em" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}
          </span>
        </div>
      </div>

      <Ticker items={["MUSIC BY HUMANS", "NOT ALGORITHMS", "SUBMIT BEFORE MIDNIGHT", "NO ROBOTS ALLOWED"]} />

      {/* ── Body — grows to fill screen ── */}
      <div style={{ flex: 1, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Prompt */}
        <div style={{ borderLeft: "5px solid var(--red)", paddingLeft: 16 }}>
          <p style={{ fontFamily: "var(--fb)", fontSize: 11, fontWeight: 800, color: "var(--faded)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Today's prompt</p>
          <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(28px, 8vw, 42px)", lineHeight: 1.05, color: "var(--ink)" }}>
            {theme}
          </h1>
          <div style={{ marginTop: 10 }}>
            <Countdown />
          </div>
        </div>

        {/* ── NOT LOGGED IN ── */}
        {!user && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16, padding: "32px 0" }}>
            <p style={{ fontFamily: "var(--fb)", fontWeight: 800, fontSize: 15, color: "var(--faded)", textAlign: "center" }}>
              sign in to drop your pick
            </p>
            <button onClick={signInWithGoogle} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--ink)", color: "#fff",
              border: "2.5px solid var(--ink)", borderRadius: 10,
              padding: "14px 24px", cursor: "pointer",
              fontFamily: "var(--fd)", fontSize: 18, letterSpacing: "0.06em",
              boxShadow: "4px 4px 0 var(--red)", width: "100%", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              SIGN IN WITH GOOGLE
            </button>
          </div>
        )}

        {/* ── ALREADY SUBMITTED ── */}
        {user && alreadySubmitted && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12, padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>✅</div>
            <p style={{ fontFamily: "var(--fd)", fontSize: 28, color: "var(--ink)", lineHeight: 1.1 }}>YOU'RE IN<br/>THE MIX</p>
            <p style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--faded)", fontWeight: 700 }}>
              you already submitted today<br/>come back tomorrow
            </p>
          </div>
        )}

        {/* ── SUBMISSION FORM ── */}
        {user && !alreadySubmitted && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Thumbnail preview */}
            {videoId && (
              <div style={{ border: "2.5px solid var(--ink)", borderRadius: 10, overflow: "hidden", boxShadow: "3px 3px 0 var(--ink)" }}>
                <img
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt="preview"
                  style={{ width: "100%", display: "block", maxHeight: 160, objectFit: "cover" }}
                />
                <div style={{ background: "var(--red-pale)", borderTop: "2px solid var(--red)", padding: "8px 14px", fontFamily: "var(--fb)", fontSize: 12, fontWeight: 800, color: "var(--red)", letterSpacing: "0.04em" }}>
                  ✓ YouTube link detected
                </div>
              </div>
            )}

            {/* Big input */}
            <div style={{
              border: `2.5px solid ${link ? "var(--red)" : "var(--ink)"}`,
              borderRadius: 10,
              background: "var(--white)",
              boxShadow: link ? "3px 3px 0 var(--red)" : "3px 3px 0 var(--ink)",
              transition: "all .18s",
            }}>
              <p style={{ padding: "10px 16px 0", fontFamily: "var(--fb)", fontSize: 11, fontWeight: 800, color: "var(--faded)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Your pick
              </p>
              <input
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="paste youtube link here..."
                style={{
                  display: "block", width: "100%",
                  border: "none", outline: "none",
                  background: "transparent",
                  color: "var(--ink)",
                  fontFamily: "var(--fb)", fontWeight: 800, fontSize: 16,
                  padding: "8px 16px 14px",
                }}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!videoId || loading}
              style={{
                width: "100%",
                border: "2.5px solid var(--ink)", borderRadius: 10,
                background: videoId && !loading ? "var(--red)" : "var(--cream2)",
                color: videoId && !loading ? "#fff" : "var(--faded)",
                fontFamily: "var(--fd)", fontSize: 24, letterSpacing: "0.06em",
                padding: "16px",
                cursor: videoId && !loading ? "pointer" : "not-allowed",
                boxShadow: videoId && !loading ? "4px 4px 0 var(--ink)" : "none",
                transition: "all .15s",
              }}
            >
              {loading
                ? <span style={{ display: "inline-block", width: 20, height: 20, border: "3px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite", verticalAlign: "middle" }} />
                : "SUBMIT YOUR PICK →"
              }
            </button>

            <p style={{ textAlign: "center", fontFamily: "var(--fb)", fontSize: 11, color: "var(--faded)", fontWeight: 700 }}>
              one submission per person · results at midnight
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
