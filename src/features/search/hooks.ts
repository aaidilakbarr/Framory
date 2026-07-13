import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { queryKeys } from "@/lib/query-client";
import { searchMemories } from "@/services/search";

export function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}

export function useMemorySearch(query: string) {
  const normalized = useDebouncedValue(query.trim());
  return useQuery({
    queryKey: queryKeys.search(normalized),
    queryFn: () => searchMemories(normalized),
    enabled: Boolean(normalized),
    placeholderData: keepPreviousData,
  });
}
