"use client";

import Link from "next/link";
import "./globals.css";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className="body-with-nav">
        <div className="app-content">{children}</div>

        {/* Bottom navigation */}
        <nav className="bottom-nav" aria-label="Primary">
          <Link href="/" className={pathname === "/" ? "active" : ""}>
            🏠 <span style={{ display: "block", fontSize: 12 }}>Home</span>
          </Link>

          <Link
            href="/playlist"
            className={pathname?.startsWith("/playlist") ? "active" : ""}
          >
            🎶 <span style={{ display: "block", fontSize: 12 }}>Playlist</span>
          </Link>

          <Link href="/profile" className={pathname === "/profile" ? "active" : ""}>
            👤 <span style={{ display: "block", fontSize: 12 }}>Profile</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}