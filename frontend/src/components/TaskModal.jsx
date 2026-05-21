import { useState, useEffect } from "react";
import { X } from "lucide-react";

const defaultForm = { title: "", deadline: "", importance: 2, difficulty: 2, status: "pending" };

export default function TaskModal({ isOpen, onClose, onSubmit, task }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const isEdit = !!task;

  useEffect(() => {
    if (task) {
      setForm({
        title:      task.title,
        deadline:   task.deadline?.split("T")[0] ?? task.deadline,
        importance: task.importance,
        difficulty: task.difficulty,
        status:     task.status,
      });
    } else {
      setForm(defaultForm);
    }
  }, [task, isOpen]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-surface-border shadow-2xl w-full max-w-md animate-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h2 className="font-display font-bold text-lg text-ink">
            {isEdit ? "Edit Task" : "Add New Task"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors">
            <X size={16} className="text-ink-muted" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Task Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handle}
              required
              placeholder="e.g. Study for OS exam"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handle}
              required
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Importance</label>
              <select name="importance" value={form.importance} onChange={handle} className="input-field">
                <option value={1}>1 — Low</option>
                <option value={2}>2 — Medium</option>
                <option value={3}>3 — High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Difficulty</label>
              <select name="difficulty" value={form.difficulty} onChange={handle} className="input-field">
                <option value={1}>1 — Easy</option>
                <option value={2}>2 — Medium</option>
                <option value={3}>3 — Hard</option>
              </select>
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Status</label>
              <select name="status" value={form.status} onChange={handle} className="input-field">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}