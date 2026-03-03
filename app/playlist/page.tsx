"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getThemeOfTheDay } from "@/lib/themes";
import Ticker from "@/components/Ticker";
import type { User } from "@supabase/supabase-js";

type Video = {
  id: string;
  title: string;
  submitter?: string;
  likes: number;
  submission_id: number; // bigint from Supabase comes as number in JS
};

export default function PlaylistPage() {
  const [videos, setVideos]   = useState<Video[]>([]);
  const [liked, setLiked]     = useState<Record<string, boolean>>({});
  const [active, setActive]   = useState<string | null>(null);
  const [user, setUser]       = useState<User | null>(null);
  const [liking, setLiking]   = useState<Record<string, boolean>>({});

  // ── Auth ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Load submissions + user's likes ─────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const theme = getThemeOfTheDay();

      // 1. Fetch submissions for today's theme
      const { data: subs } = await supabase
        .from("submissions")
        .select("id, video_id, title, submitter, likes")
        .eq("theme", theme)
        .order("likes", { ascending: false });

      if (!subs) return;

      setVideos(
        subs.map(d => ({
          id: d.video_id,
          submission_id: d.id,
          title: d.title,
          submitter: d.submitter ?? "anonymous",
          likes: d.likes ?? 0,
        }))
      );

      // 2. If logged in, fetch which ones the user already liked
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userLikes } = await supabase
        .from("submission_likes")
        .select("submission_id")
        .eq("user_id", user.id)
        .in("submission_id", subs.map(s => s.id));

      if (userLikes) {
        const likedMap: Record<string, boolean> = {};
        userLikes.forEach(l => { likedMap[l.submission_id] = true; });
        setLiked(likedMap);
      }
    }

    load();
  }, []);

  // ── Like / unlike ───────────────────────────────────────────────────────────
  async function toggleLike(video: Video) {
    if (!user) return; // silently ignore — button is hidden for logged-out users
    if (liking[video.submission_id]) return; // debounce

    setLiking(prev => ({ ...prev, [video.submission_id]: true }));

    const alreadyLiked = liked[video.submission_id];

    // Optimistic update
    setLiked(prev => ({ ...prev, [video.submission_id]: !alreadyLiked }));
    setVideos(prev =>
      prev.map(v =>
        v.submission_id === video.submission_id
          ? { ...v, likes: v.likes + (alreadyLiked ? -1 : 1) }
          : v
      )
    );

    if (alreadyLiked) {
      // Remove like
      await supabase
        .from("submission_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("submission_id", video.submission_id);

      await supabase.rpc("decrement_likes", { submission_id: video.submission_id });
    } else {
      // Add like
      await supabase
        .from("submission_likes")
        .insert({ user_id: user.id, submission_id: video.submission_id });

      await supabase.rpc("increment_likes", { submission_id: video.submission_id });
    }

    setLiking(prev => ({ ...prev, [video.submission_id]: false }));
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <div
        className="page-header fade-up"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <div>
          <div style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--faded)", marginBottom: 6 }}>
            curated by humans
          </div>
          <h1 style={{ fontFamily: "var(--fd)", fontSize: 46, lineHeight: 1 }}>
            TODAY'S<br /><span style={{ color: "var(--red)" }}>MIX</span>
          </h1>
        </div>
        <span className="stamp" style={{ transform: "rotate(-4deg)", marginTop: 4 }}>
          {videos.length} TRACKS
        </span>
      </div>

      <Ticker items={["TAP A TRACK TO PLAY", "ZERO ALGORITHMS", "PURE HUMAN TASTE"]} />

      <div style={{ padding: "12px 16px" }}>
        {videos.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 32, color: "var(--border)", marginBottom: 12 }}>
              NO PICKS YET
            </div>
            <p style={{ fontFamily: "var(--fb)", fontWeight: 700, color: "var(--faded)", fontSize: 13 }}>
              be the first to drop a pick →
            </p>
          </div>
        )}

        {videos.map((video, i) => {
          const isA = active === video.id;
          const isL = !!liked[video.submission_id];

          return (
            <div
              key={video.id}
              className="card"
              style={{
                marginBottom: 10,
                overflow: "hidden",
                animation: `fadeUp .4s ${i * 0.05}s ease both`,
                opacity: 0,
                animationFillMode: "forwards",
              }}
            >
              {/* Top accent bar */}
              <div
                style={{
                  height: 4,
                  background: isA ? "var(--red)" : "var(--cream2)",
                  transition: "background .2s",
                }}
              />

              {/* Track row */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "10px 10px 10px 12px",
                  alignItems: "center",
                }}
              >
                {/* Track number / play indicator — clickable to expand */}
                <div
                  onClick={() => setActive(isA ? null : video.id)}
                  style={{
                    fontFamily: "var(--fd)",
                    fontSize: 26,
                    color: isA ? "var(--red)" : "var(--border)",
                    minWidth: 32,
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "color .2s",
                  }}
                >
                  {isA ? "▶" : String(i + 1).padStart(2, "0")}
                </div>

                {/* Thumbnail */}
                <img
                  src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                  alt={video.title}
                  onClick={() => setActive(isA ? null : video.id)}
                  style={{
                    width: 56,
                    height: 40,
                    objectFit: "cover",
                    borderRadius: 6,
                    border: "2px solid var(--ink)",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                />

                {/* Title + submitter */}
                <div
                  onClick={() => setActive(isA ? null : video.id)}
                  style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                >
                  <p
                    style={{
                      fontFamily: "var(--fb)",
                      fontWeight: 800,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "var(--ink)",
                      marginBottom: 2,
                    }}
                  >
                    {video.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--fb)",
                      fontWeight: 700,
                      fontSize: 11,
                      color: "var(--faded)",
                    }}
                  >
                    by {video.submitter}
                  </p>
                </div>

                {/* ── Like button ───────────────────────────────────────────── */}
                {user && (
                  <button
                    onClick={() => toggleLike(video)}
                    disabled={!!liking[video.submission_id]}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      background: isL ? "var(--red)" : "var(--cream2)",
                      border: `2px solid ${isL ? "var(--red)" : "var(--border)"}`,
                      borderRadius: 8,
                      padding: "6px 10px",
                      cursor: liking[video.submission_id] ? "default" : "pointer",
                      minWidth: 44,
                      flexShrink: 0,
                      transition: "all .15s",
                      boxShadow: isL ? "2px 2px 0 var(--ink)" : "none",
                    }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1 }}>
                      {isL ? "♥" : "♡"}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--ff)",
                        fontSize: 10,
                        fontWeight: 700,
                        color: isL ? "#fff" : "var(--faded)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {video.likes}
                    </span>
                  </button>
                )}

                {/* Show like count (no button) for logged-out users */}
                {!user && video.likes > 0 && (
                  <span
                    style={{
                      fontFamily: "var(--ff)",
                      fontSize: 10,
                      color: "var(--faded)",
                      flexShrink: 0,
                    }}
                  >
                    ♥ {video.likes}
                  </span>
                )}
              </div>

              {/* Expanded YouTube embed */}
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
    </div>
  );
}
