import { expect, test } from "@playwright/test";

test("parcours critique: recherche, panier, promo", async ({ page }) => {
  await page.goto("/");

  await page
    .getByLabel("Rechercher maillot, crampons, accessoire (tolérance typo)...")
    .fill("frnce exterieur");
  await expect(
    page.getByRole("link", { name: /Maillot France Extérieur 24\/25/i }),
  ).toBeVisible();

  const card = page
    .locator("article")
    .filter({ hasText: "Maillot France Extérieur 24/25" })
    .first();
  await card.getByRole("button", { name: "Ajouter" }).click();

  await expect(page.getByRole("heading", { name: /1 article/i })).toBeVisible();

  await page.getByPlaceholder("LIMAILL0T5").fill("LIMAILL0T5");
  await page.getByRole("button", { name: "Appliquer" }).click();

  await expect(page.getByText(/10% de réduction/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Valider la commande" }),
  ).toBeVisible();
});
