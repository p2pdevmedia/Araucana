"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { manualBankDetails } from "@/lib/payments/manual-bank-details";
import { uploadManualPaymentReceiptAction, type UploadReceiptState } from "./actions";

type ManualPaymentPanelProps = {
  reservationCode: string;
  existingReceipt?: {
    fileName: string | null;
    uploadedAt: Date | string | null;
  } | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" type="submit" disabled={pending}>
      {pending ? "Subiendo..." : "Subir comprobante"}
    </button>
  );
}

function formatUploadedAt(value: Date | string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Argentina/Salta"
  }).format(new Date(value));
}

export function ManualPaymentPanel({ reservationCode, existingReceipt }: ManualPaymentPanelProps) {
  const router = useRouter();
  const initialState: UploadReceiptState = {
    ok: false,
    message: ""
  };
  const [state, formAction] = useActionState(uploadManualPaymentReceiptAction, initialState);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <section className="plain-card manual-payment-panel">
      <div>
        <p className="eyebrow">Pago manual</p>
        <h2 className="route-title">Transferencia bancaria</h2>
        <p className="muted">
          Realiza la transferencia con estos datos de prueba y subi el comprobante para que un administrador valide la reserva.
        </p>
      </div>

      <dl className="bank-detail-grid">
        <div>
          <dt>Titular</dt>
          <dd>{manualBankDetails.holder}</dd>
        </div>
        <div>
          <dt>Banco</dt>
          <dd>{manualBankDetails.bank}</dd>
        </div>
        <div>
          <dt>Cuenta</dt>
          <dd>{manualBankDetails.accountType}</dd>
        </div>
        <div>
          <dt>CBU</dt>
          <dd>{manualBankDetails.cbu}</dd>
        </div>
        <div>
          <dt>Alias</dt>
          <dd>{manualBankDetails.alias}</dd>
        </div>
        <div>
          <dt>CUIT</dt>
          <dd>{manualBankDetails.cuit}</dd>
        </div>
      </dl>

      {existingReceipt?.fileName ? (
        <p className="success">
          Comprobante cargado: {existingReceipt.fileName}
          {existingReceipt.uploadedAt ? ` (${formatUploadedAt(existingReceipt.uploadedAt)})` : ""}
        </p>
      ) : null}

      <form className="receipt-form" action={formAction}>
        <input type="hidden" name="code" value={reservationCode} />
        <label>
          Comprobante
          <input name="receipt" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required />
        </label>
        {state.message ? (
          <p className={state.ok ? "success" : "error"} role="status">
            {state.message}
          </p>
        ) : null}
        <SubmitButton />
      </form>
    </section>
  );
}
