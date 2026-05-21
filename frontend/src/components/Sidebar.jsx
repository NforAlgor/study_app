import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, CheckSquare, CalendarClock,
  User, LogOut, BookOpen, Menu, X
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/tasks",     icon: CheckSquare,     label: "My Tasks"     },
  { to: "/planner",   icon: CalendarClock,   label: "Study Planner"},
  { to: "/profile",   icon: User,            label: "Profile"      },
];

function SidebarContent({ user, onLogout, onNavClick }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-6 py-6 border-b border-surface-border">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
          <BookOpen size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-lg text-ink tracking-tight">
          StudyFlow
        </span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-accent text-white shadow-glow"
                  : "text-ink-muted hover:bg-surface hover:text-ink"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 space-y-1 border-t border-surface-border pt-4">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent font-display font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
            <p className="text-xs text-ink-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl border border-surface-border flex items-center justify-center shadow-card"
      >
        <Menu size={18} className="text-ink" />
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-border transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface"
        >
          <X size={16} />
        </button>
        <SidebarContent user={user} onLogout={handleLogout} onNavClick={() => setOpen(false)} />
      </aside>

      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-surface-border fixed inset-y-0 left-0">
        <SidebarContent user={user} onLogout={handleLogout} onNavClick={() => {}} />
      </aside>
    </>
  );
}