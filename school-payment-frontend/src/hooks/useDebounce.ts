import { useState, useEffect } from 'react';

// This custom hook takes a value (like a search term) and a delay in milliseconds.
// It returns a "debounced" version of that value that only updates after the delay has passed.
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer that will update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // This is the cleanup function. It clears the timer if the value changes
    // before the delay is over (e.g., the user keeps typing).
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-run the effect if the value or delay changes

  return debouncedValue;
}

export default useDebounce;

