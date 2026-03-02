import { test, expect } from "@playwright/test";

/**
 * Smoke tests
 * Verifican que la aplicación arranca correctamente
 * y que el enrutado protegido funciona como se espera.
 */

test.describe("Smoke tests", () => {

  test("Home renderiza correctamente y muestra el Navbar", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Helpdesk" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tickets" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Knowledge Base" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  });

  test("Rutas protegidas redirigen a login cuando no hay sesión", async ({ page }) => {
    await page.goto("/");

    // Tickets está protegida
    await page.getByRole("link", { name: "Tickets" }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Knowledge Base también está protegida
    await page.getByRole("link", { name: "Knowledge Base" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("Acceso directo por URL a ruta protegida redirige a login", async ({ page }) => {
    await page.goto("/tickets");
    await expect(page).toHaveURL(/\/login$/);
  });

});