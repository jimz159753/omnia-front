"use client";
import React, { useState } from "react";
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
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-title">Register</h1>

        {error && <CustomAlert severity="error">{error}</CustomAlert>}

        {success && <CustomAlert severity="success">{success}</CustomAlert>}

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
        <CustomButton type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Register"}
        </CustomButton>

        <p className="login-text">
          Already have an account?{" "}
          <Link href="/login" className="login-link">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
