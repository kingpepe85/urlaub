export function calculateWorkdays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatDateISO(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function getAbsenceTypeLabel(typ: string): string {
  const labels: Record<string, string> = {
    bezahlter_urlaub: "Bezahlter Urlaub",
    freizeitausgleich: "Freizeitausgleich",
    sonderurlaub: "Sonderurlaub",
    unbezahlter_urlaub: "Unbezahlter Urlaub",
    krank: "Krankmeldung",
    kindkrank: "Kinderkrankmeldung",
  };
  return labels[typ] || typ;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    geplant: "Geplant",
    entwurf: "Entwurf",
    beantragt: "Beantragt",
    genehmigt: "Genehmigt",
    abgelehnt: "Abgelehnt",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    geplant: "bg-blue-100 text-blue-800",
    entwurf: "bg-gray-100 text-gray-800",
    beantragt: "bg-yellow-100 text-yellow-800",
    genehmigt: "bg-green-100 text-green-800",
    abgelehnt: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function isUrlaubTyp(typ: string): boolean {
  return ["bezahlter_urlaub", "freizeitausgleich", "sonderurlaub", "unbezahlter_urlaub"].includes(typ);
}
