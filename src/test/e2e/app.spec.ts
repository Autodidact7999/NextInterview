import { expect, test } from "@playwright/test";

test("migrates legacy localStorage and keeps completed practice state", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("dsa_start_date", "2026-04-01");
    window.localStorage.setItem(
      "day_problems_v1",
      JSON.stringify({ day1_prob1: true }),
    );
    window.localStorage.setItem(
      "prep_v2",
      JSON.stringify({ "d-0": "dsa", "d-1": "sd" }),
    );
  });

  await page.goto("/practice");

  const runSummary = page.locator(
    'section[aria-labelledby="current-run-title"]',
  );
  await expect(runSummary).toContainText(
    "Your schedule is outside the active 84-day run",
  );
  await expect(runSummary).toContainText("Day 1 is Apr 1, 2026");
  await expect(runSummary).toContainText("Valid Palindrome");

  await expect(
    page.getByLabel("Mark Two Sum complete for Day 1"),
  ).toBeChecked();

  await page.goto("/progress");
  await expect(
    page.getByRole("button", { name: "Roadmap day 1", exact: true }),
  ).toHaveAttribute("data-status", "dsa");
  await expect(
    page.getByRole("button", { name: "Roadmap day 2", exact: true }),
  ).toHaveAttribute("data-status", "sd");
});

test("supports route navigation on desktop and mobile", async ({ page }) => {
  await page.goto("/");
  await page
    .locator("aside")
    .getByRole("link", { name: /Practice/ })
    .click();
  await expect(page).toHaveURL(/\/practice$/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const mobileHomeLink = page
    .locator("header")
    .getByRole("link", { name: "NextInterview home" });
  await expect(mobileHomeLink).toBeVisible();
  await expect(mobileHomeLink).toContainText("NextInterview");
  await page.getByRole("link", { name: "Reference" }).last().click();
  await expect(page).toHaveURL(/\/reference$/);
});

test("persists updates, cycles tracker state, and respects dark mode", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/practice");

  await page.getByRole("button", { name: "Choose start date" }).click();
  await page.locator('input[type="date"]').fill("2026-04-01");
  await page.getByRole("button", { name: "Save start date" }).click();

  const checkbox = page.getByLabel("Mark Two Sum complete for Day 1");
  await checkbox.check();
  await page.reload();
  await expect(checkbox).toHaveCount(1);
  await expect(checkbox).toBeChecked();

  await page.goto("/progress");
  const trackerDay = page.getByRole("button", {
    name: "Roadmap day 1",
    exact: true,
  });
  await trackerDay.click();
  await expect(trackerDay).toHaveAttribute("data-status", "dsa");
  await trackerDay.click();
  await expect(trackerDay).toHaveAttribute("data-status", "sd");

  const colorScheme = await page.evaluate(
    () => getComputedStyle(document.documentElement).colorScheme,
  );
  expect(colorScheme).toBe("dark");
});
