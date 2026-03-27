import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getUrlaubQuota, getKinderkrankQuota } from "@/lib/quota";
import QuotaCards from "@/components/QuotaCards";
import AbsenceTable from "@/components/AbsenceTable";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const year = new Date().getFullYear();
  const urlaubQuota = await getUrlaubQuota(session.user.id, year);
  const kinderkrankQuota = await getKinderkrankQuota(session.user.id, year);

  const resturlaub = await prisma.resturlaub.findUnique({
    where: { userId_jahr: { userId: session.user.id, jahr: year - 1 } },
  });

  const abwesenheiten = await prisma.abwesenheit.findMany({
    where: {
      userId: session.user.id,
      beginn: { gte: new Date(year, 0, 1) },
      ende: { lte: new Date(year, 11, 31, 23, 59, 59) },
    },
    orderBy: { beginn: "desc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <QuotaCards
        urlaubQuota={urlaubQuota}
        kinderkrankQuota={kinderkrankQuota}
        resturlaubVorjahr={resturlaub?.tage ?? 0}
        vorjahr={year - 1}
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">
          Abwesenheiten {year}
        </h2>
        <AbsenceTable
          abwesenheiten={JSON.parse(JSON.stringify(abwesenheiten))}
          smtpConfigured={!!(user?.smtpHost && user?.smtpUser && user?.smtpPassword)}
        />
      </div>
    </div>
  );
}
