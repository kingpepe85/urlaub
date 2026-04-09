import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user && !user.onboardingComplete) {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    if (currentPath !== "/onboarding") {
      redirect("/onboarding");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-16 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
