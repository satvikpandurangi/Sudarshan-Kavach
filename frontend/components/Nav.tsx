"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useTranslation, Language } from "@/lib/i18n";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLanguage, t } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setIsAuth(Boolean(localStorage.getItem("sk-user")));
    } catch {
      setIsAuth(false);
    }
  }, []);

  const handleCheckNow = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const user = localStorage.getItem("sk-user");
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login?redirect=/dashboard");
      }
    } catch {
      router.push("/login?redirect=/dashboard");
    }
  };


  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "EN" },
    { code: "kn", label: "ಕನ್ನಡ", flag: "KN" },
    { code: "hi", label: "हिन्दी", flag: "HI" },
    { code: "te", label: "తెలుగు", flag: "TE" },
  ];

  const currentLangLabel = languages.find((l) => l.code === lang)?.label || "English";

  return (
    <>
      <header className="header-glass">
        <div className="shell">
          <nav className="nav" aria-label="Main Navigation">
            <Link href="/" className="brand" aria-label="Sudarshan Kavach Home">
              <div className="brand-logo-wrapper">
                <img
                  src="/sudarshan-shield-emblem.png"
                  alt="Sudarshan Kavach Logo"
                  style={{
                    height: "40px",
                    width: "40px",
                    objectFit: "contain",
                    flexShrink: 0,
                    filter: "drop-shadow(0 2px 8px rgba(234, 88, 12, 0.35))",
                    transition: "transform 0.3s ease",
                  }}
                />
              </div>
              <div className="brand-text">
                <span className="brand-title">{t.brand}</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="navlinks">
              <Link
                href="/dashboard"
                className={`navlink ${pathname === "/dashboard" || pathname === "/check" ? "active" : ""}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                {t.nav.dashboard}
              </Link>

              <Link
                href="/history"
                className={`navlink ${pathname.startsWith("/history") ? "active" : ""}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {t.nav.history}
              </Link>

              <Link
                href="/safety"
                className={`navlink ${pathname.startsWith("/safety") ? "active" : ""}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                {t.nav.safety}
              </Link>

              <Link
                href="/profile"
                className={`navlink ${pathname.startsWith("/profile") ? "active" : ""}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {t.nav.profile}
              </Link>
            </div>

            {/* Actions: Language Selector + Quick Scan CTA */}
            <div className="nav-actions">
              <div className="lang-selector" ref={langRef}>
                <button
                  className="lang-btn"
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  aria-expanded={langMenuOpen}
                  aria-label="Select Language"
                  id="lang-select-button"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  <span className="lang-name-desktop">{currentLangLabel}</span>
                  <span className="lang-code-mobile">{languages.find((l) => l.code === lang)?.flag || "EN"}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {langMenuOpen && (
                  <div className="lang-menu" role="menu">
                    {languages.map((item) => (
                      <button
                        key={item.code}
                        className={`lang-option ${lang === item.code ? "selected" : ""}`}
                        onClick={() => {
                          setLanguage(item.code);
                          setLangMenuOpen(false);
                        }}
                        role="menuitem"
                      >
                        <span>{item.label}</span>
                        <span style={{ fontSize: "0.72rem", opacity: 0.6 }}>{item.flag}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Quick 1930 Speed Dial */}
              <a
                href="tel:1930"
                className="mobile-emergency-pill"
                aria-label="Call National Cyber Helpline 1930"
                title="Call National Cyber Helpline 1930"
              >
                <span>☎</span>
                <span>1930</span>
              </a>

              {/* Desktop Check Now CTA Button (Hidden on Mobile) */}
              <Link
                href={isAuth ? "/dashboard" : "/login?redirect=/dashboard"}
                onClick={handleCheckNow}
                className="btn btn-primary nav-cta-desktop"
                style={{
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  minHeight: "44px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {t.hero.ctaCheck}
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (5 Core Native App Tabs) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
        <Link
          href="/"
          className={`mobile-nav-item ${pathname === "/" ? "active" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Home</span>
        </Link>

        <Link
          href={isAuth ? "/dashboard" : "/login?redirect=/dashboard"}
          onClick={handleCheckNow}
          className={`mobile-nav-item ${pathname === "/dashboard" || pathname === "/check" ? "active" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>{t.nav.dashboard}</span>
        </Link>

        <Link
          href="/safety"
          className={`mobile-nav-item ${pathname.startsWith("/safety") ? "active" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>{t.nav.safety}</span>
        </Link>

        <Link
          href="/history"
          className={`mobile-nav-item ${pathname.startsWith("/history") ? "active" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{t.nav.history}</span>
        </Link>

        <Link
          href="/profile"
          className={`mobile-nav-item ${pathname.startsWith("/profile") ? "active" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>{t.nav.profile}</span>
        </Link>
      </nav>
    </>
  );
}
