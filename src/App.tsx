import  { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Layout } from "./components/layout";
import SignupPage from "./components/signup";
import LoginPage from "./components/login";
import Dashboard from "./pages/dashboard";
import type { User } from "./types";

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // New loading state

  // 1. Check for logged-in user on App start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData:User) => {
    setUser(userData);
    console.log("User logged in:", userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Prevent flickering while checking localStorage
  if (loading) return null;

  return (
    <HashRouter>
      <Routes>
        {/* PUBLIC ROUTES (No Layout) */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/signup" 
          element={!user ? <SignupPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
        />

        {/* PROTECTED ROUTES (Wrapped in Layout) */}
        <Route
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Outlet /> {/* This renders the child route (Dashboard) */}
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/" element={<Dashboard user={user} />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;