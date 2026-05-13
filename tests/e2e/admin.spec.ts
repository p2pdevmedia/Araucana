import { expect, test, type Page } from "@playwright/test";

const adminEmail = "kevin@jefe.com";
const adminPassword = "kieroMoverElBote";
const secretaryEmail = "secretaria@araucana.com";
const secretaryPassword = "reservasAraucana";
const driverEmail = "chofer@araucana.com";
const driverPassword = "ubicacionAraucana";

const adminPages = [
  {
    path: "/admin",
    heading: "Panel de turismo y transporte",
    content: ["Rutas publicadas", /Salidas pr.ximas/, "Reservas activas", adminEmail]
  },
  {
    path: "/admin/rutas",
    heading: "Rutas",
    content: ["Ruta", "Via", "Frecuencia", "Precio", "San Martin de los Andes", "Villa Traful"]
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
    content: ["Codigo", "Pasajero", "Ruta", "Estado"]
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

async function logIn(page: Page, email: string, password: string, expectedPath: RegExp) {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Entrar a la cabina Araucana." })).toBeVisible();
  await waitForReactFormHydration(page);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page).toHaveURL(expectedPath);
}

async function logInAsAdmin(page: Page) {
  await logIn(page, adminEmail, adminPassword, /\/admin$/);
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
    await expect(page).toHaveURL(/\/rutas\/sma-villa-traful-verano-2026$/);
    await expect(page.getByRole("heading", { name: /San Martin de los Andes.*Villa Traful/ })).toBeVisible();

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

  test("limita a la secretaria a reservas", async ({ page }) => {
    await logIn(page, secretaryEmail, secretaryPassword, /\/admin\/reservas$/);

    await expect(page.getByRole("heading", { name: "Reservas" })).toBeVisible();
    const navigation = page.getByRole("navigation", { name: "Administracion" });
    await expect(navigation.getByRole("link", { name: "Reservas" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Rutas" })).toHaveCount(0);
    await expect(navigation.getByRole("link", { name: "Salidas" })).toHaveCount(0);
    await expect(navigation.getByRole("link", { name: "Naves" })).toHaveCount(0);

    await page.goto("/admin/naves");
    await expect(page).toHaveURL(/\/admin\/reservas$/);
  });

  test("lleva al chofer a seleccionar nave para compartir ubicacion", async ({ page }) => {
    await logIn(page, driverEmail, driverPassword, /\/chofer$/);

    await expect(page.getByRole("heading", { name: "Ubicacion de nave" })).toBeVisible();
    await expect(page.getByLabel("Nave")).toBeVisible();
    await expect(page.getByRole("button", { name: "Compartir ubicacion" })).toBeVisible();

    await page.goto("/admin/reservas");
    await expect(page).toHaveURL(/\/chofer$/);
  });
});
