import type { Metadata } from "next";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { AppHeader } from "@/components/layout/app-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Local Development Tracker",
  description:
    "Public municipality-level analytics for maps, scores, and indicator exploration.",
};

const themeInitializer = `
  try {
    const storedTheme = window.localStorage.getItem("ldt-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : prefersDark
        ? "dark"
        : "light";
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans">
      <body className="min-h-screen">
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        <ThemeProvider>
          <TooltipProvider delay={250}>
            <div className="relative flex min-h-screen flex-col">
              <AppHeader />
              {children}
              <SiteFooter />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
