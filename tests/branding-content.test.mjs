import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("branding assets and PIL diagram are wired into the app", async () => {
  await Promise.all([
    access("images/gpb-logo.png"),
    access("images/ldt-logo-dark.png"),
    access("images/pimpam_logo.png"),
    access("images/PIL Diagram.png"),
    access("images/about-ldt-size-distribution.png"),
    access("images/about-ldt-3d-pil-ranking.png"),
    access("images/about-ldt-2d-quadrant.png"),
    access("images/about-ldt-strategy-availability.png"),
    access("images/about-ldt-population-distribution.png"),
    access("images/about-ldt-ai-swot.png"),
    access("images/about-ldt-ai-recommendations.png"),
    access("images/about-ldt-project-selection.png"),
  ]);

  const header = await readFile("src/components/layout/app-header.tsx", "utf8");
  const suiteBranding = await readFile("src/components/layout/gpb-suite-branding.tsx", "utf8");
  const home = await readFile("src/app/page.tsx", "utf8");
  const methodology = await readFile("src/app/methodology/page.tsx", "utf8");
  const layoutBranding = `${header}\n${suiteBranding}`;

  assert.match(layoutBranding, /images\/gpb-logo\.png/);
  assert.match(layoutBranding, /images\/ldt-logo-dark\.png/);
  assert.match(layoutBranding, /images\/pimpam_logo\.png/);
  assert.match(home, /PIL Diagram\.png/);
  assert.match(methodology, /PIL Diagram\.png/);
});

test("global typography follows the requested Fira Sans and Inter stack", async () => {
  const css = await readFile("src/app/globals.css", "utf8");

  assert.match(css, /Fira\+Sans/);
  assert.match(css, /family=Fira\+Sans/);
  assert.match(css, /family=Fira\+Sans.*family=Inter/s);
  assert.match(css, /--font-sans: "Inter", "Roboto", "Arial", sans-serif;/);
  assert.match(css, /--font-heading: "Fira Sans", "Trebuchet MS", sans-serif;/);
});

test("about page follows the GPB LDT briefing content", async () => {
  const about = await readFile("src/app/about/page.tsx", "utf8");

  assert.match(about, /Local Development Tracker QuickStart/);
  assert.match(about, /lg:whitespace-nowrap/);
  assert.match(about, /The sub-national challenge/);
  assert.match(about, /The method: two layers, any country/);
  assert.match(about, /Figure 1\. Panel of GPB LDT country demo highlights/);
  assert.match(about, /Replicability: adding the next country/);
  assert.match(about, /Selected country findings/);
  assert.match(about, /about-ldt-ai-recommendations\.png/);
  assert.match(about, /about-ldt-project-selection\.png/);
  assert.doesNotMatch(about, /Release 0\.7/);
  assert.doesNotMatch(about, /ldt\.pim-pam\.net/);
  assert.doesNotMatch(about, /about-ldt-world-bank-logo\.png/);
  assert.doesNotMatch(about, /about-ldt-pimpam-logo\.png/);
  assert.doesNotMatch(about, /about-ldt-gpb-tools-logo\.png/);
});
