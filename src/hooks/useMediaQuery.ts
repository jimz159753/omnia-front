import { useCustomMediaQuery } from "./useCustomMediaQuery";

export const useSafeMediaQuery = (query: string) => {
  const { matches, mounted } = useCustomMediaQuery(query);
  return { mounted, isMatch: matches };
};
