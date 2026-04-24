import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const session = await requireRole("client");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Client Workspace</CardTitle>
          <CardDescription>Track your requests and project communication in one place.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-cyan-100/80">
            Signed in as {session.user.email}. Your personalized client modules can be added here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>View only the bills and invoices issued to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/client/billing" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            Open Billing
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Track milestone completion and timeline progress in read-only mode.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/projects" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            Open Project Timeline
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
