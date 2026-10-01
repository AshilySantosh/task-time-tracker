"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  totalTrackedSeconds?: number;
}

interface TimeLog {
  id: string;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
}

interface WeeklyDay {
  date: string;
  day: string;
  trackedSeconds: number;
}

interface WeeklySummary {
  weekStart: string;
  totalTrackedSeconds: number;
  tasksWorkedOn: number;
  completedTasks: number;
  dailyData: WeeklyDay[];
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStartedAt, setTimerStartedAt] = useState<string | null>(null);
  const [timerLoading, setTimerLoading] = useState(false);

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
const [timeLogs, setTimeLogs] = useState<Record<string, TimeLog[]>>({});

const [weeklySummary, setWeeklySummary] =
  useState<WeeklySummary | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // -------------------------
        // Get logged-in user
        // -------------------------
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/daily-summary`,
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
          {
            credentials: "include",
          }
        );

        const tasksData = await tasksResponse.json();

        if (tasksResponse.ok) {
          const fetchedTasks = tasksData.data as Task[];
        
          const tasksWithTime = await Promise.all(
            fetchedTasks.map(async (task) => {
              const timeResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${task.id}/time`,
                {
                  credentials: "include",
                }
              );
        
              if (!timeResponse.ok) {
                return {
                  ...task,
                  totalTrackedSeconds: 0,
                };
              }
        
              const timeData = await timeResponse.json();
        
              return {
                ...task,
                totalTrackedSeconds: timeData.data.totalSeconds ?? 0,
              };
            })
          );
        
          setTasks(tasksWithTime);


          fetchWeeklySummary();
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

  useEffect(() => {
    if (!timerStartedAt) {
      return;
    }
  
    const interval = setInterval(() => {
      const startedAt = new Date(timerStartedAt).getTime();
      const now = Date.now();
  
      const elapsedSeconds = Math.floor(
        (now - startedAt) / 1000
      );
  
      setTimerSeconds(elapsedSeconds);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [timerStartedAt]);

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
  
    const minutes = Math.floor(
      (seconds % 3600) / 60
    );
  
    const remainingSeconds = seconds % 60;
  
    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
  
    const minutes = Math.floor(
      (seconds % 3600) / 60
    );
  
    const remainingSeconds = seconds % 60;
  
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
  
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
  
    return `${remainingSeconds}s`;
  };

  const formatWeeklyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
  
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
  
    return `${minutes}m`;
  };

  const getMostProductiveDay = () => {
    if (!weeklySummary?.dailyData.length) {
      return null;
    }
  
    return weeklySummary.dailyData.reduce((most, current) =>
      current.trackedSeconds > most.trackedSeconds
        ? current
        : most
    );
  };

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/daily-summary`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
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
          task.id === taskId
            ? {
                ...data.data,
                totalTrackedSeconds: task.totalTrackedSeconds ?? 0,
              }
            : task
        )
      );
  
      // Refresh summary
      const summaryResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/daily-summary`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/daily-summary`,
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

  const handleStartTimer = async (taskId: string) => {
    setTimerLoading(true);
  
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/start`,
        {
          method: "POST",
          credentials: "include",
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Failed to start timer");
        return;
      }
  
      setActiveTaskId(taskId);
      setTimerStartedAt(data.data.startedAt);
      setTimerSeconds(0);
  
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? { ...task, status: "IN_PROGRESS" }
            : task
        )
      );
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server");
    } finally {
      setTimerLoading(false);
    }
  };

  const handleStopTimer = async (taskId: string) => {
    setTimerLoading(true);
  
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/stop`,
        {
          method: "POST",
          credentials: "include",
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Failed to stop timer");
        return;
      }
  
      setActiveTaskId(null);
      setTimerStartedAt(null);
      setTimerSeconds(0);
  
      // Refresh tasks
     // Refresh total tracked time for the stopped task

const timeResponse = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/time`,
  {
    credentials: "include",
  }
);

const timeData = await timeResponse.json();

if (timeResponse.ok) {
  setTasks((currentTasks) =>
    currentTasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            totalTrackedSeconds: timeData.data.totalSeconds ?? 0,
          }
        : task
    )
  );
}
  
      // Refresh summary
      const summaryResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/daily-summary`,
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
      setTimerLoading(false);
    }
  };

  const handleViewTimeLogs = async (taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
      return;
    }
  
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/time-logs`,
        {
          credentials: "include",
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Failed to load time logs");
        return;
      }
  
      setTimeLogs((currentLogs) => ({
        ...currentLogs,
        [taskId]: data.data,
      }));
  
      setExpandedTaskId(taskId);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server");
    }
  };

  const fetchWeeklySummary = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/weekly-summary`,
        {
          credentials: "include",
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error(data.message || "Failed to load weekly summary");
        return;
      }
  
      setWeeklySummary(data.data);
    } catch (error) {
      console.error("Failed to load weekly summary:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
  
      if (!response.ok) {
        alert("Failed to logout");
        return;
      }
  
      router.push("/login");
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
      {activeTaskId && (
  <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2">
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-green-500/30 bg-slate-900/95 px-5 py-4 shadow-2xl shadow-black/40 backdrop-blur-md">
      
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
        </div>

        <div className="min-w-0">
          <p className="text-xs text-slate-400">
            Timer Running
          </p>

          <p className="truncate text-sm font-medium text-white">
            {tasks.find((task) => task.id === activeTaskId)?.title}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="font-mono text-lg font-semibold text-green-400">
          {formatTimer(timerSeconds)}
        </span>

        <button
          onClick={() => handleStopTimer(activeTaskId)}
          disabled={timerLoading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Stop
        </button>
      </div>

    </div>
  </div>
)}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <header className="mb-8 flex items-start justify-between">
  <div>
    <p className="text-sm text-slate-400">
      Task & Time Tracker
    </p>

    <h1 className="mt-1 text-3xl font-bold">
      Welcome, {user.name} 👋
    </h1>

    <p className="mt-2 text-slate-400">
      {user.email}
    </p>
  </div>

  <button
    onClick={handleLogout}
    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
  >
    Logout
  </button>
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

<div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
  <span>Time tracked:</span>

  <span className="font-medium text-slate-200">
    {formatTotalTime(task.totalTrackedSeconds ?? 0)}
  </span>
</div>
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
                      <div className="mt-5 flex flex-wrap gap-3">

  {/* Start / Stop */}
  {activeTaskId === task.id ? (
    <button
      onClick={() => handleStopTimer(task.id)}
      disabled={timerLoading}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
    >
      Stop
    </button>
  ) : (
    <button
      onClick={() => handleStartTimer(task.id)}
      disabled={
        timerLoading ||
        activeTaskId !== null
      }
      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Start
    </button>
  )}

  {/* Current Timer */}
  {activeTaskId === task.id && (
    <span className="rounded-lg bg-slate-800 px-4 py-2 font-mono text-sm text-green-400">
      {formatTimer(timerSeconds)}
    </span>
  )}

  {/* Edit */}
  <button
    onClick={() =>
      handleUpdateTask(task.id, {
        title:
          window.prompt(
            "Enter new task title:",
            task.title
          ) || task.title,
      })
    }
    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
  >
    Edit
  </button>

  {/* Delete */}
  <button
    onClick={() => handleDeleteTask(task.id)}
    className="rounded-lg border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950"
  >
    Delete
  </button>

  {/* Time History */}
  <button
    onClick={() => handleViewTimeLogs(task.id)}
    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
  >
    {expandedTaskId === task.id
      ? "Hide History"
      : "Time History"}
  </button>
</div>

{/* Time History - OUTSIDE the flex row */}
{expandedTaskId === task.id && (
  <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
    <h4 className="mb-3 font-medium text-white">
      Time Sessions
    </h4>

    {timeLogs[task.id]?.length === 0 ? (
      <p className="text-sm text-slate-500">
        No time sessions yet.
      </p>
    ) : (
      <div className="space-y-2">
        {timeLogs[task.id]?.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2 text-sm"
          >
            <div>
              <p className="text-slate-300">
                {new Date(log.startedAt).toLocaleString()}
              </p>

              {log.endedAt && (
                <p className="text-xs text-slate-500">
                  Ended:{" "}
                  {new Date(log.endedAt).toLocaleString()}
                </p>
              )}
            </div>

            <span className="font-mono text-slate-300">
              {log.duration !== null
                ? formatTimer(log.duration)
                : "Running"}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
)}
                    </div>
                  ))
            )}

          </div>

        </section>

        {/* =========================
    Weekly Productivity
========================= */}

{weeklySummary && (
  <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
    {/* Header */}
    <div className="border-b border-slate-800 px-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-xl">
              📊
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Weekly Productivity
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Your time and task activity for this week
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400">
          Week of{" "}
          <span className="font-medium text-slate-200">
            {new Date(
              `${weeklySummary.weekStart}T00:00:00`
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>

    {/* Statistics */}
    <div className="grid gap-4 p-6 sm:grid-cols-3">
      {/* Total Time */}
      <div className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:border-indigo-500/40">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Total Tracked Time
          </p>

          <span className="rounded-lg bg-indigo-500/10 px-2 py-1 text-xs text-indigo-400">
            TIME
          </span>
        </div>

        <p className="mt-4 text-3xl font-bold tracking-tight text-white">
          {formatWeeklyTime(
            weeklySummary.totalTrackedSeconds
          )}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Total time tracked this week
        </p>
      </div>

      {/* Tasks Worked On */}
      <div className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:border-blue-500/40">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Tasks Worked On
          </p>

          <span className="rounded-lg bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
            TASKS
          </span>
        </div>

        <p className="mt-4 text-3xl font-bold tracking-tight text-white">
          {weeklySummary.tasksWorkedOn}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Unique tasks with tracked time
        </p>
      </div>

      {/* Completed */}
      <div className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:border-emerald-500/40">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Completed
          </p>

          <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
            DONE
          </span>
        </div>

        <p className="mt-4 text-3xl font-bold tracking-tight text-white">
          {weeklySummary.completedTasks}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Completed tasks
        </p>
      </div>
    </div>

    {/* Weekly Chart */}
    <div className="px-6 pb-6">
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">
              Time Tracked
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Daily activity across the current week
            </p>
          </div>

          <span className="text-xs text-slate-500">
            7 days
          </span>
        </div>

        {(() => {
          const maxSeconds = Math.max(
            ...weeklySummary.dailyData.map(
              (day) => day.trackedSeconds
            ),
            1
          );

          return (
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
              {weeklySummary.dailyData.map((day) => {
                const percentage =
                  (day.trackedSeconds / maxSeconds) * 100;

                const isHighest =
                  day.trackedSeconds === maxSeconds &&
                  day.trackedSeconds > 0;

                return (
                  <div
                    key={day.date}
                    className="flex min-w-0 flex-col items-center"
                  >
                    {/* Time */}
                    <span className="mb-3 text-center text-[10px] font-medium text-slate-400 sm:text-xs">
                      {formatWeeklyTime(
                        day.trackedSeconds
                      )}
                    </span>

                    {/* Bar container */}
                    <div className="flex h-40 w-full items-end justify-center">
                      <div className="relative flex h-full w-full max-w-10 items-end justify-center overflow-hidden rounded-t-lg bg-slate-900">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isHighest
                              ? "bg-indigo-400"
                              : "bg-indigo-500/60"
                          }`}
                          style={{
                            height:
                              day.trackedSeconds === 0
                                ? "4px"
                                : `${Math.max(
                                    percentage,
                                    8
                                  )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Day */}
                    <div
                      className={`mt-3 text-xs font-medium ${
                        isHighest
                          ? "text-indigo-400"
                          : "text-slate-500"
                      }`}
                    >
                      {day.day}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>

    {/* Productivity Insight */}
    {(() => {
      const mostProductiveDay =
        weeklySummary.dailyData.reduce(
          (most, current) =>
            current.trackedSeconds >
            most.trackedSeconds
              ? current
              : most
        );

      if (mostProductiveDay.trackedSeconds <= 0) {
        return null;
      }

      return (
        <div className="px-6 pb-6">
          <div className="flex flex-col gap-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                Productivity Insight
              </p>

              <p className="mt-1 text-sm text-slate-300">
                Your most productive day was{" "}
                <span className="font-semibold text-white">
                  {mostProductiveDay.day}
                </span>
                .
              </p>
            </div>

            <div className="rounded-lg border border-indigo-500/20 bg-slate-950 px-4 py-3 text-center">
              <p className="text-xs text-slate-500">
                Time tracked
              </p>

              <p className="mt-1 font-mono text-sm font-semibold text-indigo-400">
                {formatWeeklyTime(
                  mostProductiveDay.trackedSeconds
                )}
              </p>
            </div>
          </div>
        </div>
      );
    })()}
  </section>
)}

      </div>
    </main>
  );
}