import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EVENT, NAV_LINKS, SOCIAL_LINKS } from "@/lib/event";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { type ReactNode, useState } from "react";

const ATTRIBUTION_HREF = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
  typeof window === "undefined" ? "" : window.location.hostname,
)}`;

/** Primary CTA styling shared by the header and mobile sheet. */
const CTA_CLASS =
  "tap-target h-12 rounded-sm border border-accent/40 bg-gradient-cta px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:-translate-y-px hover:shadow-edge-cyan";

function Wordmark() {
  return (
    <Link
      to="/"
      data-ocid="nav.link"
      aria-label={`${EVENT.artist} home`}
      className="group flex items-center gap-2.5"
    >
      <span className="relative grid size-9 place-items-center rounded-sm border border-accent/40 bg-surface-2">
        <span className="size-2 rounded-full bg-accent animate-glow-pulse" />
      </span>
      <span className="font-display text-xl font-bold tracking-[0.28em] text-foreground transition-smooth group-hover:text-accent">
        ZAVY
      </span>
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="film-grain relative flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-surface-0/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
          <Wordmark />

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid="nav.link"
                activeOptions={{ exact: link.to === "/" }}
                className="rounded-sm px-3.5 py-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-smooth hover:text-foreground data-[status=active]:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              data-ocid="nav.primary_button"
              className={CTA_CLASS}
            >
              <Link to="/tickets">Buy Ticket</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              data-ocid="nav.toggle"
              onClick={() => setMenuOpen((open) => !open)}
              className="tap-target size-12 rounded-sm md:hidden"
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {menuOpen ? (
          <div
            data-ocid="nav.panel"
            className="border-t border-white/10 bg-surface-0/95 px-5 pb-5 pt-3 backdrop-blur-xl md:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  data-ocid="nav.link"
                  activeOptions={{ exact: link.to === "/" }}
                  onClick={closeMenu}
                  className="tap-target flex items-center rounded-sm px-3 font-mono text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground transition-smooth hover:bg-surface-2 hover:text-foreground data-[status=active]:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Button
              asChild
              data-ocid="nav.primary_button"
              className={`${CTA_CLASS} mt-3 w-full`}
            >
              <Link to="/tickets" onClick={closeMenu}>
                Buy Ticket
              </Link>
            </Button>
          </div>
        ) : null}
      </header>

      <main className="relative z-10 flex-1 pb-28 md:pb-0">{children}</main>

      <footer className="relative z-10 border-t border-white/10 bg-surface-0">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <p className="font-display text-2xl font-bold tracking-[0.24em] text-foreground">
                ZAVY
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {EVENT.name} — {EVENT.dateLabel}, {EVENT.timeLabel} at{" "}
                {EVENT.venue}, {EVENT.city}.
              </p>
            </div>

            <div>
              <p className="label-eyebrow">Navigate</p>
              <ul className="mt-4 space-y-2.5">
                {NAV_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      data-ocid="footer.link"
                      className="text-sm text-foreground/80 transition-smooth hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="label-eyebrow">Follow</p>
              <ul className="mt-4 space-y-2.5">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      data-ocid="footer.link"
                      className="text-sm text-foreground/80 transition-smooth hover:text-accent"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
                Organized by {EVENT.organizer}
              </p>
            </div>
          </div>

          <Separator className="my-8 bg-white/10" />

          <div className="flex flex-col gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {EVENT.artist}. All rights reserved.
            </p>
            <a
              href={ATTRIBUTION_HREF}
              target="_blank"
              rel="noreferrer"
              className="transition-smooth hover:text-accent"
            >
              © {new Date().getFullYear()}. Built with love using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
