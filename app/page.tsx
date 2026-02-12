"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getThemeOfTheDay } from "@/lib/themes";

// Helper: extract YouTube video ID from a link
function getVideoId(url: string) {
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function HomePage() {
  const theme = getThemeOfTheDay(); // Today's theme
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle submission
  async function handleSubmit() {
    const videoId = getVideoId(youtubeLink);
    if (!videoId) return alert("Invalid YouTube link");

    setLoading(true);

    try {
      // Fetch title from YouTube oEmbed
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      const data = await res.json();

      // Insert submission into Supabase
      await supabase.from("submissions").insert({
        video_id: videoId,
        title: data.title,
        theme, // save today's theme
      });

      // Redirect to success page
      window.location.href = "/success";
    } catch (err) {
      alert("Submission failed");
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <p className="sub" style={{ fontSize: 16, marginBottom: 8 }}>
        Today’s prompt
      </p>
      <h1 style={{ marginBottom: 16 }}>{theme}</h1>

      <input
        className="input"
        placeholder="Paste YouTube link"
        value={youtubeLink}
        onChange={(e) => setYoutubeLink(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ccc",
          marginBottom: 12,
        }}
      />

      <button
        className="btn"
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: 12,
          borderRadius: 8,
          width: "100%",
          backgroundColor: "#0070f3",
          color: "#fff",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Submitting…" : "Submit"}
      </button>
    </main>
  );
}
