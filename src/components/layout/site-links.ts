export const headerNavItems = [
  { href: "/", label: "Home", exact: true },
  { href: "/#country-workspaces", label: "Countries", exact: true },
  { href: "/methodology", label: "Methodology", exact: false },
  { href: "/release-notes", label: "Release Notes", exact: false },
] as const;

export const footerNavItems = [
  { href: "/", label: "Home" },
  { href: "/#country-workspaces", label: "Country workspaces" },
  { href: "/methodology", label: "Methodology" },
  { href: "/release-notes", label: "Release Notes" },
  { href: "/about", label: "About" },
] as const;

export const countryWorkspaceLinks = [
  { href: "/nepal", label: "Nepal" },
  { href: "/serbia", label: "Serbia" },
  { href: "/zambia", label: "Zambia" },
] as const;
