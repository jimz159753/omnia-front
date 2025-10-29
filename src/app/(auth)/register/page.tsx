"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomAlert } from "@/components/ui/CustomAlert";
import Link from "next/link";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register(email, password);
      setSuccess("Registration successful! Redirecting to dashboard...");

      // Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Register</h1>
            <p className="text-gray-600">Create your account</p>
          </div>

          {error && <CustomAlert severity="error">{error}</CustomAlert>}

          {success && <CustomAlert severity="success">{success}</CustomAlert>}

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
              helperText="At least 8 characters with uppercase, lowercase, and number"
            />
            <CustomInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <CustomButton type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating account..." : "Register"}
          </CustomButton>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
