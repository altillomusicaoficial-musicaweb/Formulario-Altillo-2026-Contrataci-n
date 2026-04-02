"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const adminLinks = [
  { label: "Solicitudes", href: "/admin" },
  { label: "Calendario", href: "/admin/calendario" },
  { label: "Contabilidad", href: "/admin/finanzas" },
  { label: "Tarifas", href: "/admin/tarifas" },
];

export default function NavBar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const navLinks = isAdmin
    ? adminLinks
    : [{ label: "Contratar", href: "/contratar" }];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16"
      style={{
        background: scrolled ? "rgba(10,5,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "1.5rem",
              letterSpacing: "0.08em",
              color: "#E23030",
              textTransform: "uppercase",
            }}
          >
            ALTILLO
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontWeight: 400,
                  fontSize: "0.78rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: isActive ? "#E23030" : "rgba(255,255,255,0.85)",
                  transition: "color 0.2s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.color = "#E23030";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.85)";
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
