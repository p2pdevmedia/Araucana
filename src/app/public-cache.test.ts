import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const appDir = join(process.cwd(), "src/app");

function readAppFile(path: string) {
  return readFileSync(join(appDir, path), "utf8");
}

describe("public page caching", () => {
  it.each(["page.tsx", "rutas/page.tsx", "rutas/[slug]/page.tsx", "reservar/[slug]/page.tsx", "cruce-a-chile/page.tsx"])(
    "uses ISR instead of force-dynamic for %s",
    (path) => {
      const source = readAppFile(path);

      expect(source).not.toContain('dynamic = "force-dynamic"');
      expect(source).toContain("export const revalidate = 300");
    }
  );

  it("revalidates public route surfaces after admin route changes", () => {
    const source = readAppFile("admin/rutas/actions.ts");

    expect(source).toContain('revalidatePath("/")');
    expect(source).toContain('revalidatePath("/rutas")');
    expect(source).toContain('revalidatePath("/cruce-a-chile")');
  });

  it("revalidates public schedule surfaces after admin schedule changes", () => {
    const source = readAppFile("admin/salidas/actions.ts");

    expect(source).toContain('revalidatePath("/rutas")');
    expect(source).toContain("revalidatePath(`/rutas/${routeSlug}`)");
    expect(source).toContain("revalidatePath(`/reservar/${routeSlug}`)");
  });

  it("revalidates the reservation page after a web reservation claims a seat", () => {
    const source = readAppFile("reservar/[slug]/actions.ts");

    expect(source).toContain('import { revalidatePath } from "next/cache"');
    expect(source).toContain("revalidatePath(`/reservar/${reservation.route.slug}`)");
  });

  it("revalidates the reservation page after an API reservation claims a seat", () => {
    const source = readAppFile("api/v1/reservations/route.ts");

    expect(source).toContain('import { revalidatePath } from "next/cache"');
    expect(source).toContain("revalidatePath(`/reservar/${reservation.route.slug}`)");
  });
});
