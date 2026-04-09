"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  upsertResturlaub,
  deleteResturlaub,
  updateVorlage,
  resetVorlage,
  updateSmtp,
} from "@/app/actions/settings";
import { sendTestEmail } from "@/app/actions/email";
import { PLACEHOLDER_REFERENCE } from "@/lib/templates";

interface Resturlaub {
  id: string;
  jahr: number;
  tage: number;
}

interface Vorlage {
  typ: string;
  betreff: string;
  inhalt: string;
}

interface UserData {
  name: string;
  email: string;
  hrEmail: string;
  urlaubsanspruchJahr: number;
  kinderkrankentageJahr: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpFrom: string;
  smtpConfigured: boolean;
  resturlaube: Resturlaub[];
  vorlagen: Vorlage[];
}

const VORLAGE_LABELS: Record<string, string> = {
  urlaub: "Urlaub",
  krank: "Krankmeldung",
  kindkrank: "Kinderkrankmeldung",
};

export default function SettingsTabs({ user }: { user: UserData }) {
  const router = useRouter();
  const [tab, setTab] = useState<"profil" | "vorlagen" | "smtp">("profil");
  const [message, setMessage] = useState("");

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  const tabs = [
    { key: "profil" as const, label: "Profil" },
    { key: "vorlagen" as const, label: "Vorlagen" },
    { key: "smtp" as const, label: "E-Mail-Versand" },
  ];

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      {tab === "profil" && <ProfilTab user={user} showMessage={showMessage} router={router} />}
      {tab === "vorlagen" && <VorlagenTab vorlagen={user.vorlagen} showMessage={showMessage} router={router} />}
      {tab === "smtp" && <SmtpTab user={user} showMessage={showMessage} router={router} />}
    </div>
  );
}

function ProfilTab({
  user,
  showMessage,
  router,
}: {
  user: UserData;
  showMessage: (msg: string) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [newJahr, setNewJahr] = useState(new Date().getFullYear() - 1);
  const [newTage, setNewTage] = useState(0);

  async function handleProfileSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateProfile(formData);
    showMessage("Profil gespeichert");
    router.refresh();
  }

  async function handleAddResturlaub() {
    const formData = new FormData();
    formData.set("jahr", String(newJahr));
    formData.set("tage", String(newTage));
    await upsertResturlaub(formData);
    showMessage("Resturlaub gespeichert");
    router.refresh();
  }

  async function handleDeleteResturlaub(id: string) {
    await deleteResturlaub(id);
    showMessage("Resturlaub gelöscht");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Persönliche Daten</h3>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                name="name"
                defaultValue={user.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input
                value={user.email}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HR E-Mail</label>
              <input
                name="hrEmail"
                defaultValue={user.hrEmail}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urlaubsanspruch/Jahr</label>
              <input
                name="urlaubsanspruchJahr"
                type="number"
                defaultValue={user.urlaubsanspruchJahr}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kinderkrankentage/Jahr</label>
              <input
                name="kinderkrankentageJahr"
                type="number"
                defaultValue={user.kinderkrankentageJahr}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            Speichern
          </button>
        </form>
      </div>

      {/* Resturlaub */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Resturlaub aus Vorjahren</h3>
        <p className="text-sm text-gray-500 mb-4">
          Tragen Sie hier ein, wie viele Resturlaubstage aus dem jeweiligen Jahr ins Folgejahr übertragen werden.
        </p>

        {user.resturlaube.length > 0 && (
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-gray-600">Jahr</th>
                <th className="text-left py-2 font-medium text-gray-600">Tage</th>
                <th className="text-left py-2 font-medium text-gray-600">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {user.resturlaube.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2">{r.jahr}</td>
                  <td className="py-2">{r.tage} Tage</td>
                  <td className="py-2">
                    <button
                      onClick={() => handleDeleteResturlaub(r.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jahr</label>
            <input
              type="number"
              value={newJahr}
              onChange={(e) => setNewJahr(parseInt(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tage</label>
            <input
              type="number"
              value={newTage}
              onChange={(e) => setNewTage(parseInt(e.target.value))}
              min={0}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            onClick={handleAddResturlaub}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}

function VorlagenTab({
  vorlagen,
  showMessage,
  router,
}: {
  vorlagen: Vorlage[];
  showMessage: (msg: string) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const typen = ["urlaub", "krank", "kindkrank"];

  async function handleSave(e: React.FormEvent<HTMLFormElement>, typ: string) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("typ", typ);
    await updateVorlage(formData);
    showMessage(`Vorlage "${VORLAGE_LABELS[typ]}" gespeichert`);
    router.refresh();
  }

  async function handleReset(typ: string) {
    if (!confirm("Vorlage auf Standard zurücksetzen?")) return;
    await resetVorlage(typ);
    showMessage(`Vorlage "${VORLAGE_LABELS[typ]}" zurückgesetzt`);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {typen.map((typ) => {
          const vorlage = vorlagen.find((v) => v.typ === typ);
          return (
            <div key={typ} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{VORLAGE_LABELS[typ]}</h3>
                <button
                  onClick={() => handleReset(typ)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Auf Standard zurücksetzen
                </button>
              </div>
              <form onSubmit={(e) => handleSave(e, typ)} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Betreff</label>
                  <input
                    name="betreff"
                    defaultValue={vorlage?.betreff || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inhalt</label>
                  <textarea
                    name="inhalt"
                    defaultValue={vorlage?.inhalt || ""}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  Speichern
                </button>
              </form>
            </div>
          );
        })}
      </div>

      {/* Placeholder reference */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
          <h3 className="text-lg font-semibold mb-4">Platzhalter-Referenz</h3>
          <div className="space-y-3">
            {PLACEHOLDER_REFERENCE.map((p) => (
              <div key={p.placeholder}>
                <code className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                  {p.placeholder}
                </code>
                <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SmtpTab({
  user,
  showMessage,
  router,
}: {
  user: UserData;
  showMessage: (msg: string) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [testing, setTesting] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateSmtp(formData);
    showMessage("SMTP-Einstellungen gespeichert");
    router.refresh();
  }

  async function handleTestMail() {
    setTesting(true);
    try {
      await sendTestEmail();
      showMessage("Testmail erfolgreich gesendet!");
    } catch (err) {
      showMessage(`Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`);
    }
    setTesting(false);
  }

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">SMTP-Konfiguration</h3>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              user.smtpConfigured
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {user.smtpConfigured ? "SMTP konfiguriert" : "Nicht konfiguriert"}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP-Host</label>
            <input
              name="smtpHost"
              defaultValue={user.smtpHost}
              placeholder="z.B. smtp.gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP-Port</label>
            <input
              name="smtpPort"
              type="number"
              defaultValue={user.smtpPort}
              placeholder="587"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP-Benutzer</label>
            <input
              name="smtpUser"
              defaultValue={user.smtpUser}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP-Passwort</label>
            <input
              name="smtpPassword"
              type="password"
              defaultValue={user.smtpPassword}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Absender-Adresse</label>
            <input
              name="smtpFrom"
              type="email"
              defaultValue={user.smtpFrom}
              placeholder="noreply@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              Speichern
            </button>
            {user.smtpConfigured && (
              <button
                type="button"
                onClick={handleTestMail}
                disabled={testing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium text-sm"
              >
                {testing ? "Wird gesendet..." : "Testmail senden"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
