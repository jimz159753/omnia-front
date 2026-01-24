"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomAlert } from "@/components/ui/CustomAlert";
import Link from "next/link";
import Image from "next/image";
import omniaLogo from "@/assets/images/omnia_logo.png";
import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FiLoader } from "react-icons/fi";

function LoginContent() {
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { loginWithGoogle, isLoading } = useAuth();
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

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <FcGoogle className="w-6 h-6" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Secure authentication</span>
            </div>
          </div>

          {/* Info */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Your data is protected with Google&apos;s security</span>
            </div>
            
            <p className="text-xs text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-brand-600 hover:text-brand-500 transition-colors"
              >
                Create one now
              </Link>
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
