"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import omniaLogo from "@/assets/images/omnia_logo.png";
import { FiLoader, FiAlertCircle } from "react-icons/fi";

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invitation token is missing.");
      setIsLoading(false);
      return;
    }

    // Verify token
    fetch(`/api/auth/invite?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setIsValid(true);
          setUserName(data.user.name);
        } else {
          setError(data.error || "Invalid invitation.");
        }
      })
      .catch(() => setError("Failed to verify invitation."))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok) {
        // Redirect to dashboard
        router.replace("/dashboard/analytics"); 
      } else {
        setError(data.error || "Failed to set password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FiLoader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center flex flex-col items-center justify-center gap-4">
          <Image src={omniaLogo} alt="Logo" width={150} height={150} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Omnia</h2>
            <p className="mt-2 text-gray-600">Complete your account setup</p>
          </div>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm">
                <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
            </div>
        )}

        {isValid ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-xl mb-6">
                <p className="text-sm text-purple-800">Hello <strong>{userName}</strong>, please create a password to activate your account.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 font-medium transition-all"
            >
              {isSubmitting ? <FiLoader className="w-5 h-5 animate-spin" /> : "Set Password & Login"}
            </button>
          </form>
        ) : (
             <div className="text-center">
                 <p className="text-gray-500">Please contact your administrator for a new invitation.</p>
             </div>
        )}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InviteContent />
    </Suspense>
  );
}
