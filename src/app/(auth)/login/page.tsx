"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomAlert } from "@/components/ui/CustomAlert";
import Link from "next/link";
import Image from "next/image";
import omniaLogo from "@/assets/images/omnia_logo.png";
import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FiLoader, FiMail, FiLock, FiLogIn, FiBriefcase } from "react-icons/fi";

function LoginContent() {
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const { loginWithGoogle, login, isLoading } = useAuth();
  const searchParams = useSearchParams();

  // Check for OAuth callback errors
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // Clear the error from URL
      window.history.replaceState({}, "", "/login");
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed");
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError("Please enter email and password");
        return;
    }
    if (!company) {
        setError("Please enter your company name");
        return;
    }
    setError("");
    
    try {
        // Convert company name to slug format (lowercase, replace spaces with hyphens)
        const tenantSlug = company.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        await login(email, password, tenantSlug);
    } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Logo and Title */}
          <div className="text-center flex flex-col items-center justify-center gap-4">
            <Image src={omniaLogo} alt="Logo" width={180} height={180} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <CustomAlert severity="error">
              {error}
            </CustomAlert>
          )}

          {/* Email/Password Form - For Employees */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Employee Login</h3>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiBriefcase className="text-gray-400" />
                      </div>
                      <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                          placeholder="your-company-name"
                          required
                      />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Enter your company name or slug</p>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="text-gray-400" />
                      </div>
                      <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                          placeholder="your@email.com"
                          required
                      />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="text-gray-400" />
                      </div>
                      <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                          placeholder="••••••••"
                          required
                      />
                  </div>
              </div>
              
              <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 rounded-xl text-white font-medium hover:bg-brand-700 shadow-sm shadow-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {isLoading && !isGoogleLoading ? <FiLoader className="animate-spin" /> : <FiLogIn />}
                  <span>Sign in</span>
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Business Owner? Sign in with</span>
            </div>
          </div>

          {/* Google Sign In Button - For Business Owners */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <FcGoogle className="w-6 h-6" />
                <span>Google</span>
              </>
            )}
          </button>

          {/* Info */}
          <div className="text-center space-y-4">
            <p className="text-xs text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Omnia. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center gap-2">
        <FiLoader className="w-6 h-6 animate-spin text-brand-500" />
        <span className="text-gray-600">Loading...</span>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
