import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EmployeeDashboardPage() {
  const session = await requireRole("employee");

  return (
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
  );
}
