import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("branding assets and PIL diagram are wired into the app", async () => {
  await Promise.all([
    access("images/gpb-logo.png"),
    access("images/ldt-logo.png"),
    access("images/pimpam_logo.png"),
    access("images/PIL Diagram.png"),
  ]);

  const header = await readFile("src/components/layout/app-header.tsx", "utf8");
  const home = await readFile("src/app/page.tsx", "utf8");
  const methodology = await readFile("src/app/methodology/page.tsx", "utf8");

  assert.match(header, /images\/gpb-logo\.png/);
  assert.match(header, /images\/ldt-logo\.png/);
  assert.match(header, /images\/pimpam_logo\.png/);
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

test("about page follows the GPB PIA quickstart content", async () => {
  const about = await readFile("src/app/about/page.tsx", "utf8");

  assert.match(about, /Public Infrastructure Access QuickStart/);
  assert.match(about, /The problem averages hide/);
  assert.match(about, /The method: four steps, any country/);
  assert.match(about, /Replicability: adding the next country/);
  assert.match(about, /Working with sector teams/);
});
