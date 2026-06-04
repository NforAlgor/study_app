import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTasks } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import {
  CheckSquare, Clock, AlertCircle, TrendingUp,
  CalendarClock, ArrowRight, Timer, Brain, RefreshCw,
  FileText, BookOpen, Book
} from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const taskRes = await getTasks();
        setTasks(taskRes.data.tasks);
      } catch {
        toast.error("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const pending   = tasks.filter(t => t.status === "pending").length;
  const inProg    = tasks.filter(t => t.status === "in_progress").length;

  const today = new Date(); today.setHours(0,0,0,0);
  const dueSoon = tasks.filter(t => {
    const d = new Date(t.deadline);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3 && t.status !== "completed";
  });

  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: "Total Tasks",   value: total,     icon: CheckSquare, color: "bg-accent-light text-accent"     },
    { label: "Pending",       value: pending,   icon: Clock,       color: "bg-amber-50 text-amber-600"      },
    { label: "In Progress",   value: inProg,    icon: AlertCircle, color: "bg-blue-50 text-blue-600"        },
    { label: "Completed",     value: completed, icon: TrendingUp,  color: "bg-green-50 text-green-600"      },
  ];

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-sm text-ink-muted mb-1">
          {new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" })}
        </p>
        <h1 className="font-display font-bold text-3xl text-ink">
          Good{new Date().getHours() < 12 ? " morning" : new Date().getHours() < 17 ? " afternoon" : " evening"},{" "}
          <span className="text-accent">{user?.name?.split(" ")[0]}</span> 
        </h1>
        <p className="text-ink-muted mt-1">Here's your study overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="card animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <p className="font-display font-bold text-2xl text-ink">{s.value}</p>
            <p className="text-xs text-ink-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Progress card */}
        <div className="card animate-fade-up">
          <h2 className="font-display font-semibold text-base text-ink mb-4">Completion Rate</h2>
          <div className="flex items-end gap-3 mb-4">
            <span className="font-display font-bold text-4xl text-ink">{completionPct}%</span>
            <span className="text-ink-muted text-sm mb-1">{completed}/{total} tasks</span>
          </div>
          <div className="h-2.5 bg-surface-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-xs text-ink-muted mt-3">
            {pending > 0
              ? `${pending} task${pending > 1 ? "s" : ""} still need attention`
              : "All caught up!"}
          </p>
        </div>

        {/* Due soon */}
        <div className="card animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base text-ink">Due Soon</h2>
            <span className="badge bg-red-50 text-red-600">{dueSoon.length} tasks</span>
          </div>
          {dueSoon.length === 0 ? (
            <p className="text-ink-muted text-sm">No urgent deadlines in the next 3 days.</p>
          ) : (
            <div className="space-y-2.5">
              {dueSoon.map(t => {
                const d = Math.ceil((new Date(t.deadline) - today) / (1000 * 60 * 60 * 24));
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                    <span className="flex-1 text-sm text-ink truncate">{t.title}</span>
                    <span className="text-xs font-mono text-red-500 flex-shrink-0">
                      {d === 0 ? "Today" : `${d}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link
          to="/tasks"
          className="card hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center gap-4 animate-fade-up"
        >
          <div className="w-10 h-10 bg-accent-light rounded-xl flex items-center justify-center">
            <CheckSquare size={18} className="text-accent" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-ink">Manage Tasks</p>
            <p className="text-xs text-ink-muted">Add, edit, delete tasks</p>
          </div>
          <ArrowRight size={16} className="text-ink-muted ml-auto" />
        </Link>

        <Link
          to="/planner"
          className="card hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center gap-4 animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <CalendarClock size={18} className="text-green-600" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-ink">Study Planner</p>
            <p className="text-xs text-ink-muted">View  schedule</p>
          </div>
          <ArrowRight size={16} className="text-ink-muted ml-auto" />
        </Link>
      </div>

      {/* Study Techniques */}
      <div className="mt-10 animate-fade-up">
        <div className="mb-6">
          <h2 className="font-display font-bold text-xl text-ink">Study Techniques</h2>
          <p className="text-ink-muted text-sm mt-1">Find a method that works for you and follow it.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "Pomodoro Technique",
              desc: "Work in focused 25-minute intervals with 5-minute breaks. After 4 cycles, take a longer 15-30 min break.",
              color: "bg-red-50 text-red-600",
              icon: Timer,
            },
            {
              name: "Active Recall",
              desc: "Test yourself on the material instead of passively re-reading. Close the book and explain concepts from memory.",
              color: "bg-blue-50 text-blue-600",
              icon: Brain,
            },
            {
              name: "Spaced Repetition",
              desc: "Review material at increasing intervals (1 day, 3 days, 1 week, 1 month) to move knowledge into long-term memory.",
              color: "bg-green-50 text-green-600",
              icon: RefreshCw,
            },
            {
              name: "Feynman Technique",
              desc: "Explain a concept in simple terms as if teaching a child. If you can't explain it simply, you don't understand it well enough.",
              color: "bg-purple-50 text-purple-600",
              icon: FileText,
            },
            {
              name: "Cornell Method",
              desc: "Divide your notes into cues, notes, and summary sections. Review cues to test yourself on the material.",
              color: "bg-amber-50 text-amber-600",
              icon: BookOpen,
            },
            {
              name: "SQ3R Method",
              desc: "Survey, Question, Read, Recite, Review. A five-step strategy for efficient reading and comprehension of textbooks.",
              color: "bg-pink-50 text-pink-600",
              icon: Book,
            },
          ].map((t, i) => (
            <div
              key={t.name}
              className="card hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <t.icon size={20} className={`${t.color} flex-shrink-0 mt-0.5`} />
                <div>
                  <h3 className="font-display font-semibold text-sm text-ink mb-1">{t.name}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{t.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}