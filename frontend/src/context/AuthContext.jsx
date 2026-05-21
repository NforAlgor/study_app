import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("ssp_token");
    const storedUser  = localStorage.getItem("ssp_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, jwtToken) => {
    localStorage.setItem("ssp_token", jwtToken);
    localStorage.setItem("ssp_user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("ssp_token");
    localStorage.removeItem("ssp_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem("ssp_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};