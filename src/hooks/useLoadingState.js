import { useState } from 'react';

export function useLoadingState(initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);
  const startLoading = () => {
    setLoading(true);
    clearError();
  };
  const stopLoading = () => setLoading(false);

  return {
    loading,
    setLoading,
    error,
    setError,
    clearError,
    startLoading,
    stopLoading,
  };
}
