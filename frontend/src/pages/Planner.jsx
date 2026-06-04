import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { generatePlan } from "../services/api";
import { Zap, RefreshCw, Trophy, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const importanceLabel = { 1: "Low", 2: "Medium", 3: "High" };
const difficultyLabel = { 1: "Easy",  2: "Medium", 3: "Hard"  };

const rankBadge = {
  1: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  2: "bg-gray-100 text-gray-600 border border-gray-200",
  3: "bg-amber-50 text-amber-700 border border-amber-200",
};

function scoreBar(score) {
  // max possible score ≈ 3.0
  const pct = Math.min(100, (score / 3.0) * 100);
  const color =
    pct > 80 ? "bg-red-500" : pct > 55 ? "bg-amber-500" : "bg-green-500";
  return { pct, color };
}

export default function Planner() {
  const [plan, setPlan]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await generatePlan();
      setPlan(res.data.plan);
      if (refresh) toast.success("Plan refreshed!");
    } catch {
      toast.error("Could not generate plan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink flex items-center gap-2">
            <Zap size={22} className="text-accent" /> Study Planner
          </h1>
          <p className="text-ink-muted text-sm mt-0.5">
            Priority order based on deadline, difficulty and importance.
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin" />
            <p className="text-sm text-ink-muted animate-pulse-soft">Generating your plan…</p>
          </div>
        </div>
      ) : plan.length === 0 ? (
        <div className="card text-center py-16 animate-fade-up">
          <p className="text-4xl mb-3">🗓️</p>
          <p className="font-display font-semibold text-ink text-lg">No pending tasks</p>
          <p className="text-ink-muted text-sm mt-1">
            Add tasks on the Tasks page and come back to see your plan.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plan.map((task, i) => {
            const { pct, color } = scoreBar(task.score);
            const isUrgent = task.days_left <= 2;

            return (
              <div
                key={task.id}
                className="card animate-fade-up hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0 ${
                      task.rank <= 3
                        ? rankBadge[task.rank] ?? "bg-accent-light text-accent border border-accent/20"
                        : "bg-surface text-ink-muted border border-surface-border"
                    }`}
                  >
                    {task.rank <= 3 ? (
                      task.rank === 1 ? "🥇" : task.rank === 2 ? "🥈" : "🥉"
                    ) : (
                      `#${task.rank}`
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display font-semibold text-base text-ink">{task.title}</h3>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isUrgent && (
                          <AlertTriangle size={14} className="text-red-500" />
                        )}
                        <span
                          className={`badge font-mono text-xs ${
                            pct > 80
                              ? "bg-red-50 text-red-600"
                              : pct > 55
                              ? "bg-amber-50 text-amber-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          Score: {task.score}
                        </span>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="badge bg-surface text-ink-muted">
                        📅 {task.days_left === 0 ? "Due today" : isUrgent ? `${task.days_left}d — urgent!` : `${task.days_left} days left`}
                      </span>
                      <span className="badge bg-surface text-ink-muted">
                        Importance: {importanceLabel[task.importance]}
                      </span>
                      <span className="badge bg-surface text-ink-muted">
                        Difficulty: {difficultyLabel[task.difficulty]}
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {plan.length > 0 && (
        <div className="mt-6 card bg-ink text-white animate-fade-up">
          <div className="flex items-center gap-3">
            <Trophy size={20} className="text-yellow-400" />
            <div>
              <p className="font-display font-semibold text-sm">Study tip</p>
              <p className="text-white/60 text-sm">
                Focus on rank #1 first. Take a 5-minute break every 25 minutes (Pomodoro method).
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}