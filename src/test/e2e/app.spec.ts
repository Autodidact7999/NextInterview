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

test("searches Trace Lab and completes a contextual prediction flow", async ({
  page,
}) => {
  await page.goto("/trace");
  await expect(
    page.getByRole("heading", { name: "See the invariant move." }),
  ).toBeVisible();
  await expect(page.getByText("20 interactive traces")).toBeVisible();
  await page
    .getByPlaceholder("Search title, LC number, or pattern")
    .fill("two sum");
  await page.getByRole("link", { name: /Two Sum/ }).click();
  await expect(page).toHaveURL(/\/trace\/two-sum$/);
  await expect(page.getByRole("heading", { name: "Two Sum" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Start with an empty lookup table/ }),
  ).toBeVisible();

  await page.goto("/practice?week=1");
  await page
    .locator("#day-1")
    .getByRole("link", { name: "Visualize Two Sum" })
    .click();
  await expect(page).toHaveURL(/\/trace\/two-sum\?day=1$/);
  await page.getByRole("button", { name: "Edit input" }).click();
  await page.getByLabel("Numbers").fill("[4, 6]");
  await page.getByLabel("Target").fill("10");
  await page.getByRole("button", { name: "Generate trace" }).click();
  const slider = page.getByRole("slider", { name: "Trace step" });
  await slider.fill("3");
  await page.getByLabel("Return the two indices").check();
  await page.getByRole("button", { name: "Reveal reasoning" }).click();
  await expect(page.getByText(/That’s it/)).toBeVisible();

  const workspace = page.getByLabel(/Two Sum trace workspace/);
  await workspace.focus();
  await page.keyboard.press("End");
  await page.getByRole("button", { name: /Mark complete & return/ }).click();
  await expect(page).toHaveURL(/\/practice\?week=1#day-1$/);
  await expect(
    page.getByLabel("Mark Two Sum complete for Day 1"),
  ).toBeChecked();
});

test("keeps Trace Lab usable on narrow screens, reload, dark mode, and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/trace/valid-anagram");
  await expect(
    page.getByRole("heading", { name: "Valid Anagram" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Java" }).click();
  await expect(page.getByRole("region", { name: "Java source" })).toBeVisible();
  await expect(page.getByLabel("Playback speed")).toBeVisible();
  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    ),
  ).toBe("dark");

  await page.goto("/trace/not-a-real-problem");
  await expect(page.getByText(/404|not found/i).first()).toBeVisible();
});
