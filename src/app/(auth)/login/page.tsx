"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomAlert } from "@/components/ui/CustomAlert";
import Link from "next/link";
import Image from "next/image";
import omniaLogo from "@/assets/images/omnia_logo.png";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="text-center flex flex-col items-center justify-center gap-4">
            <Image src={omniaLogo} alt="Logo" width={200} height={200} />
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {error && <CustomAlert severity="error">{error}</CustomAlert>}

          <div className="space-y-4">
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
          </div>

          <CustomButton type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Signing in..." : "Login"}
          </CustomButton>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
