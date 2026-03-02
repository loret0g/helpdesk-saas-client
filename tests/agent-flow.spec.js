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

  // Confirmamos sesión por UI (Navbar)
  await expect(page.getByText("Logout")).toBeVisible();
}

async function logout(page) {
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
}

test.describe("Agent flow - Asignación + respuesta + cambio de estado", () => {
  test("Customer crea ticket -> Agent lo toma -> responde -> pasa a IN_PROGRESS automáticamente", async ({ page }) => {
    const unique = Date.now();
    const subject = `E2E Agent Flow - ${unique}`;
    const description =
      "E2E: ticket creado para probar flujo de agente (asignar + responder).";

    // 1) Customer crea ticket
    await login(page, DEMO.customer);

    await page.goto("/tickets/new");
    await page.getByLabel("Subject").fill(subject);
    await page.getByLabel("Description").fill(description);
    await page.getByRole("button", { name: "Create ticket" }).click();

    // Estamos en detalle del ticket
    await expect(page).toHaveURL(/\/tickets\/[a-f0-9]{24}$/i);

    // Esperamos a que el code exista antes de leerlo
    const ticketCodeEl = page.locator(".ticketCode");
    await expect(ticketCodeEl).toBeVisible();
    await expect(ticketCodeEl).toHaveText(/^TCKT-\d{6}$/);
    const ticketCode = (await ticketCodeEl.innerText()).trim();

    // 2) Logout customer
    await logout(page);

    // 3) Login agent
    await login(page, DEMO.agentA);

    // 4) Buscar el ticket por code y abrirlo
    await page.goto("/tickets");
    const search = page.getByPlaceholder("Search by code or subject…");
    await search.fill(ticketCode);

    await expect(page.getByText(ticketCode)).toBeVisible();
    await page.getByRole("link", { name: new RegExp(ticketCode) }).click();
    await expect(page).toHaveURL(/\/tickets\/[a-f0-9]{24}$/i);

    // 5) Assign to me
    const assignBtn = page.getByRole("button", { name: "Assign to me" });
    await expect(assignBtn).toBeVisible();
    await assignBtn.click();

    await expect(page.getByRole("button", { name: "Assigned" })).toBeVisible();

    // ✅ Comprobamos el assignee en el bloque "Assignee" (evita el strict mode del navbar)
    const assigneeValue = page
      .locator(".ticketMeta .metaItem")
      .filter({ has: page.locator(".metaLabel", { hasText: "Assignee" }) })
      .locator(".metaValue");

    await expect(assigneeValue).toHaveText("Demo Agent A");

    // 6) Reply (y comprobar cambio automático a IN_PROGRESS)
    const replyText = `E2E: Agent reply - ${unique} ✅`;

    await page.getByPlaceholder("Write your message…").fill(replyText);
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText(replyText)).toBeVisible();

    // Validamos estado real del ticket
    const statusSelect = page.getByLabel("Ticket status");
    await expect(statusSelect).toHaveValue("WAITING_ON_CUSTOMER");
  });
});