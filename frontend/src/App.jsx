import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

import Login     from "./pages/Login";
import Register  from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks     from "./pages/Tasks";
import Planner   from "./pages/Planner";
import Profile   from "./pages/Profile";
import NotFound  from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
              border: "1px solid #E8E6F5",
              boxShadow: "0 4px 24px rgba(13,15,20,0.08)",
            },
            success: { iconTheme: { primary: "#7C6FFF", secondary: "#fff" } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />}    />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tasks"     element={<ProtectedRoute><Tasks /></ProtectedRoute>}     />
          <Route path="/planner"   element={<ProtectedRoute><Planner /></ProtectedRoute>}   />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>}   />

          {/* Redirects */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}