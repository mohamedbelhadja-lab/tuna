"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  useEffect(() => { const t = setTimeout(() => router.push("/playlist"), 3000); return () => clearTimeout(t); }, [router]);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 60, marginBottom: 16, animation: "popIn .5s ease both" }}>🎵</div>
      <h1 style={{ fontFamily: "var(--fd)", fontSize: 72, lineHeight: .95, animation: "fadeUp .4s .1s ease both", opacity: 0, animationFillMode: "forwards" }}>
        NICE<br /><span style={{ color: "var(--red)" }}>PICK!</span>
      </h1>
      <p style={{ marginTop: 18, fontFamily: "var(--fm)", fontSize: 14, color: "var(--faded)", animation: "fadeUp .4s .3s ease both", opacity: 0, animationFillMode: "forwards" }}>
        heading to the playlist...
      </p>
    </div>
  );
}
