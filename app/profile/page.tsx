"use client";
import { useState, useEffect } from "react";
import { supabase, signOut } from "@/lib/supabase";
import { getThemeOfTheDay } from "@/lib/themes";
import type { User } from "@supabase/supabase-js";

type Submission = {
  video_id: string;
  title: string;
  theme: string;
  created_at: string;
};

// ── Coming Soon card ──────────────────────────────────────────────────────────
function ComingSoonCard({
  icon, title, desc, accent = "var(--red)",
}: {
  icon: string; title: string; desc: string; accent?: string;
}) {
  return (
    <div style={{
      background: "var(--white)",
      border: "2px solid var(--ink)",
      borderRadius: 12,
      padding: "14px 14px 12px",
      boxShadow: "3px 3px 0 var(--ink)",
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 4, background: accent, borderRadius: "12px 0 0 12px",
      }} />

      <span style={{ fontSize: 24, flexShrink: 0, marginLeft: 6 }}>{icon}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
          <p style={{
            fontFamily: "var(--fd)", fontSize: 15, color: "var(--ink)",
            lineHeight: 1.1,
          }}>{title}</p>
          <span style={{
            fontFamily: "var(--fb)", fontWeight: 800, fontSize: 9,
            letterSpacing: "0.08em", textTransform: "uppercase",
            background: accent, color: "#fff",
            padding: "2px 6px", borderRadius: 4,
            flexShrink: 0,
          }}>SOON</span>
        </div>
        <p style={{
          fontFamily: "var(--fb)", fontWeight: 700, fontSize: 11,
          color: "var(--faded)", lineHeight: 1.45,
        }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchSubmissions(user.id);
    });
  }, []);

  async function fetchSubmissions(userId: string) {
    const { data } = await supabase
      .from("submissions")
      .select("video_id, title, theme, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    setSubmissions(data || []);
    setLoading(false);
  }

  function calcStreak(subs: Submission[]): number {
    if (!subs.length) return 0;
    const days = Array.from(new Set(subs.map(s => s.created_at.slice(0, 10)))).sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < days.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (days[i] === expected.toISOString().slice(0, 10)) streak++;
      else break;
    }
    return streak;
  }

  const streak = calcStreak(submissions);
  const todayTheme = getThemeOfTheDay();
  const submittedToday = submissions.some(
    s => s.theme === todayTheme &&
    s.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10)
  );

  if (!user) return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <p style={{ fontFamily: "var(--fd)", fontSize: 28, color: "var(--ink)", marginBottom: 16 }}>YOU'RE NOT<br />SIGNED IN</p>
      <p style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--faded)", fontWeight: 700 }}>go to Today to sign in</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: "28px 20px 20px", borderBottom: "2.5px solid var(--ink)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontFamily: "var(--fb)", fontSize: 11, fontWeight: 800, color: "var(--faded)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              your profile
            </p>
            <h1 style={{ fontFamily: "var(--fd)", fontSize: 42, lineHeight: 1, color: "var(--ink)" }}>
              {user.user_metadata?.full_name?.split(" ")[0]?.toUpperCase() || "CURATOR"}
            </h1>
            <p style={{ fontFamily: "var(--fb)", fontSize: 12, color: "var(--faded)", fontWeight: 700, marginTop: 5 }}>
              {user.email}
            </p>
          </div>

          {user.user_metadata?.avatar_url
            ? <img src={user.user_metadata.avatar_url} alt=""
                style={{ width: 56, height: 56, borderRadius: "50%", border: "2.5px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)", flexShrink: 0 }} />
            : <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2.5px solid var(--ink)", background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fd)", fontSize: 22, color: "#fff", boxShadow: "3px 3px 0 var(--ink)", flexShrink: 0 }}>
                {user.user_metadata?.full_name?.[0] || "?"}
              </div>
          }
        </div>

        {/* Today's status */}
        <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 8, background: submittedToday ? "var(--red)" : "var(--cream2)", border: "2px solid var(--ink)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{submittedToday ? "✅" : "🎵"}</span>
          <span style={{ fontFamily: "var(--fb)", fontWeight: 800, fontSize: 13, color: submittedToday ? "#fff" : "var(--faded)" }}>
            {submittedToday ? "You submitted today — you're in the mix!" : "You haven't submitted today yet"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "2.5px solid var(--ink)" }}>
        {[
          { n: String(submissions.length).padStart(2, "0"), label: "total\nsubmissions" },
          { n: String(streak).padStart(2, "0"),             label: "day\nstreak 🔥" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "20px 16px",
            borderRight: i === 0 ? "1.5px solid var(--border)" : "none",
          }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 54, lineHeight: 1, color: i === 1 && streak > 0 ? "var(--red)" : "var(--ink)" }}>
              {s.n}
            </div>
            <div style={{ fontFamily: "var(--fb)", fontWeight: 700, fontSize: 11, color: "var(--faded)", marginTop: 5, whiteSpace: "pre-line" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── COMING SOON SECTION ─────────────────────────────────────────────── */}
      <div style={{ padding: "20px 18px", borderBottom: "2.5px solid var(--ink)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <p style={{
            fontFamily: "var(--fb)", fontSize: 11, fontWeight: 800,
            color: "var(--faded)", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            unlocking soon
          </p>
          <div style={{ flex: 1, height: 1.5, background: "var(--border)", borderRadius: 2 }} />
          <span style={{ fontSize: 13 }}>🔒</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* 1 — Taste Score Machine */}
          <ComingSoonCard
            icon="🎯"
            title="TASTE SCORE MACHINE"
            desc="Your picks get rated by the crowd. Build a reputation as a tastemaker — see how your curation stacks up against everyone else."
            accent="var(--red)"
          />


          {/* 3 — Listening Personality / Music DNA */}
          <ComingSoonCard
            icon="🧬"
            title="MUSIC DNA"
            desc="Uncover your listening personality — are you a Deep Cutter, a Hype Machine, or a Genre Chameleon? Your submission history, decoded."
            accent="#0891B2"
          />

          {/* 4 — Social / Friend Matching */}
          <ComingSoonCard
            icon="🤝"
            title="FRIEND MATCHING"
            desc="Find your sonic twins. See who shares your taste, follow their picks, and discover people who hear music the same way you do."
            accent="#059669"
          />

        </div>
      </div>
      {/* ─────────────────────────────────────────────────────────────────────── */}

      {/* Recent picks */}
      <div style={{ padding: "16px 18px", flex: 1 }}>
        <p style={{ fontFamily: "var(--fb)", fontSize: 11, fontWeight: 800, color: "var(--faded)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Your picks
        </p>

        {loading && (
          <div style={{ textAlign: "center", padding: 32, color: "var(--faded)", fontFamily: "var(--fb)", fontWeight: 700, fontSize: 13 }}>
            loading...
          </div>
        )}

        {!loading && submissions.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 26, color: "var(--border)", marginBottom: 8 }}>NO PICKS YET</div>
            <p style={{ fontFamily: "var(--fb)", fontWeight: 700, color: "var(--faded)", fontSize: 13 }}>go submit your first pick →</p>
          </div>
        )}

        {submissions.map((s, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, alignItems: "center",
            background: "var(--white)", border: "2px solid var(--ink)",
            borderRadius: 10, padding: 10, marginBottom: 8,
            boxShadow: "3px 3px 0 var(--ink)",
          }}>
            <img
              src={`https://img.youtube.com/vi/${s.video_id}/mqdefault.jpg`}
              alt={s.title}
              style={{ width: 64, height: 46, objectFit: "cover", borderRadius: 6, border: "2px solid var(--ink)", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "var(--fb)", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--ink)" }}>
                {s.title}
              </p>
              <p style={{ fontFamily: "var(--fb)", fontWeight: 700, fontSize: 11, color: "var(--faded)", marginTop: 3 }}>
                {s.theme}
              </p>
            </div>
            <p style={{ fontFamily: "var(--fb)", fontWeight: 700, fontSize: 10, color: "var(--border)", flexShrink: 0 }}>
              {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <div style={{ padding: "0 18px 24px" }}>
        <button
          onClick={async () => { await signOut(); window.location.href = "/"; }}
          style={{
            width: "100%", padding: "13px",
            border: "2px solid var(--border)", borderRadius: 10,
            background: "transparent", color: "var(--faded)",
            fontFamily: "var(--fd)", fontSize: 16, letterSpacing: "0.06em",
            cursor: "pointer",
          }}
        >
          SIGN OUT
        </button>
      </div>
    </div>
  );
}
