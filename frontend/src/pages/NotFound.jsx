import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-accent-light rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen size={28} className="text-accent" />
        </div>
        <h1 className="font-display font-bold text-6xl text-ink mb-2">404</h1>
        <p className="font-display font-semibold text-xl text-ink mb-2">Page not found</p>
        <p className="text-ink-muted mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
