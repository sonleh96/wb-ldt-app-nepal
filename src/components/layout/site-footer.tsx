import Image from "next/image";
import Link from "next/link";

import {
  GpbSuiteBadge,
  PimPamLogoPlate,
} from "@/components/layout/gpb-suite-branding";
import {
  countryWorkspaceLinks,
  footerNavItems,
} from "@/components/layout/site-links";
import ldtLogo from "../../../images/ldt-logo-dark.png";

const footerLinkClass =
  "inline-flex min-h-9 items-center text-sm font-semibold text-[var(--gpb-chrome-link)] transition-colors duration-200 hover:text-[var(--gpb-chrome-active)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gpb-chrome-focus)]";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--gpb-chrome-divider)] bg-[var(--gpb-chrome-bg)] text-[var(--gpb-chrome-active)]">
      <div className="mx-auto grid w-full max-w-[95vw] gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10 xl:grid-cols-[1.3fr_0.7fr_0.7fr_0.8fr]">
        <section className="max-w-xl">
          <Link
            href="/"
            className="inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gpb-chrome-focus)]"
            aria-label="Local Development Tracker home"
          >
            <Image
              src={ldtLogo}
              alt="Local Development Tracker"
              className="h-14 w-auto object-contain"
            />
          </Link>
          <p className="mt-6 max-w-md text-base font-medium leading-7 text-[var(--gpb-chrome-link)]">
            Municipality-level analytics for comparing local development
            conditions, reading score drivers, and connecting planning evidence
            to public investment decisions.
          </p>
        </section>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--gpb-chrome-active)]">
            Explore
          </h2>
          <ul className="mt-4 space-y-1">
            {footerNavItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Country workspaces">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--gpb-chrome-active)]">
            Countries
          </h2>
          <ul className="mt-4 space-y-1">
            {countryWorkspaceLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className="flex flex-col gap-6">
          <GpbSuiteBadge />
          <PimPamLogoPlate className="max-w-[13rem] p-3" />
        </section>
      </div>
    </footer>
  );
}
