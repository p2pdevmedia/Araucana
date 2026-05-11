import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("Next config", () => {
  it("raises the Server Actions body limit for manual payment receipt uploads", () => {
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe("12mb");
  });
});
