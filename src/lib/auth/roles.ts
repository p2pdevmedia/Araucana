export const appRoles = ["ADMIN", "SECRETARY", "DRIVER", "USER"] as const;

export type AppRole = (typeof appRoles)[number];

export function toPublicRole(role: string): AppRole {
  return appRoles.includes(role as AppRole) ? (role as AppRole) : "USER";
}

export function getDefaultPathForRole(role: AppRole) {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "SECRETARY") {
    return "/admin/reservas";
  }

  if (role === "DRIVER") {
    return "/chofer";
  }

  return "/";
}

export function roleCanAccess(role: AppRole, allowedRoles: AppRole[]) {
  return allowedRoles.includes(role);
}
