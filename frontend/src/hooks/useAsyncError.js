import { useState } from 'react';

export function useAsyncError() {
  const [error, setError] = useState('');

  const handleAsyncError = (err) => {
    const message = err.response?.data?.message || err.message || 'An error occurred';
    setError(message);
  };

  const clearError = () => setError('');

  return {
    error,
    setError,
    handleAsyncError,
    clearError
  };
}
