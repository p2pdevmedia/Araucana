import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const appDir = join(process.cwd(), "src/app");

function readAppFile(path: string) {
  return readFileSync(join(appDir, path), "utf8");
}

describe("high intent route prefetching", () => {
  it("prefetches primary route entry points from the global navigation", () => {
    const source = readAppFile("layout.tsx");

    expect(source).toContain('<Link href="/rutas" prefetch={true}>Rutas</Link>');
    expect(source).toContain('<Link href="/rutas/sma-villa-traful-verano-2026" prefetch={true}>Villa Traful</Link>');
    expect(source).toContain('<Link href="/rutas/sma-hua-hum-verano-2026" prefetch={true}>Hua Hum</Link>');
    expect(source).toContain('<Link className="cream-button" href="/rutas" prefetch={true}>');
  });

  it("prefetches route selection links from the home page", () => {
    const source = readAppFile("page.tsx");

    expect(source).toContain('<Link className="cream-button" href="/rutas" prefetch={true}>');
    expect(source).toContain('<Link className="ghost-button" href="/rutas" prefetch={true}>');
    expect(source).toContain('<Link className="route-card featured" href={`/rutas/${featured.slug}`} prefetch={true}>');
    expect(source).toContain('prefetch={true}');
  });

  it("prefetches dynamic route cards and reservation CTAs", () => {
    expect(readAppFile("rutas/page.tsx")).toContain('prefetch={true}');
    expect(readAppFile("rutas/[slug]/page.tsx")).toContain('<Link className="cream-button" href={`/reservar/${route.slug}`} prefetch={true}>');
    expect(readAppFile("cruce-a-chile/page.tsx")).toContain('prefetch={true}');
  });
});
