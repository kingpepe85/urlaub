"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAbsenceTypeLabel, getStatusLabel, formatDate } from "@/lib/utils";

interface Absence {
  id: string;
  typ: string;
  beginn: string;
  ende: string;
  tage: number;
  status: string;
}

function getCalendarColor(absence: Absence): string {
  if (absence.typ === "krank") return "bg-red-200 text-red-900 border-red-300";
  if (absence.typ === "kindkrank") return "bg-orange-200 text-orange-900 border-orange-300";
  if (absence.status === "geplant") return "bg-blue-100 text-blue-800 border-blue-300 border-dashed";
  return "bg-blue-200 text-blue-900 border-blue-300";
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function Calendar({ abwesenheiten }: { abwesenheiten: Absence[] }) {
  const router = useRouter();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const [dragStart, setDragStart] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  function getAbsencesForDay(day: number): Absence[] {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(12, 0, 0, 0);
    return abwesenheiten.filter((a) => {
      const start = new Date(a.beginn);
      start.setHours(0, 0, 0, 0);
      const end = new Date(a.ende);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });
  }

  function handleDayClick(day: number) {
    const absences = getAbsencesForDay(day);
    if (absences.length > 0) {
      setSelectedAbsence(absences[0]);
    } else {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (dragStart && dragStart !== dateStr) {
        const start = dragStart < dateStr ? dragStart : dateStr;
        const end = dragStart < dateStr ? dateStr : dragStart;
        router.push(`/neue-abwesenheit?beginn=${start}&ende=${end}`);
        setDragStart(null);
      } else {
        router.push(`/neue-abwesenheit?beginn=${dateStr}&ende=${dateStr}`);
      }
    }
  }

  function handleMouseDown(day: number) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const absences = getAbsencesForDay(day);
    if (absences.length === 0) {
      setDragStart(dateStr);
    }
  }

  function handleMouseUp(day: number) {
    if (dragStart) {
      handleDayClick(day);
    }
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-24 bg-gray-50" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const absences = getAbsencesForDay(day);
    const isToday =
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();
    const isWeekend = new Date(currentYear, currentMonth, day).getDay() % 6 === 0;

    cells.push(
      <div
        key={day}
        className={`h-24 border border-gray-100 p-1 cursor-pointer hover:bg-blue-50 transition-colors ${
          isWeekend ? "bg-gray-50" : "bg-white"
        }`}
        onClick={() => handleDayClick(day)}
        onMouseDown={() => handleMouseDown(day)}
        onMouseUp={() => handleMouseUp(day)}
      >
        <div
          className={`text-xs font-medium mb-1 ${
            isToday
              ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
              : "text-gray-700"
          }`}
        >
          {day}
        </div>
        <div className="space-y-0.5 overflow-hidden">
          {absences.slice(0, 2).map((a) => (
            <div
              key={a.id}
              className={`text-[10px] px-1 py-0.5 rounded border truncate ${getCalendarColor(a)}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAbsence(a);
              }}
            >
              {getAbsenceTypeLabel(a.typ)}
            </div>
          ))}
          {absences.length > 2 && (
            <div className="text-[10px] text-gray-500">+{absences.length - 2} mehr</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
        >
          ← Zurück
        </button>
        <h2 className="text-lg font-semibold">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={nextMonth}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
        >
          Weiter →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-gray-50 rounded-t-xl border border-gray-200">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-l border-b border-gray-200 rounded-b-xl overflow-hidden">
        {cells}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 bg-blue-200 border border-blue-300 rounded" />
          <span>Urlaub (genehmigt/beantragt)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 bg-blue-100 border border-blue-300 border-dashed rounded" />
          <span>Urlaub (geplant)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 bg-red-200 border border-red-300 rounded" />
          <span>Krank</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 bg-orange-200 border border-orange-300 rounded" />
          <span>Kindkrank</span>
        </div>
      </div>

      {/* Detail modal */}
      {selectedAbsence && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAbsence(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">{getAbsenceTypeLabel(selectedAbsence.typ)}</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">Zeitraum:</span> {formatDate(selectedAbsence.beginn)} – {formatDate(selectedAbsence.ende)}</div>
              <div><span className="text-gray-500">Tage:</span> {selectedAbsence.tage}</div>
              <div><span className="text-gray-500">Status:</span> {getStatusLabel(selectedAbsence.status)}</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { router.push(`/neue-abwesenheit/${selectedAbsence.id}`); setSelectedAbsence(null); }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Bearbeiten
              </button>
              <button
                onClick={() => setSelectedAbsence(null)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
