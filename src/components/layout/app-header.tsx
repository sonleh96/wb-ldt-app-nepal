"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
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
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[95vw] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-2.5 lg:gap-4">
          <a
            href="https://pim-pam.net/"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center sm:flex"
          >
            <Image
              src={pimpamLogo}
              alt="PIM PAM"
              priority
              className="h-8 w-auto lg:h-10"
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
              className="h-8 w-auto"
            />
            <span className="hidden max-w-[12.5rem] flex-col leading-tight xl:flex">
              <span>Geospatial Planning</span>
              <span>&amp; Budgeting Tools</span>
            </span>
          </a>
          <span className="hidden h-10 w-px bg-[var(--border-soft)] md:block" aria-hidden="true" />
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src={ldtLogo}
              alt="Local Development Tracker"
              priority
              className="h-10 w-auto"
            />
            <span className="truncate text-base font-semibold leading-none text-[var(--foreground)] sm:text-lg">
              Local Development Tracker
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
                  isActive(item.href) &&
                    "bg-[var(--surface-strong)] text-[var(--foreground)] shadow-[0_8px_22px_var(--surface-shadow)]",
                )}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="h-10 w-10 rounded-full border-[var(--border-soft)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)] lg:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu aria-hidden="true" />
            </SheetTrigger>
            <SheetContent className="w-[min(88vw,22rem)] border-[var(--border-soft)] bg-[var(--surface-strong)]">
              <SheetHeader className="gap-2 p-5">
                <SheetTitle>Local Development Tracker</SheetTitle>
                <SheetDescription>
                  Country analytics, methodology, and release context.
                </SheetDescription>
              </SheetHeader>
              <Separator />
              <nav className="flex flex-col gap-1 p-5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
                      isActive(item.href) && "bg-[var(--accent-soft)] text-[var(--foreground)]",
                    )}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
