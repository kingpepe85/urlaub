"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAbsence, updateAbsence } from "@/app/actions/absence";
import { calculateWorkdays, formatDateISO } from "@/lib/utils";

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

type Kategorie = "urlaub" | "krank" | "kindkrank";

const URLAUB_UNTERARTEN = [
  { value: "bezahlter_urlaub", label: "Bezahlter Urlaub" },
  { value: "freizeitausgleich", label: "Freizeitausgleich" },
  { value: "sonderurlaub", label: "Sonderurlaub" },
  { value: "unbezahlter_urlaub", label: "Unbezahlter Urlaub" },
];

function getKategorieFromTyp(typ: string): Kategorie {
  if (typ === "krank") return "krank";
  if (typ === "kindkrank") return "kindkrank";
  return "urlaub";
}

export default function AbsenceForm({
  absence,
  defaultBeginn,
  defaultEnde,
}: {
  absence?: Absence;
  defaultBeginn?: string;
  defaultEnde?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [kategorie, setKategorie] = useState<Kategorie>(
    absence ? getKategorieFromTyp(absence.typ) : "urlaub"
  );
  const [unterart, setUnterart] = useState(
    absence && getKategorieFromTyp(absence.typ) === "urlaub" ? absence.typ : "bezahlter_urlaub"
  );
  const [beginn, setBeginn] = useState(
    absence ? formatDateISO(absence.beginn) : defaultBeginn || ""
  );
  const [ende, setEnde] = useState(
    absence ? formatDateISO(absence.ende) : defaultEnde || ""
  );
  const [notiz, setNotiz] = useState(absence?.notiz || "");
  const [nachgetragen, setNachgetragen] = useState(absence?.nachgetragen || false);
  const [arbeitstage, setArbeitstage] = useState(absence?.tage || 0);

  useEffect(() => {
    if (beginn && ende) {
      const days = calculateWorkdays(new Date(beginn), new Date(ende));
      setArbeitstage(days);
    } else {
      setArbeitstage(0);
    }
  }, [beginn, ende]);

  function getTyp(): string {
    if (kategorie === "krank") return "krank";
    if (kategorie === "kindkrank") return "kindkrank";
    return unterart;
  }

  async function handleSubmit(status: string) {
    setLoading(true);
    const formData = new FormData();
    formData.set("typ", getTyp());
    formData.set("beginn", beginn);
    formData.set("ende", ende);
    formData.set("status", status);
    formData.set("notiz", notiz);
    formData.set("nachgetragen", String(nachgetragen));

    let result;
    if (absence) {
      result = await updateAbsence(absence.id, formData);
    } else {
      result = await createAbsence(formData);
    }

    if (status === "entwurf" && result.id) {
      router.push(`/mail-vorschau/${result.id}`);
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Kategorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
          <div className="flex gap-4">
            {[
              { value: "urlaub" as Kategorie, label: "Urlaub" },
              { value: "krank" as Kategorie, label: "Krankmeldung" },
              { value: "kindkrank" as Kategorie, label: "Kinderkrankmeldung" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="kategorie"
                  value={opt.value}
                  checked={kategorie === opt.value}
                  onChange={() => setKategorie(opt.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Unterart (nur bei Urlaub) */}
        {kategorie === "urlaub" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urlaubsart</label>
            <select
              value={unterart}
              onChange={(e) => setUnterart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {URLAUB_UNTERARTEN.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Datum */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beginn</label>
            <input
              type="date"
              value={beginn}
              onChange={(e) => setBeginn(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ende</label>
            <input
              type="date"
              value={ende}
              onChange={(e) => setEnde(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Berechnete Arbeitstage */}
        <div className="bg-blue-50 px-4 py-3 rounded-lg">
          <span className="text-sm text-blue-800">
            Berechnete Arbeitstage: <strong>{arbeitstage}</strong>
          </span>
        </div>

        {/* Nachtrag */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={nachgetragen}
            onChange={(e) => setNachgetragen(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Nachtrag (nachträgliche Erfassung)</span>
        </label>

        {/* Notiz */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notiz (optional)</label>
          <textarea
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {kategorie === "urlaub" && (
            <button
              onClick={() => handleSubmit("geplant")}
              disabled={loading || !beginn || !ende}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 font-medium text-sm"
            >
              Als Planung speichern
            </button>
          )}
          <button
            onClick={() => handleSubmit("entwurf")}
            disabled={loading || !beginn || !ende}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
          >
            Speichern und Mail vorbereiten
          </button>
        </div>
      </div>
    </div>
  );
}
