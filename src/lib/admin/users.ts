import type { AppRole } from "@/lib/auth/roles";

export const managedUserRoles = ["SECRETARY", "DRIVER"] as const;

export type ManagedUserRole = (typeof managedUserRoles)[number];

type ManagedUserConfig = {
  role: ManagedUserRole;
  segment: string;
  title: string;
  singular: string;
  plural: string;
  newLabel: string;
};

export const managedUserConfigs: Record<ManagedUserRole, ManagedUserConfig> = {
  SECRETARY: {
    role: "SECRETARY",
    segment: "secretarias",
    title: "Secretarias",
    singular: "secretaria",
    plural: "secretarias",
    newLabel: "Nueva secretaria"
  },
  DRIVER: {
    role: "DRIVER",
    segment: "choferes",
    title: "Choferes",
    singular: "chofer",
    plural: "choferes",
    newLabel: "Nuevo chofer"
  }
};

export function isManagedUserRole(role: string): role is ManagedUserRole {
  return managedUserRoles.includes(role as ManagedUserRole);
}

export function getManagedUserConfig(role: ManagedUserRole) {
  return managedUserConfigs[role];
}

export function getManagedUserPath(role: ManagedUserRole, suffix = "") {
  const config = getManagedUserConfig(role);
  return `/admin/${config.segment}${suffix}`;
}

export function toManagedUserRole(role: AppRole): ManagedUserRole | null {
  return isManagedUserRole(role) ? role : null;
}
