import { AxiosError } from 'axios';

/**
 * Reusable API error handler.
 * Can be integrated with toast notifications (e.g., from shadcn/sonner)
 */
export const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message;
    console.error(`API Error: ${message}`);
    // TODO: Trigger a UI toast notification here
    return message;
  }
  
  console.error('An unexpected error occurred:', error);
  return 'An unexpected error occurred';
};

/**
 * Reusable API success handler.
 */
export const handleApiSuccess = (message: string) => {
  console.log(`Success: ${message}`);
  // TODO: Trigger a UI toast notification here
};
