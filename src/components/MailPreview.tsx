"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmail } from "@/app/actions/email";

export default function MailPreview({
  absenceId,
  empfaenger,
  betreff,
  body,
  smtpConfigured,
}: {
  absenceId: string;
  empfaenger: string;
  betreff: string;
  body: string;
  smtpConfigured: boolean;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCopy() {
    const text = `An: ${empfaenger}\nBetreff: ${betreff}\n\n${body}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleMailto() {
    const mailto = `mailto:${encodeURIComponent(empfaenger)}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(body)}`;
    window.open(mailto);
  }

  async function handleSend() {
    setSending(true);
    setMessage("");
    try {
      await sendEmail(absenceId, betreff, body);
      setMessage("E-Mail erfolgreich gesendet! Status auf 'beantragt' gesetzt.");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      setMessage(`Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`);
    }
    setSending(false);
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Empfänger</label>
          <div className="mt-1 text-sm font-medium">{empfaenger}</div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Betreff</label>
          <div className="mt-1 text-sm font-medium">{betreff}</div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Nachricht</label>
          <div className="mt-1 bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono border border-gray-200">
            {body}
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.startsWith("Fehler")
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
          >
            {copied ? "Kopiert!" : "In Zwischenablage kopieren"}
          </button>
          <button
            onClick={handleMailto}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-sm"
          >
            In Mail-App öffnen
          </button>
          {smtpConfigured && (
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
            >
              {sending ? "Wird gesendet..." : "Per Mail senden"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
