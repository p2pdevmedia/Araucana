import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/lib/auth/service";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { AppRole, getDefaultPathForRole, roleCanAccess } from "@/lib/auth/roles";

async function getCurrentEmployeeOrRedirect(allowedRoles: AppRole[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  const user = await getUserFromToken(token);

  if (!user) {
    redirect("/login");
  }

  if (!roleCanAccess(user.role, allowedRoles)) {
    redirect(getDefaultPathForRole(user.role));
  }

  return user;
}

export async function getCurrentAdminOrRedirect() {
  return getCurrentEmployeeOrRedirect(["ADMIN"]);
}

export async function getCurrentReservationsUserOrRedirect() {
  return getCurrentEmployeeOrRedirect(["ADMIN", "SECRETARY"]);
}

export async function getCurrentDriverOrRedirect() {
  return getCurrentEmployeeOrRedirect(["DRIVER"]);
}
