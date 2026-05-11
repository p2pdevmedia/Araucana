import { describe, expect, it } from "vitest";
import { receiptUploadConfig, validateReceiptFile } from "./receipt-validation";

function fileWithSize(size: number, type = "application/pdf") {
  return {
    name: "comprobante.pdf",
    size,
    type
  } as File;
}

describe("receipt validation", () => {
  it("allows receipts up to 10 MB", () => {
    expect(receiptUploadConfig.maxSizeBytes).toBe(10 * 1024 * 1024);
    expect(validateReceiptFile(fileWithSize(10 * 1024 * 1024))).toBeNull();
  });

  it("rejects receipts larger than 10 MB with a user-facing message", () => {
    expect(validateReceiptFile(fileWithSize(10 * 1024 * 1024 + 1))).toBe("El comprobante no puede superar 10 MB.");
  });
});
