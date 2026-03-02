"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Trails", href: "#trails" },
  { label: "About", href: "#about" },
  { label: "Get Involved", href: "#get-involved" },
  { label: "Contact", href: "#contact" },
]

function LanguagePill() {
  const [lang, setLang] = useState<"EN" | "ES">("EN")

  return (
    <div
      className="flex items-center rounded-full border border-forest-foreground/30 text-sm"
      role="group"
      aria-label="Language selector"
    >
      <button
        onClick={() => setLang("EN")}
        className={`rounded-l-full px-3 py-1 font-sans text-sm transition-colors ${
          lang === "EN"
            ? "bg-forest-foreground/20 text-white font-medium"
            : "text-forest-foreground/70 hover:text-white"
        }`}
        aria-pressed={lang === "EN"}
      >
        EN
      </button>
      <button
        onClick={() => setLang("ES")}
        className={`rounded-r-full px-3 py-1 font-sans text-sm transition-colors ${
          lang === "ES"
            ? "bg-forest-foreground/20 text-white font-medium"
            : "text-forest-foreground/70 hover:text-white"
        }`}
        aria-pressed={lang === "ES"}
      >
        ES
      </button>
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className="sticky top-0 z-50 bg-forest"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Site name */}
        <a href="#" className="shrink-0">
          <span className="font-serif text-lg font-semibold tracking-tight text-white lg:text-xl">
            Seminary Hill Natural Area
          </span>
        </a>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="font-sans text-sm text-forest-foreground/80 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop language pill */}
        <div className="hidden md:block">
          <LanguagePill />
        </div>

        {/* Mobile: language pill + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguagePill />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-forest-foreground/10 bg-forest md:hidden">
          <ul className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 font-sans text-base text-forest-foreground/80 transition-colors hover:bg-forest-foreground/10 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
