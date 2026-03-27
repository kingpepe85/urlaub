import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AbsenceForm from "@/components/AbsenceForm";

export default async function EditAbwesenheitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const absence = await prisma.abwesenheit.findUnique({
    where: { id },
  });

  if (!absence || absence.userId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Abwesenheit bearbeiten</h1>
      <AbsenceForm absence={JSON.parse(JSON.stringify(absence))} />
    </div>
  );
}
