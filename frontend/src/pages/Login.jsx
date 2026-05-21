import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, ArrowRight } from "lucide-react";
import { login } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
            <BookOpen size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">StudyFlow</span>
        </div>

        <div>
          {/* Decorative task preview */}
          <div className="space-y-3 mb-10">
            {[
              { title: "Algorithms Final Exam", score: 2.9, days: 2, color: "bg-red-500" },
              { title: "Software Engineering Report", score: 2.3, days: 5, color: "bg-amber-500" },
              { title: "Database Lab Practicals", score: 1.8, days: 8, color: "bg-blue-500" },
            ].map((t) => (
              <div key={t.title} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className={`w-2 h-2 rounded-full ${t.color} flex-shrink-0`} />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{t.title}</p>
                  <p className="text-white/40 text-xs">Priority score: {t.score}</p>
                </div>
                <span className="text-white/50 text-xs">{t.days}d left</span>
              </div>
            ))}
          </div>

          <h1 className="font-display font-bold text-4xl text-white leading-tight mb-4">
            Your AI study<br />plan awaits.
          </h1>
          <p className="text-white/60 text-lg">
            Log in to see your personalised priority schedule.
          </p>
        </div>

        <p className="text-white/30 text-sm">© 2025 StudyFlow. Built for serious students.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-ink">StudyFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-ink mb-2">Welcome back</h2>
            <p className="text-ink-muted">Sign in to your StudyFlow account.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handle}
                required
                placeholder="john@university.edu"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handle}
                  required
                  placeholder="Your password"
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent font-medium hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}