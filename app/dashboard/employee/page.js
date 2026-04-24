import { requireRole } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function EmployeeDashboardPage() {
  const session = await requireRole("employee");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Employee Workspace</CardTitle>
          <CardDescription>View assigned tasks and internal operational tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-cyan-100/80">
            Signed in as {session.user.email}. Team workflows and reporting modules can be extended from here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>Check assigned projects and update task completion directly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/projects" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            Open Project Manager
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
