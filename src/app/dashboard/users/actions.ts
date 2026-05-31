"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { appRoles } from "@/lib/permissions/access";
import { requireRole } from "@/lib/permissions/roles";
import { passwordSchema } from "@/lib/security/password";

const roleSchema = z.enum(appRoles);

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  role: roleSchema,
});

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: roleSchema,
});

const deleteUserSchema = z.object({
  userId: z.string().min(1),
});

function redirectWithMessage(type: "error" | "success", code: string): never {
  redirect(`/dashboard/users?${type}=${code}`);
}

export async function createUser(formData: FormData) {
  const admin = await requireRole(["ADMIN"]);
  const parsed = createUserSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithMessage("error", "invalid-user");
  }

  const { name, email, password, role } = parsed.data;
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    redirectWithMessage("error", "duplicate-email");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "User Created",
      description: `${admin.email} created ${email} with the ${role} role.`,
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/users");
  redirectWithMessage("success", "user-created");
}

export async function updateUserRole(formData: FormData) {
  const admin = await requireRole(["ADMIN"]);
  const parsed = updateRoleSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithMessage("error", "invalid-role");
  }

  const { userId, role } = parsed.data;

  if (userId === admin.id && role !== "ADMIN") {
    redirectWithMessage("error", "self-role");
  }

  const targetUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
    select: {
      email: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "Role Updated",
      description: `${admin.email} changed ${targetUser.email} to ${role}.`,
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/users");
  redirectWithMessage("success", "role-updated");
}

export async function deleteUser(formData: FormData) {
  const admin = await requireRole(["ADMIN"]);
  const parsed = deleteUserSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithMessage("error", "invalid-user");
  }

  const { userId } = parsed.data;

  if (userId === admin.id) {
    redirectWithMessage("error", "self-delete");
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
    },
  });

  if (!targetUser) {
    redirectWithMessage("error", "missing-user");
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "User Deleted",
      description: `${admin.email} deleted ${targetUser.email}.`,
      userId: admin.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/users");
  redirectWithMessage("success", "user-deleted");
}
