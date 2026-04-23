import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import LogoutButton from "@/components/dashboard/LogoutButton";

export default async function DashboardLayout({ children }) {
  const session = await requireAuth();

  return (
    <section className="min-h-screen bg-black pt-28 text-cyan-100">
      <div className="mx-auto w-full max-w-6xl px-4 pb-12">
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Secure Dashboard</p>
            <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
            <p className="text-sm text-cyan-100/70">Role: {session.user.role}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard" className="rounded-md border border-cyan-500/30 px-3 py-2 text-sm hover:bg-cyan-500/10">
              Home
            </Link>
            {session.user.role === "admin" ? (
              <Link href="/dashboard/admin/users" className="rounded-md border border-cyan-500/30 px-3 py-2 text-sm hover:bg-cyan-500/10">
                Manage Users
              </Link>
            ) : null}
            <LogoutButton />
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}
