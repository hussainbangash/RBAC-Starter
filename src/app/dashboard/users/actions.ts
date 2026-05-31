"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { appRoles } from "@/lib/permissions/access";
import { requireRole } from "@/lib/permissions/roles";

const roleSchema = z.enum(appRoles);

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: roleSchema,
});

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: roleSchema,
});

const deleteUserSchema = z.object({
  userId: z.string().min(1),
});

export async function createUser(formData: FormData) {
  const admin = await requireRole(["ADMIN"]);
  const parsed = createUserSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid user form submission."
    );
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
    throw new Error("A user with that email already exists.");
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
}

export async function updateUserRole(formData: FormData) {
  const admin = await requireRole(["ADMIN"]);
  const parsed = updateRoleSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error("Invalid role update submission.");
  }

  const { userId, role } = parsed.data;

  if (userId === admin.id && role !== "ADMIN") {
    throw new Error("Admins cannot remove their own admin role.");
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
}

export async function deleteUser(formData: FormData) {
  const admin = await requireRole(["ADMIN"]);
  const parsed = deleteUserSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error("Invalid delete user submission.");
  }

  const { userId } = parsed.data;

  if (userId === admin.id) {
    throw new Error("Admins cannot delete their own account.");
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
    return;
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
}
