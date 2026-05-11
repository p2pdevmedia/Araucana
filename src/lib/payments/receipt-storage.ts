import { put } from "@vercel/blob";

export const receiptUploadConfig = {
  maxSizeBytes: 8 * 1024 * 1024,
  allowedContentTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"]
} as const;

type StoredReceipt = {
  blobUrl: string;
  blobPathname: string;
  fileName: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
};

function extensionForContentType(contentType: string) {
  const extensions: Record<string, string> = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };

  return extensions[contentType] ?? "bin";
}

function safeFileStem(fileName: string) {
  const stem = fileName.replace(/\.[^.]+$/, "");
  const normalized = stem
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return normalized || "comprobante";
}

export function validateReceiptFile(file: File) {
  if (file.size <= 0) {
    return "Subi un comprobante valido.";
  }

  if (file.size > receiptUploadConfig.maxSizeBytes) {
    return "El comprobante no puede superar 8 MB.";
  }

  if (!receiptUploadConfig.allowedContentTypes.includes(file.type as (typeof receiptUploadConfig.allowedContentTypes)[number])) {
    return "El comprobante debe ser PDF, JPG, PNG o WebP.";
  }

  return null;
}

export async function storeManualPaymentReceipt(reservationCode: string, file: File): Promise<StoredReceipt> {
  const uploadedAt = new Date();
  const extension = extensionForContentType(file.type);
  const pathname = `manual-payment-receipts/${reservationCode}/${uploadedAt.getTime()}-${safeFileStem(file.name)}.${extension}`;
  const blob = await put(pathname, file, {
    access: "private",
    contentType: file.type,
    addRandomSuffix: false
  });

  return {
    blobUrl: blob.url,
    blobPathname: blob.pathname,
    fileName: file.name,
    contentType: blob.contentType || file.type,
    size: file.size,
    uploadedAt
  };
}
