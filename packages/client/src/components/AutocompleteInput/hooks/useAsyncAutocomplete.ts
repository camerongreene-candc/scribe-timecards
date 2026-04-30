import { useEffect, useState } from 'react';

import useDebounce from './useDebounce';
import type { AutocompleteOptionItem } from '../types';

interface UseAsyncAutocompleteOptions {
  loadOptions?: (inputValue: string) => Promise<AutocompleteOptionItem[]>;
  inputValue: string;
  debounceMs: number;
  minChars: number;
  enabled: boolean;
}

interface UseAsyncAutocompleteResult {
  options: AutocompleteOptionItem[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for async autocomplete data loading with debounce
 *
 * @param options - Configuration options
 * @returns Object containing options, loading state, and error
 */
export function useAsyncAutocomplete({
  loadOptions,
  inputValue,
  debounceMs,
  minChars,
  enabled,
}: UseAsyncAutocompleteOptions): UseAsyncAutocompleteResult {
  const [options, setOptions] = useState<AutocompleteOptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debounce the input value
  const debouncedInputValue = useDebounce(inputValue, debounceMs);

  // Load options when debounced value changes
  useEffect(() => {
    if (!enabled || !loadOptions) {
      return;
    }

    // Don't search if below minimum characters
    if (debouncedInputValue.length < minChars) {
      setOptions([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchOptions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await loadOptions(debouncedInputValue);

        if (!cancelled) {
          setOptions(results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error('Failed to load options')
          );
          setOptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchOptions();

    return () => {
      cancelled = true;
    };
  }, [debouncedInputValue, minChars, enabled, loadOptions]);

  return {
    options,
    isLoading,
    error,
  };
}

export default useAsyncAutocomplete;
