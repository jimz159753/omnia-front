"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomAlert } from "@/components/ui/CustomAlert";
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect will be handled by the useAuth hook
    }
  }, [isAuthenticated]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await login(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-title">Login</h1>

        {error && <CustomAlert severity="error">{error}</CustomAlert>}

        <CustomInput
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <CustomInput
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <CustomButton type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Login"}
        </CustomButton>

        <p className="login-text">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="login-link">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
