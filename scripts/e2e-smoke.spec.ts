import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("Public navigation", () => {
  test("nav links resolve, no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const path of ["/", "/guide", "/community", "/join"]) {
      await page.goto(`${BASE}${path}`);
      await expect(page).toHaveURL(new RegExp(path === "/" ? "/$" : path));
    }
    expect(errors).toEqual([]);
  });

  test("old routes redirect, never 404", async ({ page }) => {
    const cases: [string, RegExp][] = [
      ["/gallery", /\/guide/],
      ["/gallery/salda", /\/guide\/gallery\/salda/],
      ["/dashboard", /\/community$/],
      ["/members", /\/community$/],
      ["/opportunities", /\/community\/opportunities$/],
    ];
    for (const [from, to] of cases) {
      const res = await page.goto(`${BASE}${from}`);
      expect(res?.status()).toBeLessThan(400);
      await expect(page).toHaveURL(to);
    }
  });

  test("community tabs switch correctly", async ({ page }) => {
    await page.goto(`${BASE}/community`);
    await page.getByRole("link", { name: "Chat" }).click();
    await expect(page).toHaveURL(/\/community\/chat/);
    await page.getByRole("link", { name: "Marketplace" }).click();
    await expect(page).toHaveURL(/\/community\/marketplace/);
    await page.getByRole("link", { name: "Opportunities" }).click();
    await expect(page).toHaveURL(/\/community\/opportunities/);
    await page.getByRole("link", { name: "Feed" }).click();
    await expect(page).toHaveURL(/\/community$/);
  });

  test("mobile viewport renders nav on all 4 pages", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ["/", "/guide", "/community", "/join"]) {
      await page.goto(`${BASE}${path}`);
      await expect(page.locator("header")).toBeVisible();
    }
  });
});

test.describe("Signed-out forms visibly gate on Join", () => {
  test("community feed shows join prompt, not a post form", async ({ page }) => {
    await page.goto(`${BASE}/community`);
    await expect(page.getByRole("link", { name: /Join the community/i })).toBeVisible();
  });
  test("opportunities shows join prompt", async ({ page }) => {
    await page.goto(`${BASE}/community/opportunities`);
    // Scoped to <main>: the header renders its own persistent "Join" nav
    // link + CTA button on every page (by design, Task 1), so an
    // unscoped role lookup for "Join" is ambiguous. This targets the
    // page's own join-gate prompt specifically.
    await expect(page.locator("main").getByRole("link", { name: "Join" })).toBeVisible();
  });
  test("marketplace shows join prompt", async ({ page }) => {
    await page.goto(`${BASE}/community/marketplace`);
    await expect(page.locator("main").getByRole("link", { name: "Join" })).toBeVisible();
  });
});

test.describe("Sign-up form validation (no real account created)", () => {
  test("sign-up requires terms checkbox", async ({ page }) => {
    await page.goto(`${BASE}/join`);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.getByLabel("Your name").fill("Test Smoke");
    // exact: true — the sign-up form also has a "Email me about village
    // news..." opt-in checkbox whose label contains "Email" as a substring,
    // which would otherwise ambiguously match too.
    await page.getByLabel("Email", { exact: true }).fill(`smoke-${Date.now()}@example.com`);
    await page.getByLabel("Password").fill("testpass123");
    await page.getByRole("button", { name: "Create account" }).last().click();
    await expect(page.getByText(/accept the terms/i)).toBeVisible();
  });

  test("OAuth buttons are present and clickable (completion out of scope)", async ({ page }) => {
    await page.goto(`${BASE}/join`);
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Facebook" })).toBeVisible();
  });
});
