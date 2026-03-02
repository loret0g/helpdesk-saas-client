import { test, expect } from "@playwright/test";

/**
 * Smoke tests (autenticación)
 * Verifica que un usuario puede iniciar sesión y acceder a rutas protegidas.
 */

test.describe("Smoke tests - autenticación", () => {
  test("Login funciona y permite acceder a Tickets y KB", async ({ page }) => {
    await page.goto("/login");

    // Login con demo (Agent A)
    await page.getByLabel("Email").fill("agent@demo.com");
    await page.getByLabel("Password").fill("Agent123!");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Después de login, /tickets
    await expect(page).toHaveURL(/\/tickets$/);

    // Señales de sesión iniciada: Logout visible + chip del usuario
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();

    const userChip = page.locator(".userchip");

    await expect(userChip).toBeVisible();
    await expect(userChip).toContainText("Demo Agent A");
    await expect(userChip.locator(".badge")).toHaveText(/AGENT/i);

    // Acceso a KB ya autenticado
    await page.goto("/kb");
    await expect(page).toHaveURL(/\/kb$/);

    // Navbar sigue presente en rutas internas
    await expect(page.getByRole("link", { name: "Helpdesk" })).toBeVisible();
  });
});