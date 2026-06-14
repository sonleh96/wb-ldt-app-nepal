"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Globe2, Menu } from "lucide-react";

import {
  EcosystemLogoGrid,
  GpbSuiteBadge,
} from "@/components/layout/gpb-suite-branding";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { headerNavItems } from "@/components/layout/site-links";
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
import ldtLogo from "../../../images/ldt-logo.png";

function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (href.includes("#")) {
    return false;
  }

  return exact ? pathname === href : pathname.startsWith(href);
}

function ChromeNavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative inline-flex min-h-11 items-center px-3 text-sm font-semibold text-[var(--gpb-chrome-link)] transition-colors duration-200 hover:text-[var(--gpb-chrome-active)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gpb-chrome-focus)]",
        active && "text-[var(--gpb-chrome-active)]",
      )}
      aria-current={active ? "page" : undefined}
    >
      {label}
      <span
        className={cn(
          "absolute inset-x-3 bottom-1 h-0.5 scale-x-0 bg-[var(--gpb-chrome-active)] transition-transform duration-200 group-hover:scale-x-100",
          active && "scale-x-100",
        )}
        aria-hidden="true"
      />
    </Link>
  );
}

function LanguageIndicator() {
  return (
    <span
      className="hidden min-h-11 items-center gap-2 text-sm font-semibold text-[var(--gpb-chrome-active)] lg:inline-flex"
      aria-label="Current language: English"
    >
      <Globe2 aria-hidden="true" className="size-5" />
      EN
    </span>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--gpb-chrome-divider)] bg-[var(--gpb-chrome-bg)] text-[var(--gpb-chrome-active)] shadow-[0_12px_28px_rgba(2,20,32,0.18)]">
      <div className="mx-auto flex min-h-20 w-full max-w-[95vw] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="flex min-w-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gpb-chrome-focus)]"
          aria-label="Local Development Tracker home"
        >
          <span className="flex h-12 w-[11rem] items-center rounded-sm bg-white px-3 shadow-sm sm:w-[13rem]">
            <Image
              src={ldtLogo}
              alt="Local Development Tracker"
              priority
              className="h-10 w-auto object-contain"
            />
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-3 lg:flex">
          {headerNavItems.map((item) => (
            <ChromeNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={isActivePath(pathname, item.href, item.exact)}
            />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <LanguageIndicator />
          <ThemeToggle
            className="h-11 border-[var(--gpb-chrome-divider)] bg-white/[0.08] px-3 text-[var(--gpb-chrome-active)] hover:bg-white/[0.14] hover:text-white focus-visible:ring-white/40"
            iconClassName="text-[var(--gpb-chrome-active)]"
            labelClassName="text-[var(--gpb-chrome-active)]"
          />
          <div className="hidden xl:block">
            <GpbSuiteBadge />
          </div>
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="h-11 w-11 rounded-sm border-[var(--gpb-chrome-divider)] bg-white/[0.08] text-[var(--gpb-chrome-active)] hover:bg-white/[0.14] hover:text-white focus-visible:ring-white/40 lg:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu aria-hidden="true" className="size-5" />
            </SheetTrigger>
            <SheetContent className="w-[min(88vw,23rem)] border-[var(--gpb-chrome-divider)] bg-[var(--gpb-chrome-bg)] text-[var(--gpb-chrome-active)]">
              <SheetHeader className="gap-3 p-5">
                <span className="flex h-12 w-[12.5rem] items-center rounded-sm bg-white px-3 shadow-sm">
                  <Image
                    src={ldtLogo}
                    alt="Local Development Tracker"
                    priority
                    className="h-10 w-auto object-contain"
                  />
                </span>
                <SheetTitle className="text-left text-[var(--gpb-chrome-active)]">
                  Local Development Tracker
                </SheetTitle>
                <SheetDescription className="text-left text-[var(--gpb-chrome-link)]">
                  Country analytics, methodology, and release context.
                </SheetDescription>
              </SheetHeader>
              <Separator className="bg-[var(--gpb-chrome-divider)]" />
              <nav className="flex flex-col gap-1 p-5">
                {headerNavItems.map((item) => (
                  <ChromeNavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    active={isActivePath(pathname, item.href, item.exact)}
                    onClick={() => setIsMobileNavOpen(false)}
                  />
                ))}
              </nav>
              <div className="space-y-5 px-5 pb-5">
                <span
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--gpb-chrome-active)]"
                  aria-label="Current language: English"
                >
                  <Globe2 aria-hidden="true" className="size-5" />
                  EN
                </span>
                <GpbSuiteBadge compact />
                <EcosystemLogoGrid />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
