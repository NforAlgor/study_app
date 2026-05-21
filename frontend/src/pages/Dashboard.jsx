import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTasks, generatePlan } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import {
  CheckSquare, Clock, AlertCircle, TrendingUp,
  CalendarClock, ArrowRight, Zap
} from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks]   = useState([]);
  const [plan, setPlan]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [taskRes, planRes] = await Promise.all([getTasks(), generatePlan()]);
        setTasks(taskRes.data.tasks);
        setPlan(planRes.data.plan.slice(0, 3));
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

  const scoreColor = (score) => {
    if (score >= 2.5) return "text-red-600 bg-red-50";
    if (score >= 1.8) return "text-amber-600 bg-amber-50";
    return "text-green-600 bg-green-50";
  };

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
          <span className="text-accent">{user?.name?.split(" ")[0]}</span> 👋
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
              : "All caught up! 🎉"}
          </p>
        </div>

        {/* Due soon */}
        <div className="card animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base text-ink">Due Soon</h2>
            <span className="badge bg-red-50 text-red-600">{dueSoon.length} tasks</span>
          </div>
          {dueSoon.length === 0 ? (
            <p className="text-ink-muted text-sm">No urgent deadlines in the next 3 days. 🟢</p>
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

        {/* Top AI picks */}
        <div className="card animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base text-ink flex items-center gap-2">
              <Zap size={16} className="text-accent" /> AI Top 3
            </h2>
            <Link to="/planner" className="text-xs text-accent hover:underline flex items-center gap-1">
              Full plan <ArrowRight size={12} />
            </Link>
          </div>
          {plan.length === 0 ? (
            <p className="text-ink-muted text-sm">Add tasks to generate your plan.</p>
          ) : (
            <div className="space-y-2.5">
              {plan.map((t) => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {t.rank}
                  </span>
                  <span className="flex-1 text-sm text-ink truncate">{t.title}</span>
                  <span className={`badge text-xs ${scoreColor(t.score)}`}>
                    {t.score}
                  </span>
                </div>
              ))}
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
            <p className="text-xs text-ink-muted">View AI schedule</p>
          </div>
          <ArrowRight size={16} className="text-ink-muted ml-auto" />
        </Link>
      </div>
    </Layout>
  );
}