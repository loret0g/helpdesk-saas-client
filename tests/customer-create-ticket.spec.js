import { test, expect } from "@playwright/test";

const DEMO_CUSTOMER = {
  email: "customer@demo.com",
  password: "Customer123!",
};

test.describe("Customer - Crear ticket", () => {
  test("El customer puede loguearse, crear un ticket y verlo en la lista", async ({ page }) => {
    // 1) Login
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_CUSTOMER.email);
    await page.getByLabel("Password").fill(DEMO_CUSTOMER.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Esperamos a ver el userchip para confirmar sesión
    const userChip = page.locator(".userchip");
    await expect(userChip).toBeVisible();

    // 2) Ir a Tickets
    await page.goto("/tickets");
    await expect(page).toHaveURL(/\/tickets$/);

    // 3) Abrir "New ticket" (solo customer)
    await page.getByRole("link", { name: /new ticket/i }).click();
    await expect(page).toHaveURL(/\/tickets\/new$/);

    // 4) Rellenar formulario
    const unique = Date.now();
    const subject = `Playwright ticket ${unique}`;
    const description = `Created by Playwright at ${new Date(unique).toISOString()}`;

    await page.getByLabel("Subject").fill(subject);

    // Category: primera opción disponible
    const categorySelect = page.getByLabel("Category");
    await expect(categorySelect).toBeVisible();
    await categorySelect.selectOption({ index: 0 });

    await page.getByLabel("Description").fill(description);

    // 5) Crear
    await page.getByRole("button", { name: /create ticket/i }).click();

    // Debe navegar a /tickets/:id
    await expect(page).toHaveURL(/\/tickets\/[a-z0-9]{24}$/i);

    // 6) Validar que el detalle muestra el subject y la descripción
    await expect(page.getByText(subject)).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();

    // 7) Volver a la lista y verificar que aparece
    await page.getByRole("link", { name: /back/i }).click();
    await expect(page).toHaveURL(/\/tickets$/);

    // Si la lista es larga, buscamos con el search input
    const search = page.getByPlaceholder(/search by code or subject/i);
    await expect(search).toBeVisible();
    await search.fill(subject);

    // Debe aparecer el ticket recién creado
    await expect(page.getByText(subject)).toBeVisible();
  });
});