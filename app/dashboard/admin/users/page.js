"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");

  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // LOAD USERS
  // =========================
  async function loadUsers() {
    try {
      setLoadingUsers(true);

      const response = await fetch("/api/users", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load users");
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================
  // CREATE USER
  // =========================
  async function handleSubmit(event) {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setMessage("User created successfully.");

      // reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("client");

      loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // =========================
  // DELETE USER
  // =========================
  async function handleDelete(userId) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setMessage("User deleted successfully.");
      loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
      {/* ========================= CREATE USER ========================= */}
      <Card>
        <CardHeader>
          <CardTitle>Create User</CardTitle>
          <CardDescription>
            Only client and employee roles can be created.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Temporary Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div>
              <Label>Role</Label>
              <select
                className="h-10 w-full rounded-md border border-cyan-500/30 bg-black/60 px-3 text-sm text-cyan-100"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="client">Client</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            {message && (
              <p className="text-sm text-emerald-400">{message}</p>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ========================= USERS TABLE ========================= */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage users, roles, and status.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loadingUsers ? (
            <p className="text-gray-400">Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-cyan-500/20 text-cyan-200">
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-cyan-500/10"
                    >
                      <td className="py-2">{user.name}</td>
                      <td className="py-2">{user.email}</td>
                      <td className="py-2 uppercase">{user.role}</td>
                      <td className="py-2">
                        {user.isActive ? "Active" : "Disabled"}
                      </td>

                      <td className="py-2 text-right">
                        {/* prevent deleting admin */}
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-400 hover:text-red-600 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <p className="text-gray-400 mt-3">No users found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}