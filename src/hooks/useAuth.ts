import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const contentType = response.headers.get("content-type");
      
      if (response.ok && contentType?.includes("application/json")) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        if (!response.ok && !contentType?.includes("application/json")) {
          const text = await response.text();
          console.error("Auth check returned non-JSON response:", text.substring(0, 100));
        }
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const response = await fetch("/api/auth/google");
      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        console.error("Login with Google returned non-JSON:", text.substring(0, 200));
        throw new Error("Server returned HTML instead of JSON. Check if the API route exists and is working.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error("Failed to get authorization URL");
      }
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string, tenantSlug: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, tenantSlug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Update authentication state
      setUser(data.user);
      setIsAuthenticated(true);

      // Use replace instead of push to avoid back button issues
      router.replace("/dashboard/analytics");
      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, tenantSlug: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, tenantSlug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Auto login after successful registration
      return await login(email, password, tenantSlug);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsAuthenticated(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout,
    checkAuth,
  };
};
