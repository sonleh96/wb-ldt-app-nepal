import type { Metadata } from "next";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { AppHeader } from "@/components/layout/app-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Nepal LDT",
  description:
    "Public municipality-level analytics for maps, scores, and indicator exploration in Nepal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="relative flex min-h-screen flex-col">
          <AppHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
