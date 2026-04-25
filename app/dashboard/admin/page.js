import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireRole("admin");

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {/* <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>Plan projects, assign employees, and break work into task checkpoints.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/projects" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            Open Project Manager
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Studio</CardTitle>
          <CardDescription>Create bill and invoice templates for client accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/admin/billing" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            Open Billing
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Control</CardTitle>
          <CardDescription>Create and manage client and employee accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/admin/users" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            Open User Management
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Model</CardTitle>
          <CardDescription>No public signup is enabled in this system.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-cyan-100/80">
            All accounts are provisioned by admin to keep role assignments controlled.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <CardDescription>View quick enquiries and add leads manually.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/admin/leads" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            Open Leads
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>Manage clients, convert leads to clients, and track validity periods.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/admin/clients" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            Open Clients
          </Link>
        </CardContent>
      </Card> */}
    </div>
  );
}
