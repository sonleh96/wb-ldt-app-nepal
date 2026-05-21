import Image from "next/image";
import Link from "next/link";

import gpbpLogo from "../../../images/gpbp_logo.webp";
import ldtLogo from "../../../images/ldt-logo.webp";

const navItems = [
  { href: "/analytics", label: "Launch App" },
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/resources", label: "Resources" },
  { href: "/release-notes", label: "Release Notes" },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-[rgba(247,243,235,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[95vw] items-center justify-between px-8 py-5 sm:px-10 lg:px-14">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src={ldtLogo}
              alt="Local Development Tracker"
              priority
              className="h-11 w-auto"
            />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-semibold text-[var(--foreground)]">GPB - LDT</span>
              <span className="mt-1 text-sm text-[var(--muted-foreground)]">Nepal</span>
            </span>
          </Link>
          <span className="hidden h-10 w-px bg-[var(--border-soft)] sm:block" aria-hidden="true" />
          <a
            href="https://pim-pam.net/web-applications/#gpbp"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-3 text-sm font-medium leading-5 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] sm:flex"
          >
            <Image
              src={gpbpLogo}
              alt="Geospatial Planning and Budgeting Platform"
              priority
              className="h-9 w-auto"
            />
            <span className="max-w-[15rem]">Geospatial Planning &amp; Budgeting Platform</span>
          </a>
        </div>

        <nav className="hidden items-center gap-3 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-5 py-2.5 text-base transition-colors ${
                item.href === "/analytics"
                  ? "bg-[var(--accent)] text-white shadow-[0_12px_28px_rgba(17,138,178,0.24)] hover:bg-[rgb(14,118,152)]"
                  : "text-[var(--muted-foreground)] hover:bg-white/70 hover:text-[var(--foreground)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
