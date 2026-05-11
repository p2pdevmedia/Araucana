"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getDefaultPathForRole, type AppRole } from "@/lib/auth/roles";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password")
      })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("No pudimos iniciar sesion con esos datos.");
      return;
    }

    const payload = await response.json() as { user?: { role?: AppRole } };
    router.push(getDefaultPathForRole(payload.user?.role ?? "USER"));
    router.refresh();
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue="kevin@jefe.com"
          required
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Ingresando..." : "Ingresar"}
      </button>
      <p className="muted">Usuario inicial: kevin@jefe.com</p>
    </form>
  );
}
