import { test, expect } from "@playwright/test";

const DEMO = {
  agentA: { email: "agent@demo.com", password: "Agent123!" },
  customer: { email: "customer@demo.com", password: "Customer123!" },
};

async function login(page, { email, password }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Confirmamos sesión activa por presencia del botón Logout
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
}

async function logout(page) {
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
}

test.describe("RBAC - Control de acceso por rol", () => {
  test("CUSTOMER no ve acciones de staff en TicketDetail", async ({ page }) => {
    const unique = Date.now();
    const subject = `E2E RBAC - ${unique}`;
    const description =
      "E2E: ticket para validar restricciones de rol.";

    await login(page, DEMO.customer);

    // Creamos ticket como CUSTOMER
    await page.goto("/tickets/new");
    await page.getByLabel("Subject").fill(subject);
    await page.getByLabel("Description").fill(description);
    await page.getByRole("button", { name: "Create ticket" }).click();

    await expect(page).toHaveURL(/\/tickets\/[a-f0-9]{24}$/i);

    // CUSTOMER no debe ver controles de asignación ni cambio de estado
    await expect(
      page.getByRole("button", { name: "Assign to me" })
    ).toHaveCount(0);

    await expect(
      page.getByLabel("Ticket status")
    ).toHaveCount(0);

    await logout(page);
  });

  test("CUSTOMER no puede acceder a rutas de gestión de KB", async ({ page }) => {
    await login(page, DEMO.customer);

    // Intento de acceso directo a crear artículo
    await page.goto("/kb/new");
    await expect(page.getByText("Access denied.")).toBeVisible();

    // Intento de acceso directo a editar artículo
    await page.goto("/kb/000000000000000000000000/edit");
    await expect(page.getByText("Access denied.")).toBeVisible();

    await logout(page);
  });

  test("AGENT sí puede acceder a la creación de artículos KB", async ({ page }) => {
    await login(page, DEMO.agentA);

    await page.goto("/kb/new");

    // Página de creación accesible para roles de staff
    await expect(
      page.getByRole("heading", { name: "New KB Article" })
    ).toBeVisible();

    await logout(page);
  });
});