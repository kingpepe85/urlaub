"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultTemplates } from "@/lib/templates";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const name = formData.get("name") as string;
  const hrEmail = formData.get("hrEmail") as string;
  const urlaubsanspruchJahr = parseInt(formData.get("urlaubsanspruchJahr") as string);
  const kinderkrankentageJahr = parseInt(formData.get("kinderkrankentageJahr") as string);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, hrEmail, urlaubsanspruchJahr, kinderkrankentageJahr },
  });

  revalidatePath("/einstellungen");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function upsertResturlaub(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const jahr = parseInt(formData.get("jahr") as string);
  const tage = parseInt(formData.get("tage") as string);

  await prisma.resturlaub.upsert({
    where: { userId_jahr: { userId: session.user.id, jahr } },
    create: { userId: session.user.id, jahr, tage },
    update: { tage },
  });

  revalidatePath("/einstellungen");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteResturlaub(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const resturlaub = await prisma.resturlaub.findUnique({ where: { id } });
  if (!resturlaub || resturlaub.userId !== session.user.id) throw new Error("Nicht gefunden");

  await prisma.resturlaub.delete({ where: { id } });

  revalidatePath("/einstellungen");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateVorlage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const typ = formData.get("typ") as string;
  const betreff = formData.get("betreff") as string;
  const inhalt = formData.get("inhalt") as string;

  await prisma.vorlage.upsert({
    where: { userId_typ: { userId: session.user.id, typ } },
    create: { userId: session.user.id, typ, betreff, inhalt },
    update: { betreff, inhalt },
  });

  revalidatePath("/einstellungen");
  return { success: true };
}

export async function resetVorlage(typ: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const defaults = getDefaultTemplates();
  const defaultTemplate = defaults.find((t) => t.typ === typ);
  if (!defaultTemplate) throw new Error("Vorlage nicht gefunden");

  await prisma.vorlage.upsert({
    where: { userId_typ: { userId: session.user.id, typ } },
    create: { userId: session.user.id, ...defaultTemplate },
    update: { betreff: defaultTemplate.betreff, inhalt: defaultTemplate.inhalt },
  });

  revalidatePath("/einstellungen");
  return { success: true };
}

export async function updateSmtp(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const smtpHost = (formData.get("smtpHost") as string) || null;
  const smtpPort = formData.get("smtpPort") ? parseInt(formData.get("smtpPort") as string) : null;
  const smtpUser = (formData.get("smtpUser") as string) || null;
  const smtpPassword = (formData.get("smtpPassword") as string) || null;
  const smtpFrom = (formData.get("smtpFrom") as string) || null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { smtpHost, smtpPort, smtpUser, smtpPassword, smtpFrom },
  });

  revalidatePath("/einstellungen");
  return { success: true };
}
