"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getThemeOfTheDay } from "@/lib/themes";

// Helper to extract YouTube video ID
function getVideoId(url: string) {
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function HomePage() {
  const theme = getThemeOfTheDay(); // today’s theme
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loading, setLoading] = useState(false);

  // Submit logic — sends to Supabase
  async function handleSubmit() {
    const videoId = getVideoId(youtubeLink);
    if (!videoId) return alert("Invalid YouTube link");

    setLoading(true);

    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      const data = await res.json();

      await supabase.from("submissions").insert({
        video_id: videoId,
        title: data.title,
        theme, // save today’s theme
      });

      window.location.href = "/success";
    } catch (err) {
      alert("Submission failed");
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <p className="sub">Today’s prompt</p>
      <h1>{theme}</h1>

      <input
        className="input"
        placeholder="Paste YouTube link"
        value={youtubeLink}
        onChange={(e) => setYoutubeLink(e.target.value)}
        style={{ marginTop: 12 }}
      />

      <button
        className="btn"
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 14 }}
      >
        {loading ? "Submitting…" : "Submit"}
      </button>
    </main>
  );
}
