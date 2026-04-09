import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsTabs from "@/components/SettingsTabs";

export default async function EinstellungenPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      resturlaube: { orderBy: { jahr: "desc" } },
      vorlagen: true,
    },
  });

  if (!user) redirect("/login");

  const serialized = {
    name: user.name,
    email: user.email,
    hrEmail: user.hrEmail,
    urlaubsanspruchJahr: user.urlaubsanspruchJahr,
    kinderkrankentageJahr: user.kinderkrankentageJahr,
    smtpHost: user.smtpHost || "",
    smtpPort: user.smtpPort || 587,
    smtpUser: user.smtpUser || "",
    smtpPassword: user.smtpPassword || "",
    smtpFrom: user.smtpFrom || "",
    smtpConfigured: !!(user.smtpHost && user.smtpUser && user.smtpPassword),
    resturlaube: user.resturlaube.map((r) => ({
      id: r.id,
      jahr: r.jahr,
      tage: r.tage,
    })),
    vorlagen: user.vorlagen.map((v) => ({
      typ: v.typ,
      betreff: v.betreff,
      inhalt: v.inhalt,
    })),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>
      <SettingsTabs user={serialized} />
    </div>
  );
}
