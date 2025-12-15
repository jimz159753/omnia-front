import { useState, useEffect } from "react";

interface Business {
  name?: string;
  logo?: string | null;
}

/**
 * Custom hook to fetch and manage business data
 * Follows SRP - Single responsibility for business data fetching
 */
export const useBusiness = (shouldFetch: boolean = true) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldFetch) return;

    const fetchBusiness = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/business");
        if (!res.ok) {
          throw new Error("Failed to fetch business data");
        }

        const json = await res.json();
        if (json?.data) {
          setBusiness(json.data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Failed to fetch business data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [shouldFetch]);

  return { business, loading, error };
};

