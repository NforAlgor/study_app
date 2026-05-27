import { useEffect, useState } from "react";
import { Bell, BellOff, Mail, CheckCircle, AlertTriangle } from "lucide-react";
import {
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribed,
} from "../services/pushService";
import toast from "react-hot-toast";

export default function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [toggling, setToggling]       = useState(false);
  const supported = "Notification" in window && "serviceWorker" in navigator;

  // Check current subscription status on mount
  useEffect(() => {
    isSubscribed()
      .then(setPushEnabled)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    setToggling(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
        toast.success("Push notifications disabled");
      } else {
        await subscribeToPush();
        setPushEnabled(true);
        toast.success("Push notifications enabled! 🔔");
      }
    } catch (err) {
      toast.error(err.message || "Could not update notification settings");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="card animate-fade-up">
      <h3 className="font-display font-semibold text-base text-ink mb-5 flex items-center gap-2">
        <Bell size={17} className="text-accent" /> Notification Settings
      </h3>

      <div className="space-y-4">
        {/* ── Push Notifications ─────────────────────── */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-surface border border-surface-border">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              pushEnabled ? "bg-accent-light text-accent" : "bg-gray-100 text-gray-400"
            }`}>
              {pushEnabled ? <Bell size={17} /> : <BellOff size={17} />}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Browser Push Notifications</p>
              <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                Get notified directly in your browser when tasks are due within 3 days.
                Works even when the app tab is in the background.
              </p>
              {!supported && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} /> Not supported in this browser
                </p>
              )}
              {supported && pushEnabled && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle size={12} /> Active — you'll be notified daily at 7:00 AM
                </p>
              )}
            </div>
          </div>

          {/* Toggle button */}
          <button
            onClick={handleToggle}
            disabled={!supported || loading || toggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 mt-0.5 ${
              pushEnabled ? "bg-accent" : "bg-gray-300"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                pushEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* ── Email Reminders ─────────────────────────── */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-surface-border">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
            <Mail size={17} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Email Reminders</p>
              <span className="badge bg-green-50 text-green-700 text-xs">Always on</span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
              A daily email is automatically sent to your registered address every morning at{" "}
              <strong>7:00 AM</strong> listing all tasks due within the next 3 days — with
              priority scores included.
            </p>
            <p className="text-xs text-ink-muted mt-1.5">
              To change your email address, update it in{" "}
              <span className="text-accent">Edit Profile</span> above.
            </p>
          </div>
        </div>

        {/* ── Info box ─────────────────────────────────── */}
        <div className="p-3 rounded-xl bg-accent-light border border-accent/20 text-xs text-accent leading-relaxed">
          <strong>When will I be reminded?</strong> The system checks daily at 7:00 AM for tasks
          due in 0–3 days. You get both an email and (if enabled) a push notification listing
          your upcoming tasks sorted by priority score.
        </div>
      </div>
    </div>
  );
}