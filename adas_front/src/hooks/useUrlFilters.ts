import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useUrlFilters<T extends Record<string, any>>(initialFilters: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<T>(() => {
    const state: any = { ...initialFilters };
    for (const key in initialFilters) {
      const urlValue = searchParams.get(key);
      if (urlValue !== null) {
        state[key] = urlValue;
      }
    }
    return state as T;
  });

  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(filters).forEach(([key, value]) => {
        if (value === "" || value === undefined || value === null) {
          next.delete(key);
        } else if (typeof value === "boolean") {
          next.set(key, value ? "true" : "false");
        } else {
          next.set(key, String(value));
        }
      });
      return next;
    }, { replace: true });
  }, [filters, setSearchParams]);

  return { filters, setFilters, searchParams, setSearchParams };
}
