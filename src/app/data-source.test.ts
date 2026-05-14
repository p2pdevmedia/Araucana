import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(projectRoot, path), "utf8");
}

describe("database-backed demo data", () => {
  it("keeps route fixtures out of the app UI", () => {
    const appFiles = ["src/app/page.tsx", "src/app/layout.tsx", "src/app/rutas/page.tsx", "src/app/app/page.tsx"];

    for (const file of appFiles) {
      expect(readProjectFile(file), `${file} should not import route fixtures`).not.toContain("@/lib/travel-data");
      expect(readProjectFile(file), `${file} should not import route fixtures`).not.toContain("src/lib/travel-data");
    }
  });

  it("keeps the seed fixture inside prisma instead of importing app code", () => {
    const seed = readProjectFile("prisma/seed.ts");

    expect(seed).not.toContain("../src/lib/travel-data");
    expect(seed).toContain("./demo-routes");
  });
});
