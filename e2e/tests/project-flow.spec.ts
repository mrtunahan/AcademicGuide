import { expect, test } from "@playwright/test";

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@e2e.test`;
}

test("student creates a project and submits an analysis", async ({ page }) => {
  await page.goto("/register");

  await page.locator('input[type="text"], input:not([type])').first().fill("E2E Student");
  await page.locator('input[type="email"]').fill(uniqueEmail("stu"));
  await page.locator('input[type="password"]').fill("supersecretpw");
  await page.locator("select").selectOption("student");
  await page.getByRole("button", { name: "Kayıt Ol" }).click();

  await page.getByRole("link", { name: "Projelerim" }).click();
  await page.getByPlaceholder("Proje başlığı").fill("E2E Test Projesi");
  await page.getByRole("button", { name: "Oluştur" }).click();

  await page.getByRole("link", { name: "E2E Test Projesi" }).click();
  await expect(page.getByRole("heading", { name: "Bölüm Analizi" })).toBeVisible();

  await page
    .getByTestId("section-text")
    .fill(
      "Bu çalışmada önerdiğimiz yaklaşımın özgün değeri, mevcut literatürdeki yaklaşımlarla karşılaştırıldığında belirgin bir farklılık ortaya koymaktadır.",
    );
  await expect(page.getByRole("button", { name: "Kriter Analizi" })).toBeEnabled();
});
