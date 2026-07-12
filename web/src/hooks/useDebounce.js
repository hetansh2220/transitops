import { useState, useEffect } from "react";

/**
 * useDebounce
 *
 * Returns a debounced copy of `value` that only updates after
 * `delay` ms have elapsed since the last change.
 *
 * @param {*}      value  - The value to debounce.
 * @param {number} delay  - Debounce delay in milliseconds (default: 300).
 * @returns {*} Debounced value.
 *
 * Usage
 * ─────
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
