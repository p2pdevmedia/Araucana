import { expect, test, type Page } from "@playwright/test";

const adminEmail = "kevin@jefe.com";
const adminPassword = "kieroMoverElBote";

const adminPages = [
  {
    path: "/admin",
    heading: "Panel de turismo y transporte",
    content: ["Rutas publicadas", /Salidas pr.ximas/, "Reservas ejemplo", adminEmail]
  },
  {
    path: "/admin/rutas",
    heading: "Rutas",
    content: ["Ruta", "Via", "Frecuencia", "Precio", "SMA", "Bariloche"]
  },
  {
    path: "/admin/salidas",
    heading: "Salidas",
    content: ["Ruta", "Fecha", "Hora", "Asientos", "Abierta"]
  },
  {
    path: "/admin/naves",
    heading: "Naves",
    content: ["Nave", "Marca / modelo", "Araucana 24", "Mercedes-Benz"]
  },
  {
    path: "/admin/reservas",
    heading: "Reservas",
    content: ["Codigo", "Pasajero", "Camila Vidal", "Confirmada"]
  }
];

async function waitForReactFormHydration(page: Page) {
  await page.locator("form").evaluate((form) => {
    return new Promise<void>((resolve, reject) => {
      const hasReactProps = () => Object.keys(form).some((key) => key.startsWith("__reactProps$"));

      if (hasReactProps()) {
        resolve();
        return;
      }

      const timeout = window.setTimeout(() => {
        window.clearInterval(interval);
        reject(new Error("Timed out waiting for the login form to hydrate"));
      }, 10_000);

      const interval = window.setInterval(() => {
        if (!hasReactProps()) {
          return;
        }

        window.clearTimeout(timeout);
        window.clearInterval(interval);
        resolve();
      }, 50);
    });
  });
}

async function logInAsAdmin(page: Page) {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Entrar a la cabina Araucana." })).toBeVisible();
  await waitForReactFormHydration(page);

  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText(`Ingresaste como ${adminEmail}`)).toBeVisible();
}

test.describe("Administrador", () => {
  test("redirige visitantes sin sesion hacia el login", async ({ page }) => {
    for (const adminPage of adminPages) {
      await page.goto(adminPage.path);
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole("heading", { name: "Entrar a la cabina Araucana." })).toBeVisible();
    }
  });

  test("permite iniciar sesion, recorrer el panel completo y salir", async ({ page }) => {
    await logInAsAdmin(page);

    for (const adminPage of adminPages) {
      await page.goto(adminPage.path);
      await expect(page.getByRole("heading", { name: adminPage.heading })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Administracion" })).toBeVisible();

      for (const expectedContent of adminPage.content) {
        await expect(page.getByText(expectedContent).first()).toBeVisible();
      }
    }

    await page.goto("/admin/rutas");
    await page.getByRole("link", { name: "Abrir" }).first().click();
    await expect(page).toHaveURL(/\/rutas\/sma-bariloche-7-lagos$/);
    await expect(page.getByRole("heading", { name: /SMA.*Bariloche/ })).toBeVisible();

    await page.goto("/admin");
    await page.getByRole("button", { name: "Salir" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("permite crear una nave desde una plantilla editable", async ({ page }) => {
    await logInAsAdmin(page);

    await page.goto("/admin/naves");
    await page.getByRole("link", { name: "Agregar nave" }).click();
    await expect(page.getByRole("heading", { name: "Agregar nave" })).toBeVisible();

    await page.getByLabel("Nombre interno").fill("Araucana Test E2E");
    await page.getByLabel("Plantilla").selectOption("fiat-ducato-16");
    await page.getByLabel("Patente / identificador").fill("TEST 016");
    await expect(page.getByText("16 asientos")).toBeVisible();
    await page.getByRole("button", { name: "Crear nave" }).click();

    await expect(page).toHaveURL(/\/admin\/naves$/);
    await expect(page.getByText("Araucana Test E2E")).toBeVisible();
    await expect(page.getByText("Fiat · Ducato Minibus 16 plazas")).toBeVisible();
    await expect(page.getByText("16 pasajeros")).toBeVisible();
  });
});
