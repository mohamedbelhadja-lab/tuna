"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getThemeOfTheDay } from "@/lib/themes";
import Ticker from "@/components/Ticker";

type Video = {
  id: number;         // submission row id (bigint)
  video_id: string;
  title: string;
  submitter?: string;
  likes: number;
};

export default function PlaylistPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [liked, setLiked] = useState<Record<number, boolean>>({});   // keyed by submission id
  const [active, setActive] = useState<string | null>(null);          // keyed by video_id
  const [userId, setUserId] = useState<string | null>(null);
  const [liking, setLiking] = useState<Record<number, boolean>>({});  // optimistic lock

  // ── Load current user ──────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  // ── Load submissions + like counts ────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const theme = getThemeOfTheDay();

      // Fetch submissions with live like count via a join
      const { data } = await supabase
        .from("submissions")
        .select("id, video_id, title, submitter, likes")
        .eq("theme", theme)
        .order("created_at", { ascending: false });

      setVideos(
        (data ?? []).map((d) => ({
          id: d.id,
          video_id: d.video_id,
          title: d.title,
          submitter: d.submitter ?? "anonymous",
          likes: d.likes ?? 0,
        }))
      );
    }
    load();
  }, []);

  // ── Load which submissions THIS user has liked ────────────────────────────
  useEffect(() => {
    if (!userId) return;
    async function loadMyLikes() {
      const { data } = await supabase
        .from("likes")
        .select("submission_id")
        .eq("user_id", userId);

      const map: Record<number, boolean> = {};
      (data ?? []).forEach((row) => { map[row.submission_id] = true; });
      setLiked(map);
    }
    loadMyLikes();
  }, [userId]);

  // ── Toggle like ───────────────────────────────────────────────────────────
  async function toggleLike(submissionId: number) {
    if (!userId) return;                  // must be signed in
    if (liking[submissionId]) return;     // debounce

    setLiking((p) => ({ ...p, [submissionId]: true }));

    const alreadyLiked = liked[submissionId];

    // Optimistic UI
    setLiked((p) => ({ ...p, [submissionId]: !alreadyLiked }));
    setVideos((prev) =>
      prev.map((v) =>
        v.id === submissionId
          ? { ...v, likes: v.likes + (alreadyLiked ? -1 : 1) }
          : v
      )
    );

    if (alreadyLiked) {
      // Unlike: delete row + decrement counter
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("submission_id", submissionId);

      await supabase.rpc("decrement_likes", { submission_id: submissionId });
    } else {
      // Like: insert row + increment counter
      const { error } = await supabase
        .from("likes")
        .insert({ user_id: userId, submission_id: submissionId });

      if (!error) {
        await supabase.rpc("increment_likes", { submission_id: submissionId });
      } else {
        // Roll back optimistic update on error (e.g. duplicate)
        setLiked((p) => ({ ...p, [submissionId]: alreadyLiked }));
        setVideos((prev) =>
          prev.map((v) =>
            v.id === submissionId
              ? { ...v, likes: v.likes - 1 }
              : v
          )
        );
      }
    }

    setLiking((p) => ({ ...p, [submissionId]: false }));
  }

  // ── Render ────────────────────────────────────────────────────────────────
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
          const isA = active === video.video_id;
          const isL = liked[video.id];

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
              <div style={{ height: 4, background: isA ? "var(--red)" : "var(--cream2)", transition: "background .2s" }} />

              <div
                style={{ display: "flex", gap: 10, padding: "10px 10px 10px 12px", cursor: "pointer", alignItems: "center" }}
                onClick={() => setActive(isA ? null : video.video_id)}
              >
                <div style={{ fontFamily: "var(--fd)", fontSize: 26, color: isA ? "var(--red)" : "var(--border)", width: 32, flexShrink: 0, lineHeight: 1, textAlign: "right", transition: "color .2s" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img
                    src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                    alt={video.title}
                    style={{ width: 72, height: 52, objectFit: "cover", display: "block", borderRadius: 6, border: "2px solid var(--ink)" }}
                  />
                  <div style={{ position: "absolute", inset: 0, borderRadius: 6, background: isA ? "rgba(232,52,26,.55)" : "rgba(0,0,0,.18)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s" }}>
                    <span style={{ color: "#fff", fontSize: 20 }}>{isA ? "⏸" : "▶"}</span>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--fb)", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{video.title}</div>
                  <div style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--faded)", marginTop: 3, fontWeight: 700 }}>by @{video.submitter}</div>
                </div>

                {/* ── Like button ── */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(video.id); }}
                  disabled={!userId}
                  style={{
                    background: isL ? "var(--red)" : "var(--white)",
                    border: "2px solid " + (isL ? "var(--red)" : "var(--border)"),
                    borderRadius: 7,
                    width: 40,
                    height: 40,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: userId ? "pointer" : "default",
                    gap: 1,
                    flexShrink: 0,
                    transition: "all .15s",
                    opacity: userId ? 1 : 0.5,
                  }}
                >
                  <span style={{ fontSize: 14, color: isL ? "#fff" : "var(--faded)" }}>{isL ? "♥" : "♡"}</span>
                  <span style={{ fontSize: 9, fontFamily: "var(--ff)", color: isL ? "#fff" : "var(--faded)" }}>{video.likes}</span>
                </button>
              </div>

              {isA && (
                <div style={{ padding: "0 12px 12px" }}>
                  <iframe
                    width="100%"
                    height="195"
                    src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1`}
                    title={video.title}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    style={{ display: "block", borderRadius: 8, border: "2px solid var(--ink)" }}
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
