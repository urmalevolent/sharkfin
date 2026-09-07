import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Selamat datang, {session.user.name} 👋
            </h1>

            <p className="mt-2 text-muted-foreground">
              Kamu berhasil login ke SharkFin.
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="mt-8 rounded-lg border p-6">
          <h2 className="font-semibold">
            Session User
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong>ID:</strong>{" "}
              {session.user.id}
            </p>

            <p>
              <strong>Nama:</strong>{" "}
              {session.user.name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {session.user.email}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}