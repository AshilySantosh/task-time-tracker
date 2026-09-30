"use client";

import { FormEvent, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface DailySummary {
  date: string;
  tasksWorkedOn: number;
  totalTrackedSeconds: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // -------------------------
        // Get logged-in user
        // -------------------------
        const userResponse = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            credentials: "include",
          }
        );

        const userData = await userResponse.json();

        if (!userResponse.ok) {
          setMessage("You are not logged in.");
          return;
        }

        setUser(userData.data.user);

        // -------------------------
        // Get daily summary
        // -------------------------
        const summaryResponse = await fetch(
          "http://localhost:5000/api/dashboard/daily-summary",
          {
            credentials: "include",
          }
        );

        const summaryData = await summaryResponse.json();

        if (summaryResponse.ok) {
          setSummary(summaryData.data);
        }

        // -------------------------
        // Get user's tasks
        // -------------------------
        const tasksResponse = await fetch(
          "http://localhost:5000/api/tasks",
          {
            credentials: "include",
          }
        );

        const tasksData = await tasksResponse.json();

        if (tasksResponse.ok) {
          setTasks(tasksData.data);
        }
      } catch (error) {
        console.error(error);
        setMessage("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // -------------------------
  // Create Task
  // -------------------------
  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();

    if (!taskTitle.trim()) {
      return;
    }

    setCreatingTask(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: taskTitle.trim(),
            description: taskDescription.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create task");
        return;
      }

      // Add newly created task to the UI
      setTasks((currentTasks) => [
        data.data,
        ...currentTasks,
      ]);

      // Reset form
      setTaskTitle("");
      setTaskDescription("");
      setShowCreateForm(false);

      // Refresh dashboard summary
      const summaryResponse = await fetch(
        "http://localhost:5000/api/dashboard/daily-summary",
        {
          credentials: "include",
        }
      );

      const summaryData = await summaryResponse.json();

      if (summaryResponse.ok) {
        setSummary(summaryData.data);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server");
    } finally {
      setCreatingTask(false);
    }
  };

  // -------------------------
// Update Task
// -------------------------
const handleUpdateTask = async (
    taskId: string,
    updates: Partial<Task>
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updates),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Failed to update task");
        return;
      }
  
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? data.data : task
        )
      );
  
      // Refresh summary
      const summaryResponse = await fetch(
        "http://localhost:5000/api/dashboard/daily-summary",
        {
          credentials: "include",
        }
      );
  
      const summaryData = await summaryResponse.json();
  
      if (summaryResponse.ok) {
        setSummary(summaryData.data);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server");
    }
  };
  
  // -------------------------
  // Delete Task
  // -------------------------
  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
  
    if (!confirmed) {
      return;
    }
  
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Failed to delete task");
        return;
      }
  
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
  
      // Refresh summary
      const summaryResponse = await fetch(
        "http://localhost:5000/api/dashboard/daily-summary",
        {
          credentials: "include",
        }
      );
  
      const summaryData = await summaryResponse.json();
  
      if (summaryResponse.ok) {
        setSummary(summaryData.data);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server");
    }
  };



  // -------------------------
  // Loading
  // -------------------------
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-400">
          Loading...
        </p>
      </main>
    );
  }

  // -------------------------
  // Not authenticated
  // -------------------------
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="mb-4 text-slate-300">
            {message}
          </p>

          <a
            href="/login"
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500"
          >
            Go to Login
          </a>
        </div>
      </main>
    );
  }

  // -------------------------
  // Dashboard
  // -------------------------
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <header className="mb-8">
          <p className="text-sm text-slate-400">
            Task & Time Tracker
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Welcome, {user.name} 👋
          </h1>

          <p className="mt-2 text-slate-400">
            {user.email}
          </p>
        </header>

        {/* Summary Cards */}
        <section className="grid gap-4 md:grid-cols-5">

          {/* Tasks Worked On */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Tasks Worked On
            </p>

            <p className="mt-2 text-3xl font-bold">
              {summary?.tasksWorkedOn ?? 0}
            </p>
          </div>

          {/* Total Time */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Time
            </p>

            <p className="mt-2 text-3xl font-bold">
              {Math.floor(
                (summary?.totalTrackedSeconds ?? 0) / 3600
              )}
              h{" "}
              {Math.floor(
                ((summary?.totalTrackedSeconds ?? 0) % 3600) / 60
              )}
              m
            </p>
          </div>

          {/* Completed */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {summary?.completedTasks ?? 0}
            </p>
          </div>

          {/* In Progress */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold">
              {summary?.inProgressTasks ?? 0}
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold">
              {summary?.pendingTasks ?? 0}
            </p>
          </div>

        </section>

        {/* Tasks Section */}
        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          {/* Task Header */}
          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold">
                My Tasks
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Manage your tasks and track your time.
              </p>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
            >
              + New Task
            </button>

          </div>

          {/* Create Task Form */}
          {showCreateForm && (
            <form
              onSubmit={handleCreateTask}
              className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5"
            >
              <h3 className="mb-4 text-lg font-semibold">
                Create Task
              </h3>

              <input
                type="text"
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500"
                required
              />

              <textarea
                placeholder="Description (optional)"
                value={taskDescription}
                onChange={(e) =>
                  setTaskDescription(e.target.value)
                }
                rows={3}
                className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />

              <div className="mt-4 flex gap-3">

                <button
                  type="submit"
                  disabled={creatingTask}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingTask
                    ? "Creating..."
                    : "Create Task"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setTaskTitle("");
                    setTaskDescription("");
                  }}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

              </div>
            </form>
          )}

          {/* Task List */}
          <div className="mt-8 space-y-4">

            {tasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 p-10 text-center">
                <p className="text-slate-400">
                  No tasks yet.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Create your first task to start tracking time.
                </p>
              </div>
            ) : (
                tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                  
                        {/* Task information */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {task.title}
                          </h3>
                  
                          {task.description && (
                            <p className="mt-2 text-sm text-slate-400">
                              {task.description}
                            </p>
                          )}
                        </div>
                  
                        {/* Status */}
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleUpdateTask(task.id, {
                              status: e.target.value as Task["status"],
                            })
                          }
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                        >
                          <option value="PENDING">
                            Pending
                          </option>
                  
                          <option value="IN_PROGRESS">
                            In Progress
                          </option>
                  
                          <option value="COMPLETED">
                            Completed
                          </option>
                        </select>
                  
                      </div>
                  
                      {/* Actions */}
                      <div className="mt-5 flex gap-3">
                  
                        <button
                          onClick={() =>
                            handleUpdateTask(task.id, {
                              title: window.prompt(
                                "Enter new task title:",
                                task.title
                              ) || task.title,
                            })
                          }
                          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                        >
                          Edit
                        </button>
                  
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-lg border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950"
                        >
                          Delete
                        </button>
                  
                      </div>
                    </div>
                  ))
            )}

          </div>

        </section>

      </div>
    </main>
  );
}