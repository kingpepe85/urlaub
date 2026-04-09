import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getMailTemplateData } from "@/lib/quota";
import { fillTemplate, buildUrlaubsartCheckbox } from "@/lib/templates";
import { formatDate, isUrlaubTyp } from "@/lib/utils";
import MailPreviewClient from "@/components/MailPreview";

export default async function MailVorschauPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const absence = await prisma.abwesenheit.findUnique({ where: { id } });
  if (!absence || absence.userId !== session.user.id) redirect("/dashboard");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const year = new Date(absence.beginn).getFullYear();

  let vorlagenTyp = "krank";
  if (isUrlaubTyp(absence.typ)) vorlagenTyp = "urlaub";
  else if (absence.typ === "kindkrank") vorlagenTyp = "kindkrank";

  const vorlage = await prisma.vorlage.findUnique({
    where: { userId_typ: { userId: session.user.id, typ: vorlagenTyp } },
  });

  if (!vorlage) redirect("/dashboard");

  const quotaData = await getMailTemplateData(session.user.id, id, year);

  const data = {
    beginn: formatDate(absence.beginn),
    ende: formatDate(absence.ende),
    urlaubsanspruch: quotaData.urlaubsanspruch,
    bereits_genommen: quotaData.bereits_genommen,
    neu_beantragt: quotaData.neu_beantragt,
    resturlaub: quotaData.resturlaub,
    urlaubsart: buildUrlaubsartCheckbox(absence.typ),
    kinderkrankentage_gesamt: quotaData.kinderkrankentage_gesamt,
    kinderkrankentage_genommen: quotaData.kinderkrankentage_genommen,
  };

  const filledSubject = fillTemplate(vorlage.betreff, data);
  const filledBody = fillTemplate(vorlage.inhalt, data);

  const smtpConfigured = !!(user.smtpHost && user.smtpUser && user.smtpPassword);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mail-Vorschau</h1>
      <MailPreviewClient
        absenceId={id}
        empfaenger={user.hrEmail}
        betreff={filledSubject}
        body={filledBody}
        smtpConfigured={smtpConfigured}
      />
    </div>
  );
}
