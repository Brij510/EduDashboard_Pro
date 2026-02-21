import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/api";

interface LoginProps {
  onLogin: (isAdmin: boolean) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVisitorLogin = async () => {
    try {
      await fetch(apiUrl("/api/logout"), { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Failed to clear session", error);
    }
    onLogin(false);
    navigate("/");
  };

  const handleDeveloperLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl("/api/login"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: `Welcome back, ${username.trim()}!`,
          description: "You now have access to admin features.",
        });
        onLogin(true);
        navigate("/");
      } else {
        const payload = await response.json().catch(() => null);
        const errorMessage =
          typeof payload?.error === "string"
            ? payload.error
            : "Please check your username and password.";
        toast({
          title: "Invalid Credentials",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Unable to reach the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-background/80">
      <div className="glass-panel rounded-2xl shadow-2xl p-8 w-full max-w-md border border-border/50 animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            EduDashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Your learning journey starts here
          </p>
        </div>

        <div className="space-y-6">
          {/* Visitor Button */}
          <div className="text-center">
            <button
              onClick={handleVisitorLogin}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-primary/20"
            >
              Continue as Visitor
            </button>
            <p className="text-muted-foreground text-sm mt-3">
              Explore content with progress tracking
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-sm">or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Developer Login Form */}
          <div>
            <h3 className="text-lg font-medium text-center mb-4 text-foreground">
              Developer Login
            </h3>
            <form onSubmit={handleDeveloperLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-muted-foreground mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-muted-foreground mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground"
                  placeholder="Enter password"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Developer Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
