"use client";

import { completeOnboarding } from "@/app/actions/onboarding";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await completeOnboarding(formData);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-2">Willkommen!</h1>
        <p className="text-gray-600 mb-6">
          Bitte richte dein Profil ein, bevor du loslegst.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urlaubsanspruch pro Jahr (Tage)
            </label>
            <input
              type="number"
              name="urlaubsanspruchJahr"
              defaultValue={30}
              min={0}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kinderkrankentage pro Jahr
            </label>
            <input
              type="number"
              name="kinderkrankentageJahr"
              defaultValue={15}
              min={0}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HR E-Mail-Adresse
            </label>
            <input
              type="email"
              name="hrEmail"
              defaultValue="backoffice+hr@byteways.de"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Wird gespeichert..." : "Einrichtung abschließen"}
          </button>
        </form>
      </div>
    </div>
  );
}
