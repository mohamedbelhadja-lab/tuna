"use client";

import { useEffect, useState } from "react";

/* ------------------ DAILY THEMES ------------------ */

const THEMES = [
  "Favourite song in a language you don’t speak",
  "Best song to cook pasta",
  "A song that feels like sunset",
  "A song you discovered by accident",
  "A song that makes you miss someone",
  "A song you play when you can’t sleep",
  "A song that feels like a long train ride",
  "A song you wish you heard earlier in life",
  "A song that sounds better at night",
  "A song that feels like summer at 2am",
  "A song that makes you want to dance alone",
  "A song that feels like home",
  "A song you associate with a specific place",
  "A song that feels like rain",
  "A song you would play on a road trip",
  "A song that feels like a secret",
  "A song you love but never share",
  "A song that makes you feel powerful",
  "A song that feels nostalgic even though it’s new",
  "A song that feels like falling in love",
  "A song that feels like letting go",
  "A song that makes ordinary moments special",
  "A song you’d play for a stranger",
  "A song that feels cinematic",
  "A song that matches today’s mood",
];

/* ------------------ HELPERS ------------------ */

function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getThemeForToday() {
  const dayNumber = Math.floor(
    new Date(getTodayKey()).getTime() / (1000 * 60 * 60 * 24)
  );
  return THEMES[dayNumber % THEMES.length];
}

function getVideoId(url: string) {
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/* ------------------ PAGE ------------------ */

export default function HomePage() {
  const [theme, setTheme] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loading, setLoading] = useState(false);

  /* Daily reset logic */
  useEffect(() => {
    const today = getTodayKey();
    const storedDate = localStorage.getItem("playlistDate");

    if (storedDate !== today) {
      localStorage.setItem("playlistDate", today);
      localStorage.setItem("playlist", JSON.stringify([]));
      localStorage.setItem("theme", getThemeForToday());
    }

    setTheme(localStorage.getItem("theme") || getThemeForToday());
  }, []);

  /* Submit logic */
  async function handleSubmit() {
    const videoId = getVideoId(youtubeLink);
    if (!videoId) return alert("Please paste a valid YouTube link");

    setLoading(true);

    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      const data = await res.json();

      const newEntry = {
        id: videoId,
        title: data.title,
      };

      const existing = JSON.parse(localStorage.getItem("playlist") || "[]");

      localStorage.setItem(
        "playlist",
        JSON.stringify([...existing, newEntry])
      );

      window.location.href = "/success";
    } catch (err) {
      alert("Could not fetch video information");
      setLoading(false);
    }
  }

  return (
    <main>
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