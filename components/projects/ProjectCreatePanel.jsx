"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function createEmptyTask() {
  return {
    title: "",
    description: "",
    subtasks: [""],
  };
}

function flattenUsers(users = [], role) {
  return users.filter((user) => user.role === role);
}

function buildFormFromProject(project) {
  return {
    title: project?.title || "",
    description: project?.description || "",
    clientId: project?.client?._id || project?.client?.id || project?.client || "",
    deadline: project?.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : "",
    priority: project?.priority || "medium",
    status: project?.status || "planning",
    tags: Array.isArray(project?.tags) ? project.tags.join(", ") : "",
    tasks: [createEmptyTask()],
  };
}

export default function ProjectCreatePanel({
  users = [],
  initialProject = null,
  onSaved,
  onCancel,
  mode = "create",
  showTaskOutline = true,
}) {
  const employees = useMemo(() => flattenUsers(users, "employee"), [users]);
  const clients = useMemo(() => flattenUsers(users, "client"), [users]);

  const [form, setForm] = useState(() => buildFormFromProject(initialProject));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState(() =>
    Array.isArray(initialProject?.assignedEmployees)
      ? initialProject.assignedEmployees.map((employee) => employee?._id || employee?.id || employee).filter(Boolean)
      : []
  );

  useEffect(() => {
    setForm(buildFormFromProject(initialProject));
    setSelectedEmployeeIds(
      Array.isArray(initialProject?.assignedEmployees)
        ? initialProject.assignedEmployees.map((employee) => employee?._id || employee?.id || employee).filter(Boolean)
        : []
    );
    setMessage("");
    setError("");
  }, [initialProject]);

  function updateTask(index, key, value) {
    setForm((current) => ({
      ...current,
      tasks: current.tasks.map((task, taskIndex) => (taskIndex === index ? { ...task, [key]: value } : task)),
    }));
  }

  function updateSubtask(taskIndex, subtaskIndex, value) {
    setForm((current) => ({
      ...current,
      tasks: current.tasks.map((task, index) => {
        if (index !== taskIndex) return task;

        return {
          ...task,
          subtasks: task.subtasks.map((subtask, currentIndex) => (currentIndex === subtaskIndex ? value : subtask)),
        };
      }),
    }));
  }

  function toggleEmployee(employeeId) {
    setSelectedEmployeeIds((current) =>
      current.includes(employeeId) ? current.filter((id) => id !== employeeId) : [...current, employeeId]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        title: form.title,
        description: form.description,
        clientId: form.clientId || null,
        assignedEmployeeIds: selectedEmployeeIds,
        deadline: form.deadline,
        priority: form.priority,
        status: form.status,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        ...(mode === "create"
          ? {
              tasks: form.tasks
                .filter((task) => task.title.trim())
                .map((task) => ({
                  title: task.title,
                  description: task.description,
                  subtasks: task.subtasks
                    .map((subtask) => subtask.trim())
                    .filter(Boolean)
                    .map((subtask) => ({ title: subtask })),
                })),
            }
          : {}),
      };

      const response = await fetch(mode === "edit" ? `/api/projects/${initialProject?._id}` : "/api/projects", {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (mode === "edit" ? "Failed to update project" : "Failed to create project"));
      }

      if (mode === "create") {
        setForm(buildFormFromProject(null));
        setSelectedEmployeeIds([]);
      }

      setMessage(mode === "edit" ? "Project updated successfully." : "Project created successfully.");
      onSaved?.(data.project);
    } catch (submitError) {
      setError(submitError.message || (mode === "edit" ? "Failed to update project" : "Failed to create project"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-cyan-400/20 bg-black/55">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>{mode === "edit" ? "Edit Project" : "Create Project"}</CardTitle>
          <CardDescription>
            {mode === "edit"
              ? "Update project details, assignees, status, priority, and deadline."
              : "Define project metadata, choose one or more employees, and add the first task block."}
          </CardDescription>
        </div>

        <Button type="button" variant="ghost" onClick={onCancel}>
          Close
        </Button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Project title"
              className="h-11 rounded-md border border-cyan-500/20 bg-black/40 px-3 text-sm text-cyan-50 outline-none placeholder:text-cyan-100/35"
              required
            />

            <input
              type="date"
              value={form.deadline}
              onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))}
              className="h-11 rounded-md border border-cyan-500/20 bg-black/40 px-3 text-sm text-cyan-50 outline-none"
              required
            />

            <select
              value={form.priority}
              onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
              className="h-11 rounded-md border border-cyan-500/20 bg-black/40 px-3 text-sm text-cyan-50 outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              className="h-11 rounded-md border border-cyan-500/20 bg-black/40 px-3 text-sm text-cyan-50 outline-none"
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In progress</option>
              <option value="at-risk">At risk</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            rows={4}
            placeholder="Project description"
            className="w-full rounded-md border border-cyan-500/20 bg-black/40 px-3 py-2 text-sm text-cyan-50 outline-none placeholder:text-cyan-100/35"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={form.clientId}
              onChange={(event) => setForm((current) => ({ ...current, clientId: event.target.value }))}
              className="h-11 rounded-md border border-cyan-500/20 bg-black/40 px-3 text-sm text-cyan-50 outline-none"
            >
              <option value="">No client assigned</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>

            <div className="rounded-md border border-cyan-500/20 bg-black/40 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-cyan-100/80">Assign employees</p>
                <p className="text-xs text-cyan-100/45">{selectedEmployeeIds.length} selected</p>
              </div>

              <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                {employees.length ? (
                  employees.map((employee) => {
                    const checked = selectedEmployeeIds.includes(employee._id);

                    return (
                      <label
                        key={employee._id}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          checked
                            ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-50"
                            : "border-cyan-500/10 bg-black/20 text-cyan-100/75 hover:bg-black/30"
                        }`}
                      >
                        <span>
                          <span className="block font-medium">{employee.name}</span>
                          <span className="block text-xs text-cyan-100/45">{employee.email}</span>
                        </span>

                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEmployee(employee._id)}
                          className="h-4 w-4 rounded border-cyan-400/40 bg-black/40 text-cyan-400"
                        />
                      </label>
                    );
                  })
                ) : (
                  <p className="text-sm text-cyan-100/55">No employees available.</p>
                )}
              </div>
            </div>
          </div>

          <input
            value={form.tags}
            onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
            placeholder="Tags: Research, Design, Launch"
            className="h-11 w-full rounded-md border border-cyan-500/20 bg-black/40 px-3 text-sm text-cyan-50 outline-none placeholder:text-cyan-100/35"
          />

          {showTaskOutline ? (
            <div className="space-y-4 rounded-2xl border border-cyan-500/10 bg-black/30 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-cyan-50">Task outline</h4>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm((current) => ({ ...current, tasks: [...current.tasks, createEmptyTask()] }))}
                >
                  Add task
                </Button>
              </div>

              <div className="space-y-4">
                {form.tasks.map((task, taskIndex) => (
                  <div key={taskIndex} className="space-y-3 rounded-xl border border-cyan-500/10 bg-black/35 p-3">
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <input
                        value={task.title}
                        onChange={(event) => updateTask(taskIndex, "title", event.target.value)}
                        placeholder={`Task ${taskIndex + 1}`}
                        className="h-10 rounded-md border border-cyan-500/20 bg-black/40 px-3 text-sm text-cyan-50 outline-none placeholder:text-cyan-100/30"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            tasks: current.tasks.filter((_, index) => index !== taskIndex),
                          }))
                        }
                        disabled={form.tasks.length === 1}
                      >
                        Remove
                      </Button>
                    </div>

                    <textarea
                      value={task.description}
                      onChange={(event) => updateTask(taskIndex, "description", event.target.value)}
                      rows={2}
                      placeholder="Task description"
                      className="w-full rounded-md border border-cyan-500/20 bg-black/40 px-3 py-2 text-sm text-cyan-50 outline-none placeholder:text-cyan-100/30"
                    />

                    <div className="space-y-2 pl-1">
                      <div className="text-xs uppercase tracking-[0.18em] text-cyan-100/45">Subtasks</div>
                      {task.subtasks.map((subtask, subtaskIndex) => (
                        <div key={subtaskIndex} className="grid gap-2 md:grid-cols-[1fr_auto]">
                          <input
                            value={subtask}
                            onChange={(event) => updateSubtask(taskIndex, subtaskIndex, event.target.value)}
                            placeholder={`Subtask ${subtaskIndex + 1}`}
                            className="h-10 rounded-md border border-cyan-500/20 bg-black/40 px-3 text-sm text-cyan-50 outline-none placeholder:text-cyan-100/30"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                tasks: current.tasks.map((item, index) => {
                                  if (index !== taskIndex) return item;

                                  return {
                                    ...item,
                                    subtasks: item.subtasks.filter((_, currentIndex) => currentIndex !== subtaskIndex),
                                  };
                                }),
                              }))
                            }
                            disabled={task.subtasks.length === 1}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            tasks: current.tasks.map((item, index) => {
                              if (index !== taskIndex) return item;

                              return {
                                ...item,
                                subtasks: [...item.subtasks, ""],
                              };
                            }),
                          }))
                        }
                      >
                        Add subtask
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? (mode === "edit" ? "Saving project..." : "Creating project...") : mode === "edit" ? "Save project" : "Create project"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}