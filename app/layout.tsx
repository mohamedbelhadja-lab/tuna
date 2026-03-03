"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <body>
        <div className="app-content">
          <div style={{ paddingBottom: 80 }}>{children}</div>
          <nav className="bottom-nav" aria-label="Primary">
            <Link href="/" className={pathname === "/" ? "active" : ""}>
              <span className="nav-icon">♪</span>
              <span>TODAY</span>
            </Link>
            <Link href="/playlist" className={pathname?.startsWith("/playlist") ? "active" : ""}>
              <span className="nav-icon">▶</span>
              <span>PLAYLIST</span>
            </Link>
            <Link href="/archive" className={pathname?.startsWith("/archive") ? "active" : ""}>
              <span className="nav-icon">◫</span>
              <span>ARCHIVE</span>
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
