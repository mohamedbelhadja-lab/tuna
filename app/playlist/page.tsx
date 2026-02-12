"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getThemeOfTheDay } from "@/lib/themes";

type Video = {
  id: string;
  title: string;
};

export default function PlaylistPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [likes, setLikes] = useState<number[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Fetch submissions for today's theme
  useEffect(() => {
    async function fetchSubmissions() {
      const theme = getThemeOfTheDay();
      const { data } = await supabase
        .from("submissions")
        .select("*")
        .eq("theme", theme) // filter by today's theme
        .order("created_at", { ascending: false });

      setVideos(
        data?.map((item) => ({
          id: item.video_id,
          title: item.title,
        })) || []
      );
    }

    fetchSubmissions();
  }, []);

  // Toggle like for a video (local only for now)
  function toggleLike(index: number) {
    setLikes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  // Show/hide embedded YouTube player
  function togglePlayer(videoId: string) {
    setActiveVideo((prev) => (prev === videoId ? null : videoId));
  }

  return (
    <main style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <h1>Today's Playlist</h1>
      <p className="lead">Tap a song to play it</p>

      {videos.length === 0 && (
        <p style={{ opacity: 0.6, marginTop: 12 }}>No submissions yet.</p>
      )}

      <div style={{ marginTop: 16 }}>
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="card"
            style={{
              marginBottom: 20,
              padding: 12,
              border: "1px solid #eee",
              borderRadius: 12,
            }}
          >
            {/* Clickable area */}
            <div
              style={{ display: "flex", gap: 12, cursor: "pointer" }}
              onClick={() => togglePlayer(video.id)}
            >
              <img
                src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                alt={video.title}
                width={120}
                style={{ borderRadius: 8 }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    marginBottom: 4,
                  }}
                >
                  {video.title}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  YouTube • anonymous
                </div>
              </div>
            </div>

            {/* Embedded player */}
            {activeVideo === video.id && (
              <div style={{ marginTop: 12 }}>
                <iframe
                  width="100%"
                  height="215"
                  src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                  title={video.title}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  style={{ borderRadius: 12 }}
                />
              </div>
            )}

            {/* Like button */}
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => toggleLike(index)}
                className="btn secondary"
                style={{
                  width: 56,
                  padding: 8,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                {likes.includes(index) ? "❤️" : "🤍"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
