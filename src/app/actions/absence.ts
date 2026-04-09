"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateWorkdays } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createAbsence(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const typ = formData.get("typ") as string;
  const beginn = new Date(formData.get("beginn") as string);
  const ende = new Date(formData.get("ende") as string);
  const status = formData.get("status") as string;
  const notiz = (formData.get("notiz") as string) || null;
  const nachgetragen = formData.get("nachgetragen") === "true";
  const tage = calculateWorkdays(beginn, ende);

  const absence = await prisma.abwesenheit.create({
    data: {
      userId: session.user.id,
      typ,
      beginn,
      ende,
      tage,
      status,
      notiz,
      nachgetragen,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/kalender");
  return { success: true, id: absence.id };
}

export async function updateAbsence(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const absence = await prisma.abwesenheit.findUnique({ where: { id } });
  if (!absence || absence.userId !== session.user.id) throw new Error("Nicht gefunden");

  const typ = formData.get("typ") as string;
  const beginn = new Date(formData.get("beginn") as string);
  const ende = new Date(formData.get("ende") as string);
  const status = formData.get("status") as string;
  const notiz = (formData.get("notiz") as string) || null;
  const nachgetragen = formData.get("nachgetragen") === "true";
  const tage = calculateWorkdays(beginn, ende);

  await prisma.abwesenheit.update({
    where: { id },
    data: { typ, beginn, ende, tage, status, notiz, nachgetragen },
  });

  revalidatePath("/dashboard");
  revalidatePath("/kalender");
  return { success: true, id };
}

export async function deleteAbsence(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const absence = await prisma.abwesenheit.findUnique({ where: { id } });
  if (!absence || absence.userId !== session.user.id) throw new Error("Nicht gefunden");

  await prisma.abwesenheit.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/kalender");
  return { success: true };
}

export async function updateAbsenceStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const absence = await prisma.abwesenheit.findUnique({ where: { id } });
  if (!absence || absence.userId !== session.user.id) throw new Error("Nicht gefunden");

  await prisma.abwesenheit.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/dashboard");
  revalidatePath("/kalender");
  return { success: true };
}
