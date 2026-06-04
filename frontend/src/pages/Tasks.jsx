import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { getTasks, createTask, updateTask, deleteTask, markComplete } from "../services/api";
import { Plus, Search, SlidersHorizontal, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

const FILTERS = ["all", "pending", "completed", "not_completed"];
const filterLabel = { all: "All", pending: "Pending", completed: "Completed", not_completed: "Not Completed" };

export default function Tasks() {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask]  = useState(null);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [sortBy, setSortBy]     = useState("deadline");

  const load = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data.tasks);
    } catch {
      toast.error("Could not load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (form) => {
    try {
      if (editTask) {
        await updateTask(editTask.id, form);
        toast.success("Task updated!");
      } else {
        await createTask(form);
        toast.success("Task added!");
      }
      setModalOpen(false);
      setEditTask(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      toast.success("Task deleted");
      load();
    } catch {
      toast.error("Could not delete task");
    }
  };

  const handleComplete = async (id) => {
    try {
      await markComplete(id);
      toast.success("Marked as completed!");
      load();
    } catch {
      toast.error("Could not update task");
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  const today = new Date();
  const isNotCompleted = (t) => t.status !== "completed" && new Date(t.deadline) < today;

  const countFor = (f) => {
    if (f === "all") return tasks.length;
    if (f === "not_completed") return tasks.filter(isNotCompleted).length;
    return tasks.filter(t => t.status === f).length;
  };

  // Filter + search + sort
  const visible = tasks
    .filter(t => {
      if (filter === "all") return true;
      if (filter === "not_completed") return isNotCompleted(t);
      return t.status === filter;
    })
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "deadline") return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === "importance") return b.importance - a.importance;
      if (sortBy === "difficulty") return b.difficulty - a.difficulty;
      return 0;
    });

  return (
    <Layout>
      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSubmit={handleSubmit}
        task={editTask}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">My Tasks</h1>
          <p className="text-ink-muted text-sm mt-0.5">{tasks.length} total tasks</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-field pl-10 pr-4 appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="importance">Sort: Importance</option>
            <option value="difficulty">Sort: Difficulty</option>
          </select>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap animate-fade-up" style={{ animationDelay: "80ms" }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              filter === f
                ? "bg-accent text-white"
                : "bg-white border border-surface-border text-ink-muted hover:border-accent/30"
            }`}
          >
            {filterLabel[f]}
            <span className="ml-1.5 text-xs opacity-70">
              ({countFor(f)})
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="card text-center py-16 animate-fade-up">
          <ClipboardList size={40} className="text-ink-muted mx-auto mb-3" />
          <p className="font-display font-semibold text-ink text-lg">No tasks found</p>
          <p className="text-ink-muted text-sm mt-1 mb-4">
            {search ? "Try a different search term" : "Add your first task to get started"}
          </p>
          {!search && (
            <button onClick={openAdd} className="btn-primary">
              <Plus size={15} className="inline mr-1.5" /> Add Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((task, i) => (
            <div key={task.id} style={{ animationDelay: `${i * 40}ms` }}>
              <TaskCard
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onComplete={handleComplete}
              />
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}