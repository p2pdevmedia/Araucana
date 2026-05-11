"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);
    await fetch("/api/v1/auth/logout", {
      method: "POST"
    });
    router.push("/");
    router.refresh();
  }

  return (
    <button className="danger-button" type="button" onClick={handleLogout} disabled={isSubmitting}>
      {isSubmitting ? "Saliendo..." : "Salir"}
    </button>
  );
}
