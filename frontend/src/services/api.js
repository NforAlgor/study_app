import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("ssp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If token is expired/invalid, force logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem("ssp_token");
    if ((error.response?.status === 403 || error.response?.status === 401) && token) {
      localStorage.removeItem("ssp_token");
      localStorage.removeItem("ssp_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const register = (data) => API.post("/auth/register", data);
export const login    = (data) => API.post("/auth/login", data);

// ── Tasks ─────────────────────────────────────────────
export const getTasks    = ()       => API.get("/tasks");
export const createTask  = (data)   => API.post("/tasks", data);
export const updateTask  = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask  = (id)     => API.delete(`/tasks/${id}`);
export const markComplete = (id)    => API.patch(`/tasks/${id}/complete`);

// ── Planner ───────────────────────────────────────────
export const generatePlan = () => API.post("/planner/generate");

// ── Profile ───────────────────────────────────────────
export const getProfile      = ()     => API.get("/profile");
export const updateProfile   = (data) => API.put("/profile", data);
export const changePassword  = (data) => API.put("/profile/password", data);

export default API;``