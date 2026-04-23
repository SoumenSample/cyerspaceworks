import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ClientDashboardPage() {
  const session = await requireRole("client");

  return (
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
  );
}
