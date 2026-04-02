"use client";

import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function HomePage() {
  return (
    <>
      <NavBar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem 1.5rem",
          background: "transparent",
          position: "relative",
        }}
      >
        {/* Decorative top line */}
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            marginBottom: "2.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #C5A55A)" }} />
          <span
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "0.58rem",
              letterSpacing: "0.35em",
              color: "rgba(197,165,90,0.7)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
Folk Transgénico
          </span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #C5A55A, transparent)" }} />
        </div>

        {/* Main title */}
        <h1
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(80px, 15vw, 200px)",
            fontWeight: 700,
            color: "#E23030",
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            lineHeight: 0.9,
            margin: 0,
          }}
        >
          ALTILLO
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "clamp(0.9rem, 2.5vw, 1.4rem)",
            fontWeight: 400,
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            marginTop: "1.2rem",
            marginBottom: "0.6rem",
          }}
        >
Folk Transgénico
        </p>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(0.8rem, 1.5vw, 1rem)",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.04em",
            marginBottom: 0,
          }}
        >
          Originalidad y Espectáculo
        </p>

        {/* Decorative bottom line */}
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            marginTop: "2.5rem",
            marginBottom: "3rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #C5A55A)" }} />
          <span
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "0.58rem",
              letterSpacing: "0.35em",
              color: "rgba(197,165,90,0.7)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            2026
          </span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #C5A55A, transparent)" }} />
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/contratar"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 600,
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              background: "#E23030",
              color: "#fff",
              padding: "0.9rem 2.4rem",
              borderRadius: "25px",
              textDecoration: "none",
              border: "2px solid #E23030",
              transition: "all 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(226,48,48,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            Contratación 2026
          </Link>

          <Link
            href="/admin"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 600,
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              background: "transparent",
              color: "#E23030",
              padding: "0.9rem 2.4rem",
              borderRadius: "25px",
              textDecoration: "none",
              border: "2px solid #E23030",
              transition: "all 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(226,48,48,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            Tour 2026
          </Link>
        </div>

        {/* Scroll hint */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem",
            opacity: 0.3,
          }}
        >
          <div
            style={{
              width: 1,
              height: 40,
              background: "linear-gradient(180deg, transparent, #C5A55A)",
            }}
          />
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer
        style={{
          background: "rgba(10,4,4,0.6)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "2.5rem 1.5rem",
          textAlign: "center",
        }}
      >
        {/* Social icons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "1.5rem" }}>
          <a
            href="https://www.instagram.com/altillomusic/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#E23030")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <a
            href="https://tidal.com/artist/42996330"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tidal"
            style={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#E23030")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2.4 9.6 4.8 12 7.2l2.4-2.4zm-4.8 4.8L4.8 9.6l2.4 2.4 2.4-2.4zm9.6 0-2.4 2.4 2.4 2.4 2.4-2.4zM7.2 12l-2.4 2.4 2.4 2.4 2.4-2.4zm9.6 0-2.4 2.4 2.4 2.4 2.4-2.4zM12 12l-2.4 2.4L12 16.8l2.4-2.4zm0 4.8-2.4 2.4L12 21.6l2.4-2.4z"/>
            </svg>
          </a>
          <a
            href="https://www.youtube.com/channel/UCUPfdS8AhfqtHSKqLbsm5ug"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            style={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#E23030")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
              <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
            </svg>
          </a>
        </div>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.08em",
            margin: 0,
          }}
        >
          © 2026 Altillo Música
        </p>
      </footer>
    </>
  );
}
