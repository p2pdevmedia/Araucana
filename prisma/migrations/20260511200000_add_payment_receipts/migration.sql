ALTER TABLE "Payment"
ADD COLUMN "receiptBlobUrl" TEXT,
ADD COLUMN "receiptBlobPathname" TEXT,
ADD COLUMN "receiptFileName" TEXT,
ADD COLUMN "receiptContentType" TEXT,
ADD COLUMN "receiptSize" INTEGER,
ADD COLUMN "receiptUploadedAt" TIMESTAMP(3);
