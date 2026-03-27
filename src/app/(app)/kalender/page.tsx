import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Calendar from "@/components/Calendar";

export default async function KalenderPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const abwesenheiten = await prisma.abwesenheit.findMany({
    where: { userId: session.user.id },
    orderBy: { beginn: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kalender</h1>
      <Calendar abwesenheiten={JSON.parse(JSON.stringify(abwesenheiten))} />
    </div>
  );
}
