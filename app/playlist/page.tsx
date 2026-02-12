"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Video = {
  id: string;
  title: string;
};

export default function PlaylistPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [likes, setLikes] = useState<number[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmissions() {
      const { data } = await supabase
        .from("submissions")
        .select("*")
        .eq("theme", localStorage.getItem("theme"))
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

  function toggleLike(index: number) {
    setLikes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  }

  function togglePlayer(videoId: string) {
    setActiveVideo((prev) => (prev === videoId ? null : videoId));
  }

  return (
    <main>
      <h1>Today's Playlist</h1>
      <p className="lead">Tap a song to play it</p>

      <div style={{ marginTop: 16 }}>
        {videos.length === 0 && (
          <p style={{ opacity: 0.6 }}>No submissions yet.</p>
        )}

        {videos.map((video, index) => (
          <div key={index} className="card">
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

              <div className="meta">
                <div className="title">{video.title}</div>
                <div className="sub">YouTube • anonymous</div>
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
                style={{ width: 56, padding: 8 }}
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
