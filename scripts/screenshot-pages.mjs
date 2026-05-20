import { chromium } from "@playwright/test";

const BASE = "http://localhost:3000";
const CREDS = { email: "buyer1@ticketflow.com", password: "Password123!" };
const ADMIN = { email: "admin@ticketflow.com", password: "Password123!" };
const ORGANIZER = { email: "organizer1@ticketflow.com", password: "Password123!" };
const OPERATOR = { email: "operator@ticketflow.com", password: "Password123!" };

async function login(page, { email, password }) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /entrar/i }).click();
  await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 }).catch(() => {});
  await page.waitForLoadState("networkidle").catch(() => {});
}

const browser = await chromium.launch({ headless: true });

async function screenshot(label, url, creds) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await login(page, creds);
  await page.goto(url);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.screenshot({ path: `screenshots/${label}.png`, fullPage: false });
  console.log(`✓ ${label}.png`);
  await ctx.close();
}

import { mkdirSync } from "fs";
mkdirSync("screenshots", { recursive: true });

await screenshot("01-nav-buyer", `${BASE}/eventos`, CREDS);
await screenshot("02-tickets-list", `${BASE}/tickets`, CREDS);
await screenshot("03-perfil", `${BASE}/perfil`, CREDS);
await screenshot("04-orders", `${BASE}/orders`, CREDS);
await screenshot("05-organizer-eventos", `${BASE}/organizer/eventos`, ORGANIZER);
await screenshot("06-admin-usuarios", `${BASE}/admin/usuarios`, ADMIN);
await screenshot("07-checkin", `${BASE}/checkin`, OPERATOR);

await browser.close();
console.log("\nDone! Screenshots saved to screenshots/");
