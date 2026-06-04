import { Trash2, Pencil, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";

const importanceLabel = { 1: "Low", 2: "Medium", 3: "High" };
const difficultyLabel = { 1: "Easy", 2: "Medium", 3: "Hard" };

const importanceColor = {
  1: "bg-green-50 text-green-700",
  2: "bg-amber-50 text-amber-700",
  3: "bg-red-50 text-red-600",
};
const difficultyColor = {
  1: "bg-blue-50 text-blue-600",
  2: "bg-purple-50 text-purple-600",
  3: "bg-pink-50 text-pink-600",
};
const statusIcon = {
  pending:     <Clock size={14} className="text-amber-500" />,
  in_progress: <AlertCircle size={14} className="text-blue-500" />,
  completed:   <CheckCircle2 size={14} className="text-green-500" />,
};

export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const deadlineDate = new Date(task.deadline);
  const today = new Date(); today.setHours(0,0,0,0);
  const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0 && task.status !== "completed";
  const isNotCompleted = isOverdue && task.status === "in_progress";

  return (
    <div
      className={`card group animate-fade-up transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        task.status === "completed" ? "opacity-60" : ""
      } ${isOverdue ? "border-red-200" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isNotCompleted ? <XCircle size={14} className="text-red-500" /> : statusIcon[task.status]}
            <h3
              className={`font-display font-semibold text-base text-ink truncate ${
                task.status === "completed" ? "line-through text-ink-muted" : ""
              }`}
            >
              {task.title}
            </h3>
            {isNotCompleted && (
              <span className="badge bg-red-50 text-red-600 text-xs font-medium">Not Completed</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`badge ${importanceColor[task.importance]}`}>
              Importance: {importanceLabel[task.importance]}
            </span>
            <span className={`badge ${difficultyColor[task.difficulty]}`}>
              Difficulty: {difficultyLabel[task.difficulty]}
            </span>
            <span
              className={`badge ${
                isOverdue
                  ? "bg-red-50 text-red-600"
                  : daysLeft <= 2
                  ? "bg-amber-50 text-amber-700"
                  : "bg-surface text-ink-muted"
              }`}
            >
              {isOverdue
                ? `${Math.abs(daysLeft)}d overdue`
                : daysLeft === 0
                ? "Due today"
                : `${daysLeft}d left`}
            </span>
          </div>

          <p className="text-xs text-ink-muted mt-2 font-mono">
            Deadline: {deadlineDate.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== "completed" && (
            <>
              <button
                onClick={() => onComplete(task.id)}
                title="Mark complete"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-600 transition-colors"
              >
                <CheckCircle2 size={16} />
              </button>
              <button
                onClick={() => onEdit(task)}
                title="Edit"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent-light text-accent transition-colors"
              >
                <Pencil size={15} />
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(task.id)}
            title="Delete"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}