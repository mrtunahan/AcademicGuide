import { expect, test } from "@playwright/test";

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@e2e.test`;
}

test("student can register and reach the projects page", async ({ page }) => {
  await page.goto("/register");

  await page.getByPlaceholder("").nth(0); // sanity wait
  await page.locator('input[type="text"], input:not([type])').first().fill("E2E Student");
  await page.locator('input[type="email"]').fill(uniqueEmail("stu"));
  await page.locator('input[type="password"]').fill("supersecretpw");
  await page.locator("select").selectOption("student");
  await page.getByRole("button", { name: "Kayıt Ol" }).click();

  await expect(page).toHaveURL("/");
  await page.getByRole("link", { name: "Projelerim" }).click();
  await expect(page.getByRole("heading", { name: "Projelerim" })).toBeVisible();
});

test("advisor reaches the kanban dashboard", async ({ page }) => {
  await page.goto("/register");

  await page.locator('input[type="text"], input:not([type])').first().fill("E2E Advisor");
  await page.locator('input[type="email"]').fill(uniqueEmail("adv"));
  await page.locator('input[type="password"]').fill("supersecretpw");
  await page.locator("select").selectOption("advisor");
  await page.getByRole("button", { name: "Kayıt Ol" }).click();

  await expect(page).toHaveURL("/");
  await page.getByRole("link", { name: "Danışman" }).click();
  await expect(
    page.getByRole("heading", { name: "Danışman Dashboard" }),
  ).toBeVisible();
});
