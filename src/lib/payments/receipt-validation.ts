export const receiptUploadConfig = {
  maxSizeBytes: 10 * 1024 * 1024,
  allowedContentTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"]
} as const;

export function validateReceiptFile(file: File) {
  if (file.size <= 0) {
    return "Subi un comprobante valido.";
  }

  if (file.size > receiptUploadConfig.maxSizeBytes) {
    return "El comprobante no puede superar 10 MB.";
  }

  if (!receiptUploadConfig.allowedContentTypes.includes(file.type as (typeof receiptUploadConfig.allowedContentTypes)[number])) {
    return "El comprobante debe ser PDF, JPG, PNG o WebP.";
  }

  return null;
}
