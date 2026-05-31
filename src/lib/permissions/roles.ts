import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canAccess, type AppRole } from "@/lib/permissions/access";

export { appRoles, canAccess, dashboardRoutes, roleLabels, type AppRole } from "@/lib/permissions/access";

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

export async function requireRole(allowedRoles: AppRole[]) {
  const user = await requireUser();

  if (!canAccess(user.role, allowedRoles)) {
    redirect("/unauthorized");
  }

  return user;
}
