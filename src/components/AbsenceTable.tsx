"use client";

import { deleteAbsence, updateAbsenceStatus } from "@/app/actions/absence";
import { getAbsenceTypeLabel, getStatusLabel, getStatusColor, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Absence {
  id: string;
  typ: string;
  beginn: string;
  ende: string;
  tage: number;
  status: string;
  notiz: string | null;
  nachgetragen: boolean;
}

export default function AbsenceTable({
  abwesenheiten,
  smtpConfigured,
}: {
  abwesenheiten: Absence[];
  smtpConfigured: boolean;
}) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Abwesenheit wirklich löschen?")) return;
    await deleteAbsence(id);
    router.refresh();
  }

  async function handleStatusChange(id: string, status: string) {
    await updateAbsenceStatus(id, status);
    router.refresh();
  }

  if (abwesenheiten.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Keine Abwesenheiten für dieses Jahr erfasst.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Zeitraum</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tage</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {abwesenheiten.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{getAbsenceTypeLabel(a.typ)}</td>
                <td className="px-4 py-3">
                  {formatDate(a.beginn)} – {formatDate(a.ende)}
                </td>
                <td className="px-4 py-3">{a.tage}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      a.status
                    )}`}
                  >
                    {getStatusLabel(a.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Link
                      href={`/neue-abwesenheit/${a.id}`}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                    >
                      Bearbeiten
                    </Link>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 rounded text-red-700"
                    >
                      Löschen
                    </button>
                    <Link
                      href={`/mail-vorschau/${a.id}`}
                      className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 rounded text-blue-700"
                    >
                      Mail
                    </Link>
                    {a.status === "beantragt" && (
                      <button
                        onClick={() => handleStatusChange(a.id, "genehmigt")}
                        className="px-2 py-1 text-xs bg-green-50 hover:bg-green-100 rounded text-green-700"
                      >
                        Genehmigen
                      </button>
                    )}
                    {a.status === "geplant" && (
                      <button
                        onClick={() => handleStatusChange(a.id, "entwurf")}
                        className="px-2 py-1 text-xs bg-yellow-50 hover:bg-yellow-100 rounded text-yellow-700"
                      >
                        Beantragen
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
