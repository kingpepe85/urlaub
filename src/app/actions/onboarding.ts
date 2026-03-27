"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultTemplates } from "@/lib/templates";

export async function completeOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const urlaubsanspruchJahr = parseInt(formData.get("urlaubsanspruchJahr") as string) || 30;
  const kinderkrankentageJahr = parseInt(formData.get("kinderkrankentageJahr") as string) || 15;
  const hrEmail = (formData.get("hrEmail") as string) || "backoffice+hr@byteways.de";

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      urlaubsanspruchJahr,
      kinderkrankentageJahr,
      hrEmail,
      onboardingComplete: true,
    },
  });

  const templates = getDefaultTemplates();
  for (const t of templates) {
    await prisma.vorlage.upsert({
      where: { userId_typ: { userId: session.user.id, typ: t.typ } },
      create: {
        userId: session.user.id,
        typ: t.typ,
        betreff: t.betreff,
        inhalt: t.inhalt,
      },
      update: {},
    });
  }

  return { success: true };
}
