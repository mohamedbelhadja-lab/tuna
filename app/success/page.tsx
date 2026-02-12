"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/playlist");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>🎉 Well done!</h1>
      <p>Your song has been submitted.</p>
    </main>
  );
}