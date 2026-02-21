import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import { apiUrl } from "@/lib/api";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(apiUrl("/api/session"), {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setIsLoggedIn(true);
            setIsAdmin(data.admin);
          }
        }
      } catch (error) {
        console.error("Failed to check session", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = (admin: boolean) => {
    setIsLoggedIn(true);
    setIsAdmin(admin);
  };

  const handleLogout = async () => {
    try {
      await fetch(apiUrl("/api/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to logout", error);
    }
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Index isAdmin={isAdmin} onLogout={handleLogout} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
