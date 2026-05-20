"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { requireRole } from "@/lib/require-role";
import { createUser, deleteUserById, findByEmail, updateUserById } from "@/modules/identity/repositories/user.repository";
import { UserRole } from "@/modules/identity/models/user.model";

const StaffUserSchema = z.object({
  name: z.string().min(3).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["buyer", "organizer", "operator", "admin"]),
});

const StaffUserUpdateSchema = z.object({
  name: z.string().min(3).max(120),
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal("")),
  role: z.enum(["buyer", "organizer", "operator", "admin"]),
});

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithStatus(status: string) {
  redirect(`/admin/usuarios?status=${encodeURIComponent(status)}`);
}

export async function createStaffUserAction(formData: FormData) {
  try {
    await requireRole("admin");
    const parsed = StaffUserSchema.safeParse({
      name: getValue(formData, "name"),
      email: getValue(formData, "email"),
      password: getValue(formData, "password"),
      role: getValue(formData, "role"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos para o funcionario.");
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await findByEmail(email);
    if (existing) {
      throw new ConflictError("Ja existe um usuario com este e-mail.");
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await createUser({
      email,
      name: parsed.data.name,
      passwordHash,
      role: parsed.data.role as UserRole,
    });

    redirectWithStatus("Funcionário criado com sucesso.");
  } catch (error) {
    redirectWithStatus(error instanceof Error ? error.message : "Nao foi possivel criar o funcionario.");
  }
}

export async function updateStaffUserAction(userId: string, formData: FormData) {
  try {
    await requireRole("admin");
    const parsed = StaffUserUpdateSchema.safeParse({
      name: getValue(formData, "name"),
      email: getValue(formData, "email"),
      password: getValue(formData, "password"),
      role: getValue(formData, "role"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos para o funcionario.");
    }

    const existing = await findByEmail(parsed.data.email.toLowerCase());
    if (existing && existing._id !== userId) {
      throw new ConflictError("Ja existe outro usuario com este e-mail.");
    }

    const updateData: Record<string, unknown> = {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role as UserRole,
    };

    if (parsed.data.password) {
      updateData.passwordHash = await bcrypt.hash(parsed.data.password, 12);
    }

    const updated = await updateUserById(userId, updateData);
    if (!updated) {
      throw new NotFoundError("User", userId);
    }

    redirectWithStatus("Funcionário atualizado com sucesso.");
  } catch (error) {
    redirectWithStatus(error instanceof Error ? error.message : "Nao foi possivel atualizar o funcionario.");
  }
}

export async function deleteStaffUserAction(userId: string) {
  try {
    await requireRole("admin");
    const deleted = await deleteUserById(userId);
    if (!deleted) {
      throw new NotFoundError("User", userId);
    }

    redirectWithStatus("Funcionário removido com sucesso.");
  } catch (error) {
    redirectWithStatus(error instanceof Error ? error.message : "Nao foi possivel remover o funcionario.");
  }
}