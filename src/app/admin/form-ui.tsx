"use client";

import { useFormStatus } from "react-dom";
import type { AdminFormState } from "./form-state";

type AdminFormAlertProps = {
  state: AdminFormState;
};

export function AdminFormAlert({ state }: AdminFormAlertProps) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.status === "success" ? "admin-toast success" : "form-alert error"} role="status">
      {state.message}
    </p>
  );
}

type AdminSubmitButtonProps = {
  children: React.ReactNode;
};

export function AdminSubmitButton({ children }: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className="button" type="submit" disabled={pending}>
      {pending ? "Guardando..." : children}
    </button>
  );
}

type FieldErrorProps = {
  id: string;
  message?: string;
};

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <span className="field-error" id={id}>
      {message}
    </span>
  );
}

type AdminToastProps = {
  message?: string;
};

export function AdminToast({ message }: AdminToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="admin-toast" role="status">
      {message}
    </div>
  );
}
