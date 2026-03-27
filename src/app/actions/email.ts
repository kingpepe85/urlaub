"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { revalidatePath } from "next/cache";

export async function sendEmail(absenceId: string, subject: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("User nicht gefunden");

  if (!user.smtpHost || !user.smtpUser || !user.smtpPassword) {
    throw new Error("SMTP nicht konfiguriert");
  }

  const transporter = nodemailer.createTransport({
    host: user.smtpHost,
    port: user.smtpPort || 587,
    secure: (user.smtpPort || 587) === 465,
    auth: {
      user: user.smtpUser,
      pass: user.smtpPassword,
    },
  });

  await transporter.sendMail({
    from: user.smtpFrom || user.smtpUser,
    to: user.hrEmail,
    subject,
    text: body,
  });

  await prisma.abwesenheit.update({
    where: { id: absenceId },
    data: { status: "beantragt" },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function sendTestEmail() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("User nicht gefunden");

  if (!user.smtpHost || !user.smtpUser || !user.smtpPassword) {
    throw new Error("SMTP nicht konfiguriert");
  }

  const transporter = nodemailer.createTransport({
    host: user.smtpHost,
    port: user.smtpPort || 587,
    secure: (user.smtpPort || 587) === 465,
    auth: {
      user: user.smtpUser,
      pass: user.smtpPassword,
    },
  });

  await transporter.sendMail({
    from: user.smtpFrom || user.smtpUser,
    to: user.email,
    subject: "Abwesenheitsmanager - Testmail",
    text: "Dies ist eine Testmail vom Abwesenheitsmanager. Ihr SMTP-Versand funktioniert!",
  });

  return { success: true };
}
