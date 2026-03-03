"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          {/* LEFT SIDEBAR — only visible on desktop */}
          <nav className="side-nav" aria-label="Primary">
            <div className="side-nav-logo">◎ ALGO<br />RHYTHMS</div>
            <Link href="/" className={pathname === "/" ? "active" : ""}>
              <span className="nav-icon">♪</span>
              <span>TODAY</span>
            </Link>
            <Link href="/playlist" className={pathname?.startsWith("/playlist") ? "active" : ""}>
              <span className="nav-icon">▶</span>
              <span>PLAYLIST</span>
            </Link>
            <Link href="/profile" className={pathname === "/profile" ? "active" : ""}>
              <span className="nav-icon">◎</span>
              <span>PROFILE</span>
            </Link>
          </nav>

          {/* MAIN CONTENT */}
          <main className="app-main">
            <div className="app-content">
              <div style={{ paddingBottom: 80 }}>{children}</div>
            </div>
          </main>

          {/* BOTTOM NAV — only visible on mobile */}
          <nav className="bottom-nav" aria-label="Primary">
            <Link href="/" className={pathname === "/" ? "active" : ""}>
              <span className="nav-icon">♪</span>
              <span>TODAY</span>
            </Link>
            <Link href="/playlist" className={pathname?.startsWith("/playlist") ? "active" : ""}>
              <span className="nav-icon">▶</span>
              <span>PLAYLIST</span>
            </Link>
            <Link href="/profile" className={pathname === "/profile" ? "active" : ""}>
              <span className="nav-icon">◎</span>
              <span>PROFILE</span>
            </Link>
          </nav>
        </div>
      </body>
    </html>
  );
}
