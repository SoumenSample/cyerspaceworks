import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";

export default async function DashboardIndexPage() {
  const session = await requireAuth();

  if (session.user.role === "admin") {
    redirect("/dashboard/admin");
  }

  if (session.user.role === "employee") {
    redirect("/dashboard/employee");
  }

  redirect("/dashboard/client");
}
