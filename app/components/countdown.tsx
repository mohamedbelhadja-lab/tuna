"use client";
import { useState, useEffect } from "react";

export default function Countdown() {
  const [time, setTime] = useState("");
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

  return (
    <span style={{ fontFamily: "var(--ff)", fontSize: 12, color: "var(--red)", letterSpacing: "0.06em" }}>
      <span style={{ animation: "blink 1.5s ease infinite", display: "inline-block", marginRight: 5 }}>●</span>
      {time} left
    </span>
  );
}
