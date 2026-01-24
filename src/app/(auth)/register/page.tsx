"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomAlert } from "@/components/ui/CustomAlert";
import Link from "next/link";
import Image from "next/image";
import omniaLogo from "@/assets/images/omnia_logo.png";
import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FiLoader, FiCheck } from "react-icons/fi";

function RegisterContent() {
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { loginWithGoogle, isLoading } = useAuth();
  const searchParams = useSearchParams();

  // Check for OAuth callback errors
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      window.history.replaceState({}, "", "/register");
    }
  }, [searchParams]);

  const handleGoogleRegister = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google registration failed");
      setIsGoogleLoading(false);
    }
  };

  const features = [
    "Manage appointments & bookings",
    "Track sales & inventory",
    "Send WhatsApp reminders",
    "Sync with Google Calendar",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Logo and Title */}
          <div className="text-center flex flex-col items-center justify-center gap-4">
            <Image src={omniaLogo} alt="Logo" width={180} height={180} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
              <p className="mt-2 text-gray-600">Get started with Omnia in seconds</p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <CustomAlert severity="error">
              {error}
            </CustomAlert>
          )}

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleRegister}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25"
          >
            {isGoogleLoading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                <span>Creating your account...</span>
              </>
            ) : (
              <>
                <FcGoogle className="w-6 h-6 bg-white rounded-full p-0.5" />
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          {/* Features List */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">What you&apos;ll get:</p>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>No password needed - secure Google authentication</span>
            </div>
            
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand-600 hover:text-brand-500 transition-colors"
              >
                Sign in here
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

function RegisterFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center gap-2">
        <FiLoader className="w-6 h-6 animate-spin text-brand-500" />
        <span className="text-gray-600">Loading...</span>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterContent />
    </Suspense>
  );
}
