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

function HowItWorksCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{ background: "var(--white)", border: "2.5px solid var(--ink)", borderRadius: 12, padding: "20px 18px", boxShadow: "4px 4px 0 var(--ink)" }}>
      <div style={{ fontFamily: "var(--fd)", fontSize: 42, color: "var(--red)", lineHeight: 1, marginBottom: 8 }}>{num}</div>
      <div style={{ fontFamily: "var(--fd)", fontSize: 18, color: "var(--ink)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--faded)", fontWeight: 700, lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

export default function HomePage() {
  const theme = getThemeOfTheDay();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [link, setLink] = useState("");
  const [reason, setReason] = useState(""); // ← NEW
  const [loading, setLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [time, setTime] = useState("");
  const videoId = getVideoId(link);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) hasSubmittedToday(user.id, theme).then(setAlreadySubmitted);
  }, [user, theme]);

  useEffect(() => {
    const tick = () => {
      const now = new Date(), mid = new Date();
      mid.setHours(24, 0, 0, 0);
      const d = mid.getTime() - now.getTime();
      const h = Math.floor(d / 3600000);
      const m = Math.floor((d % 3600000) / 60000);
      const s = Math.floor((d % 60000) / 1000);
      setTime(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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
        reason: reason.trim() || null, // ← NEW
        user_id: user.id,
        submitter: user.user_metadata?.full_name ?? "anonymous",
      });
      window.location.href = "/success";
    } catch {
      alert("Submission failed");
      setLoading(false);
    }
  }

  const tickerText = "MUSIC BY HUMANS  ✦  NOT ALGORITHMS  ✦  ONE PICK A DAY  ✦  CURATED WITH LOVE  ✦  NO ROBOTS ALLOWED  ✦  ";

  // Don't flash wrong state while checking auth
  if (authLoading) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
      <div style={{ fontFamily: "var(--fd)", fontSize: 20, color: "var(--faded)" }}>...</div>
    </div>
  );

  // ── LOGGED IN VIEW ────────────────────────────────────────────────────────
  if (user) return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>

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

      <div style={{ flex: 1, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Prompt */}
        <div style={{ borderLeft: "5px solid var(--red)", paddingLeft: 16 }}>
          <p style={{ fontFamily: "var(--fb)", fontSize: 11, fontWeight: 800, color: "var(--faded)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Today's prompt</p>
          <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(28px, 8vw, 42px)", lineHeight: 1.05, color: "var(--ink)" }}>{theme}</h1>
          <div style={{ marginTop: 10 }}><Countdown /></div>
        </div>

        {/* Already submitted */}
        {alreadySubmitted && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12, padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>✅</div>
            <p style={{ fontFamily: "var(--fd)", fontSize: 28, color: "var(--ink)", lineHeight: 1.1 }}>YOU'RE IN<br />THE MIX</p>
            <p style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--faded)", fontWeight: 700 }}>you already submitted today<br />come back tomorrow</p>
            <a href="/playlist" style={{ marginTop: 8, display: "inline-block", fontFamily: "var(--fd)", fontSize: 16, letterSpacing: "0.06em", background: "var(--ink)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 8, padding: "12px 24px", textDecoration: "none", boxShadow: "3px 3px 0 var(--red)" }}>
              SEE TODAY'S PLAYLIST →
            </a>
          </div>
        )}

        {/* Submission form */}
        {!alreadySubmitted && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* YouTube preview */}
            {videoId && (
              <div style={{ border: "2.5px solid var(--ink)", borderRadius: 10, overflow: "hidden", boxShadow: "3px 3px 0 var(--ink)" }}>
                <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="preview" style={{ width: "100%", display: "block", maxHeight: 160, objectFit: "cover" }} />
                <div style={{ background: "var(--red-pale)", borderTop: "2px solid var(--red)", padding: "8px 14px", fontFamily: "var(--fb)", fontSize: 12, fontWeight: 800, color: "var(--red)" }}>
                  ✓ YouTube link detected
                </div>
              </div>
            )}

            {/* Link input */}
            <div style={{ border: `2.5px solid ${link ? "var(--red)" : "var(--ink)"}`, borderRadius: 10, background: "var(--white)", boxShadow: link ? "3px 3px 0 var(--red)" : "3px 3px 0 var(--ink)", transition: "all .18s" }}>
              <p style={{ padding: "10px 16px 0", fontFamily: "var(--fb)", fontSize: 11, fontWeight: 800, color: "var(--faded)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Your pick</p>
              <input
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="paste youtube link here..."
                style={{ display: "block", width: "100%", border: "none", outline: "none", background: "transparent", color: "var(--ink)", fontFamily: "var(--fb)", fontWeight: 800, fontSize: 16, padding: "8px 16px 14px" }}
              />
            </div>

            {/* ── NEW: Reason / comment field ── */}
            <div style={{ border: "2.5px solid var(--ink)", borderRadius: 10, background: "var(--white)", boxShadow: "3px 3px 0 var(--ink)" }}>
              <p style={{ padding: "10px 16px 0", fontFamily: "var(--fb)", fontSize: 11, fontWeight: 800, color: "var(--faded)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Why this song?{" "}
                <span style={{ color: "var(--border)", fontWeight: 700, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
              </p>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="tell us why you picked this one..."
                maxLength={280}
                rows={3}
                style={{
                  display: "block",
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "var(--ink)",
                  fontFamily: "var(--fb)",
                  fontWeight: 800,
                  fontSize: 14,
                  padding: "8px 16px 14px",
                  resize: "none",
                  boxSizing: "border-box",
                  lineHeight: 1.5,
                }}
              />
              {reason.length > 0 && (
                <p style={{ padding: "0 16px 10px", fontFamily: "var(--fb)", fontSize: 10, fontWeight: 700, color: reason.length > 250 ? "var(--red)" : "var(--border)", textAlign: "right" }}>
                  {reason.length}/280
                </p>
              )}
            </div>
            {/* ── END: Reason / comment field ── */}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!videoId || loading}
              style={{ width: "100%", border: "2.5px solid var(--ink)", borderRadius: 10, background: videoId && !loading ? "var(--red)" : "var(--cream2)", color: videoId && !loading ? "#fff" : "var(--faded)", fontFamily: "var(--fd)", fontSize: 24, letterSpacing: "0.06em", padding: "16px", cursor: videoId && !loading ? "pointer" : "not-allowed", boxShadow: videoId && !loading ? "4px 4px 0 var(--ink)" : "none", transition: "all .15s" }}
            >
              {loading ? <span style={{ display: "inline-block", width: 20, height: 20, border: "3px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite", verticalAlign: "middle" }} /> : "SUBMIT YOUR PICK →"}
            </button>
            <p style={{ textAlign: "center", fontFamily: "var(--fb)", fontSize: 11, color: "var(--faded)", fontWeight: 700 }}>one submission per person · results at midnight</p>
          </div>
        )}
      </div>
    </div>
  );

  // ── LANDING VIEW (not logged in) ──────────────────────────────────────────
  return (
    <div style={{ minHeight: "100dvh", background: "var(--cream)" }}>

      {/* Nav */}
      <div style={{ padding: "20px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2.5px solid var(--ink)" }}>
        <Logo />
        <button onClick={signInWithGoogle} style={{ fontFamily: "var(--ff)", fontSize: 10, letterSpacing: "0.1em", background: "var(--ink)", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer" }}>
          SIGN IN
        </button>
      </div>

      {/* Ticker */}
      <div style={{ background: "var(--red)", color: "var(--cream)", overflow: "hidden", whiteSpace: "nowrap", padding: "8px 0", fontFamily: "var(--ff)", fontSize: 11, letterSpacing: "0.14em", borderTop: "2.5px solid var(--ink)", borderBottom: "2.5px solid var(--ink)" }}>
        <span style={{ display: "inline-block", animation: "ticker 22s linear infinite" }}>{tickerText}{tickerText}</span>
      </div>

      {/* Hero */}
      <div style={{ padding: "36px 20px 32px", borderBottom: "2.5px solid var(--ink)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--red-pale)", border: "1.5px solid var(--red)", borderRadius: 99, padding: "4px 12px", marginBottom: 20 }}>
          <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--red)", animation: "blink 1.5s ease infinite" }} />
          <span style={{ fontFamily: "var(--ff)", fontSize: 10, color: "var(--red)", letterSpacing: "0.12em" }}>LIVE TODAY · {time} LEFT</span>
        </div>

        <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(36px, 10vw, 52px)", lineHeight: 1.0, color: "var(--ink)", marginBottom: 16 }}>
          MUSIC DISCOVERY,<br />
          <span style={{ color: "var(--red)" }}>BY HUMANS.</span><br />
          NOT ALGORITHMS.
        </h1>

        <p style={{ fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700, color: "var(--faded)", lineHeight: 1.6, marginBottom: 28 }}>
          Every day there's a new prompt. You submit one song. By midnight, a playlist is curated — entirely by real people with real taste.
        </p>

        {/* Today's prompt teaser */}
        <div style={{ borderLeft: "5px solid var(--red)", paddingLeft: 14, marginBottom: 28 }}>
          <p style={{ fontFamily: "var(--fb)", fontSize: 11, fontWeight: 800, color: "var(--faded)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Today's prompt</p>
          <p style={{ fontFamily: "var(--fd)", fontSize: 24, color: "var(--ink)", lineHeight: 1.1 }}>{theme}</p>
        </div>

        <button onClick={signInWithGoogle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--ink)", color: "#fff", border: "2.5px solid var(--ink)", borderRadius: 10, padding: "16px 24px", cursor: "pointer", fontFamily: "var(--fd)", fontSize: 22, letterSpacing: "0.06em", boxShadow: "5px 5px 0 var(--red)", marginBottom: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          JOIN WITH GOOGLE
        </button>
        <p style={{ textAlign: "center", fontFamily: "var(--fb)", fontSize: 11, color: "var(--faded)", fontWeight: 700 }}>free · one pick per day · no spam</p>
      </div>

      {/* How it works */}
      <div style={{ padding: "32px 20px", borderBottom: "2.5px solid var(--ink)" }}>
        <p style={{ fontFamily: "var(--ff)", fontSize: 11, letterSpacing: "0.14em", color: "var(--faded)", marginBottom: 16 }}>HOW IT WORKS</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <HowItWorksCard num="01" title="A PROMPT DROPS" desc="Every day at midnight a new theme appears. Best road trip song. Music to cook pasta to. Song that changed your life." />
          <HowItWorksCard num="02" title="YOU SUBMIT ONE PICK" desc="Paste a YouTube link of your song. One submission per person per day. No voting, no ranking — just your gut." />
          <HowItWorksCard num="03" title="THE PLAYLIST BUILDS" desc="By midnight every submission becomes the day's playlist. Curated entirely by real music lovers with no algorithm in sight." />
        </div>
      </div>

      {/* Manifesto */}
      <div style={{ background: "var(--ink)", padding: "28px 20px", borderBottom: "2.5px solid var(--ink)" }}>
        <p style={{ fontFamily: "var(--fd)", fontSize: 26, color: "var(--cream)", lineHeight: 1.2, marginBottom: 12 }}>
          ALGORITHMS OPTIMIZE FOR ENGAGEMENT.<br />
          <span style={{ color: "var(--red)" }}>WE OPTIMIZE FOR TASTE.</span>
        </p>
        <p style={{ fontFamily: "var(--fb)", fontSize: 13, color: "rgba(250,244,232,.6)", fontWeight: 700, lineHeight: 1.6 }}>
          No black box. No engagement loops. Just a daily prompt and the collective taste of people who actually care about music.
        </p>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: "32px 20px 48px", textAlign: "center" }}>
        <div style={{ display: "inline-block", border: "2.5px solid var(--red)", color: "var(--red)", fontFamily: "var(--ff)", fontSize: 10, letterSpacing: "0.14em", padding: "3px 10px", transform: "rotate(-2deg)", marginBottom: 20 }}>
          FREE TO JOIN
        </div>
        <h2 style={{ fontFamily: "var(--fd)", fontSize: 30, color: "var(--ink)", lineHeight: 1.1, marginBottom: 20 }}>
          WHAT'S TODAY'S<br /><span style={{ color: "var(--red)" }}>PLAYLIST?</span>
        </h2>
        <button onClick={signInWithGoogle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--red)", color: "#fff", border: "2.5px solid var(--ink)", borderRadius: 10, padding: "16px 24px", cursor: "pointer", fontFamily: "var(--fd)", fontSize: 20, letterSpacing: "0.06em", boxShadow: "4px 4px 0 var(--ink)", marginBottom: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          JOIN WITH GOOGLE
        </button>
        <p style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--faded)", fontWeight: 700 }}>algorhythms.app</p>
      </div>
    </div>
  );
}
