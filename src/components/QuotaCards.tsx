import Link from "next/link";

interface UrlaubQuota {
  anspruchGesamt: number;
  resturlaubTage: number;
  genommen: number;
  beantragt: number;
  geplant: number;
  rest: number;
}

interface KinderkrankQuota {
  anspruchGesamt: number;
  genommen: number;
  rest: number;
}

export default function QuotaCards({
  urlaubQuota,
  kinderkrankQuota,
  resturlaubVorjahr,
  vorjahr,
}: {
  urlaubQuota: UrlaubQuota;
  kinderkrankQuota: KinderkrankQuota;
  resturlaubVorjahr: number;
  vorjahr: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Urlaub */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Urlaub
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Anspruch gesamt</span>
            <span className="font-semibold">{urlaubQuota.anspruchGesamt} Tage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bereits genommen</span>
            <span className="font-semibold text-green-700">{urlaubQuota.genommen} Tage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Aktuell beantragt</span>
            <span className="font-semibold text-yellow-700">{urlaubQuota.beantragt} Tage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Geplant</span>
            <span className="font-semibold text-blue-700">{urlaubQuota.geplant} Tage</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="text-gray-800 font-medium">Verbleibend</span>
            <span className="font-bold text-blue-600">{urlaubQuota.rest} Tage</span>
          </div>
        </div>
      </div>

      {/* Kinderkrankentage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Kinderkrankentage
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Anspruch gesamt</span>
            <span className="font-semibold">{kinderkrankQuota.anspruchGesamt} Tage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bereits genommen</span>
            <span className="font-semibold text-orange-700">{kinderkrankQuota.genommen} Tage</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="text-gray-800 font-medium">Verbleibend</span>
            <span className="font-bold text-orange-600">{kinderkrankQuota.rest} Tage</span>
          </div>
        </div>
      </div>

      {/* Resturlaub */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Resturlaub
        </h3>
        <div className="space-y-2 text-sm">
          {resturlaubVorjahr > 0 ? (
            <div className="flex justify-between">
              <span className="text-gray-600">Übertrag aus {vorjahr}</span>
              <span className="font-semibold">{resturlaubVorjahr} Tage</span>
            </div>
          ) : (
            <p className="text-gray-500">Kein Resturlaub eingetragen</p>
          )}
          <div className="pt-2">
            <Link
              href="/einstellungen"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Verwalten →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
