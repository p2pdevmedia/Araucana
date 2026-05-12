"use client";

import { useState } from "react";

type AccountingDisclosureProps = {
  title: string;
  buttonLabel: string;
  children: React.ReactNode;
};

export function AccountingDisclosure({ title, buttonLabel, children }: AccountingDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="plain-card admin-section accounting-disclosure">
      <div className="accounting-disclosure-head">
        <h2>{title}</h2>
        <button className="button" type="button" onClick={() => setIsOpen((current) => !current)}>
          {isOpen ? "Cerrar" : buttonLabel}
        </button>
      </div>
      {isOpen ? <div className="accounting-disclosure-body">{children}</div> : null}
    </div>
  );
}
