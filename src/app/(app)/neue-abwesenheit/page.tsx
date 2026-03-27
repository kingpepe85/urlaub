import AbsenceForm from "@/components/AbsenceForm";

export default async function NeueAbwesenheitPage({
  searchParams,
}: {
  searchParams: Promise<{ beginn?: string; ende?: string }>;
}) {
  const params = await searchParams;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Neue Abwesenheit</h1>
      <AbsenceForm defaultBeginn={params.beginn} defaultEnde={params.ende} />
    </div>
  );
}
