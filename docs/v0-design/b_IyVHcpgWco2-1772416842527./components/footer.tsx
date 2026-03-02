import { Facebook, Instagram } from "lucide-react"

const quickLinks = [
  { label: "Trails", href: "#trails" },
  { label: "About", href: "#about" },
  { label: "Membership", href: "#get-involved" },
  { label: "Donate", href: "#get-involved" },
  { label: "Contact", href: "#contact" },
]

export default function Footer() {
  return (
    <footer id="contact" className="bg-forest text-forest-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {/* Column 1: Org name + tagline */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-white">
              Friends of Seminary Hill Natural Area
            </h3>
            <p className="mt-3 font-sans text-sm leading-relaxed text-forest-foreground/70">
              Volunteer-led. Community-rooted. Protecting 55 acres of Pacific
              Northwest woodland in the heart of Centralia, Washington.
            </p>
          </div>

          {/* Column 2: Quick links */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-forest-foreground/50">
              Quick Links
            </h4>
            <ul className="mt-4 flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-sans text-sm text-forest-foreground/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-forest-foreground/50">
              Follow the Hill
            </h4>
            <div className="mt-4 flex items-center gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-foreground/10 text-forest-foreground/70 transition-colors hover:bg-forest-foreground/20 hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-foreground/10 text-forest-foreground/70 transition-colors hover:bg-forest-foreground/20 hover:text-white"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-forest-foreground/10">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
          <p className="text-center font-sans text-xs text-forest-foreground/50">
            {"Seminary Hill Natural Area \u00A9 2025"}
          </p>
        </div>
      </div>
    </footer>
  )
}
