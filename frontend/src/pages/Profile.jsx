import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import NotificationSettings from "../components/NotificationSettings";
import { getProfile, updateProfile, changePassword, getTasks } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { User, Lock, CheckCircle, Clock, BarChart3, LogOut, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, updateUser, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "" });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, tasksRes] = await Promise.all([getProfile(), getTasks()]);
        setStats(profileRes.data.stats);
        setProfileForm({ name: profileRes.data.user.name, email: profileRes.data.user.email });
        setTasks(tasksRes.data.tasks);
      } catch {
        toast.error("Could not load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const today = new Date();
  const notCompleted = tasks.filter(t => t.status !== "completed" && new Date(t.deadline) < today).length;
  const pendingActive = tasks.filter(t => t.status === "pending" && new Date(t.deadline) >= today).length;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await updateProfile(profileForm);
      updateUser({ ...user, ...profileForm });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.new_password.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(pwForm);
      toast.success("Password changed successfully!");
      setPwForm({ current_password: "", new_password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out");
    navigate("/login");
  };

  const completionPct =
    stats && stats.total_tasks > 0
      ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
      : 0;

  return (
    <Layout>
      <div className="mb-6 animate-fade-up">
        <h1 className="font-display font-bold text-2xl text-ink">Profile</h1>
        <p className="text-ink-muted text-sm mt-0.5">Manage your account and view your stats.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — avatar + stats */}
        <div className="space-y-4">
          {/* Avatar card */}
          <div className="card text-center animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-3 text-accent font-display font-bold text-3xl">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <p className="font-display font-bold text-lg text-ink">{user?.name}</p>
            <p className="text-sm text-ink-muted">{user?.email}</p>
          </div>

          {/* Stats */}
          {!loading && stats && (
            <div className="card animate-fade-up" style={{ animationDelay: "60ms" }}>
              <h3 className="font-display font-semibold text-sm text-ink mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-accent" /> Task Statistics
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Total Tasks",   value: stats.total_tasks,      icon: BarChart3,   color: "text-accent"    },
                  { label: "Completed",     value: stats.completed_tasks,  icon: CheckCircle, color: "text-green-600" },
                  { label: "Not Completed", value: notCompleted,           icon: XCircle,     color: "text-red-600"   },
                  { label: "Pending",       value: pendingActive,          icon: Clock,       color: "text-amber-600" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <s.icon size={14} className={s.color} />
                      <span className="text-sm text-ink-muted">{s.label}</span>
                    </div>
                    <span className="font-mono font-medium text-sm text-ink">{s.value ?? 0}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-surface-border">
                <div className="flex justify-between text-xs text-ink-muted mb-1.5">
                  <span>Completion rate</span>
                  <span className="font-mono">{completionPct}%</span>
                </div>
                <div className="h-2 bg-surface-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-700"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn-danger w-full flex items-center justify-center gap-2 animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Right — forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit profile */}
          <div className="card animate-fade-up" style={{ animationDelay: "40ms" }}>
            <h3 className="font-display font-semibold text-base text-ink mb-5 flex items-center gap-2">
              <User size={17} className="text-accent" /> Edit Profile
            </h3>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Full Name</label>
                <input
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={profileLoading} className="btn-primary">
                {profileLoading ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="card animate-fade-up" style={{ animationDelay: "80ms" }}>
            <h3 className="font-display font-semibold text-base text-ink mb-5 flex items-center gap-2">
              <Lock size={17} className="text-accent" /> Change Password
            </h3>
            <form onSubmit={handlePwChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={pwForm.current_password}
                  onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })}
                  required
                  placeholder="Your current password"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">New Password</label>
                <input
                  type="password"
                  value={pwForm.new_password}
                  onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
                  required
                  placeholder="At least 6 characters"
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={pwLoading} className="btn-primary">
                {pwLoading ? "Updating…" : "Change Password"}
              </button>
            </form>
          </div>

          {/* Notification Settings */}
          <NotificationSettings />
        </div>
      </div>
    </Layout>
  );
}