"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LeadsClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    services: "",
    requirement: "",
    budget: "",
  });

  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const serviceListPreview = useMemo(() => {
    return formData.services
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [formData.services]);

  async function loadLeads() {
    try {
      setLoadingLeads(true);
      setError("");

      const response = await fetch("/api/leads", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load leads");
      }

      setLeads(data.leads || []);
    } catch (err) {
      setError(err.message || "Failed to load leads");
    } finally {
      setLoadingLeads(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  function onFieldChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const services = formData.services
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (services.length === 0) {
      setError("Please provide at least one service.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          services,
          source: "manual-admin",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create lead");
      }

      setMessage("Lead added successfully.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        services: "",
        requirement: "",
        budget: "",
      });

      await loadLeads();
    } catch (err) {
      setError(err.message || "Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <Card>
        <CardHeader>
          <CardTitle>Add Lead</CardTitle>
          <CardDescription>Add a lead manually from calls or offline references.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input name="name" value={formData.name} onChange={onFieldChange} required />
            </div>

            <div>
              <Label>Email</Label>
              <Input name="email" type="email" value={formData.email} onChange={onFieldChange} required />
            </div>

            <div>
              <Label>Phone</Label>
              <Input name="phone" value={formData.phone} onChange={onFieldChange} required />
            </div>

            <div>
              <Label>Services (comma separated)</Label>
              <Input
                name="services"
                value={formData.services}
                onChange={onFieldChange}
                placeholder="Web Development, UI/UX Design"
                required
              />
              {serviceListPreview.length > 0 && (
                <p className="mt-2 text-xs text-cyan-200/80">Selected: {serviceListPreview.join(", ")}</p>
              )}
            </div>

            <div>
              <Label>Budget</Label>
              <Input name="budget" value={formData.budget} onChange={onFieldChange} placeholder="Optional" />
            </div>

            <div>
              <Label>Requirement</Label>
              <textarea
                name="requirement"
                value={formData.requirement}
                onChange={onFieldChange}
                rows={4}
                className="w-full rounded-md border border-cyan-500/30 bg-black/60 px-3 py-2 text-sm text-cyan-100"
                placeholder="Optional details"
              />
            </div>

            {message && <p className="text-sm text-emerald-400">{message}</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Lead"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <CardDescription>Quick enquiry and manually added leads appear here.</CardDescription>
        </CardHeader>

        <CardContent>
          {loadingLeads ? (
            <p className="text-gray-400">Loading leads...</p>
          ) : leads.length === 0 ? (
            <p className="text-gray-400">No leads found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-cyan-500/20 text-cyan-200">
                    <th className="py-2">Name</th>
                    <th className="py-2">Contact</th>
                    <th className="py-2">Services</th>
                    <th className="py-2">Source</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="border-b border-cyan-500/10 align-top">
                      <td className="py-2">
                        <p>{lead.name}</p>
                        <p className="text-xs text-cyan-100/70">{lead.budget ? `Budget: ${lead.budget}` : "Budget: N/A"}</p>
                      </td>
                      <td className="py-2">
                        <p>{lead.email}</p>
                        <p className="text-xs text-cyan-100/70">{lead.phone}</p>
                      </td>
                      <td className="py-2">
                        {(lead.services || []).join(", ") || "N/A"}
                        {lead.requirement ? (
                          <p className="mt-1 text-xs text-cyan-100/70">Req: {lead.requirement}</p>
                        ) : null}
                      </td>
                      <td className="py-2 uppercase">{lead.source}</td>
                      <td className="py-2">{new Date(lead.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
