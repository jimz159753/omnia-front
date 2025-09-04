import { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

export const useSafeMediaQuery = (query: string) => {
  const [mounted, setMounted] = useState(false);
  const [isMatch, setIsMatch] = useState(false);
  const mediaQuery = useMediaQuery(query);

  useEffect(() => {
    setMounted(true);
    setIsMatch(mediaQuery);
  }, [mediaQuery]);

  return { mounted, isMatch };
};
