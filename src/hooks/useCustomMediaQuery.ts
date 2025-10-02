import { useState, useEffect } from "react";

// Custom breakpoints matching Material-UI defaults
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

// Custom theme object
export const theme = {
  breakpoints: {
    up: (key: BreakpointKey) => `(min-width: ${breakpoints[key]}px)`,
    down: (key: BreakpointKey) => `(max-width: ${breakpoints[key] - 0.05}px)`,
    between: (start: BreakpointKey, end: BreakpointKey) =>
      `(min-width: ${breakpoints[start]}px) and (max-width: ${
        breakpoints[end] - 0.05
      }px)`,
    only: (key: BreakpointKey) => {
      const keys = Object.keys(breakpoints) as BreakpointKey[];
      const currentIndex = keys.indexOf(key);
      const nextKey = keys[currentIndex + 1];

      if (nextKey) {
        return `(min-width: ${breakpoints[key]}px) and (max-width: ${
          breakpoints[nextKey] - 0.05
        }px)`;
      }
      return `(min-width: ${breakpoints[key]}px)`;
    },
  },
};

// Custom useMediaQuery hook
export const useCustomMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return { matches, mounted };
};

// Convenience hook for common breakpoints
export const useBreakpoint = () => {
  const isXs = useCustomMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useCustomMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useCustomMediaQuery(theme.breakpoints.only("md"));
  const isLg = useCustomMediaQuery(theme.breakpoints.only("lg"));
  const isXl = useCustomMediaQuery(theme.breakpoints.only("xl"));

  const isMobile = useCustomMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useCustomMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useCustomMediaQuery(theme.breakpoints.up("lg"));

  return {
    isXs: isXs.matches,
    isSm: isSm.matches,
    isMd: isMd.matches,
    isLg: isLg.matches,
    isXl: isXl.matches,
    isMobile: isMobile.matches,
    isTablet: isTablet.matches,
    isDesktop: isDesktop.matches,
    mounted: isMobile.mounted,
  };
};

// Hook that matches Material-UI's useMediaQuery API
export const useMediaQuery = (query: string) => {
  const { matches } = useCustomMediaQuery(query);
  return matches;
};

// Hook that matches Material-UI's useTheme API
export const useTheme = () => theme;
