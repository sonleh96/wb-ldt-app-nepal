"use client";

import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import gpbpLogo from "../../../images/gpbp_logo.webp";
import ldtLogo from "../../../images/ldt-logo.webp";
import pimpamLogo from "../../../images/pimpam_logo.png";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/release-notes", label: "Release Notes" },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[95vw] items-center justify-between px-8 py-5 sm:px-10 lg:px-14">
        <div className="flex items-center gap-3 lg:gap-4">
          <a
            href="https://pim-pam.net/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center"
          >
            <Image
              src={pimpamLogo}
              alt="PIM PAM"
              priority
              className="h-10 w-auto lg:h-11"
            />
          </a>
          <span className="hidden h-10 w-px bg-[var(--border-soft)] md:block" aria-hidden="true" />
          <a
            href="https://pim-pam.net/web-applications/#gpbp"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-3 text-sm font-medium leading-5 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] md:flex"
          >
            <Image
              src={gpbpLogo}
              alt="Geospatial Planning & Budgeting Tools"
              priority
              className="h-9 w-auto"
            />
            <span className="flex max-w-[12.5rem] flex-col leading-tight">
              <span>Geospatial Planning</span>
              <span>&amp; Budgeting Tools</span>
            </span>
          </a>
          <span className="hidden h-10 w-px bg-[var(--border-soft)] md:block" aria-hidden="true" />
          <Link href="/" className="flex items-center gap-4">
            <Image
              src={ldtLogo}
              alt="Local Development Tracker"
              priority
              className="h-11 w-auto"
            />
            <span className="text-lg font-semibold leading-none text-[var(--foreground)]">
              Local Development Tracker
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-3 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-5 py-2.5 text-base text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
