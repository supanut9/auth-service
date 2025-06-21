import { Elysia } from 'elysia';

// Define a custom error interface for your specific UNKNOWN errors
// This tells TypeScript what shape to expect.
interface MyCustomError extends Error {
  error: string;
  // You already have 'message' from the base Error class
}

// Define the handler as a function (plugin) that accepts the app instance
export const errorHandler = (app: Elysia) => {
  return app.onError(({ code, error, set }) => {
    console.error(error); // Keep this for debugging!

    if (code === 'VALIDATION') {
      set.status = 400;

      const validationError = error.all[0];

      if (
        validationError &&
        'path' in validationError &&
        'message' in validationError
      ) {
        const errorCode = `INVALID_${validationError.path
          .substring(1)
          .toUpperCase()}`;

        return {
          status: 400,
          error: errorCode,
          errorMessage: validationError.message,
        };
      }

      return {
        status: 400,
        error: 'VALIDATION_FAILED',
        errorMessage: 'The request body is invalid.',
      };
    }

    if (code === 'UNKNOWN') {
      set.status = 400;

      // --- TYPE GUARD ---
      // Check if the 'error' property exists on the error object before accessing it.
      if (error && typeof (error as MyCustomError).error === 'string') {
        const customError = error as MyCustomError;
        return {
          status: 400,
          error: customError.error,
          error_description: customError.message, // Use customError to access the typed properties
        };
      }

      // Fallback for generic UNKNOWN errors that don't match your custom shape
      return {
        status: 500, // Or another appropriate status for unexpected errors
        error: 'INTERNAL_SERVER_ERROR',
        error_description: error.message, // Safely access the standard 'message' property
      };
    }

    // Default error handler for all other Elysia-specific errors (e.g., 'NOT_FOUND')
    // It's better to explicitly cast 'error' to access 'status' here too,
    // or handle it more gracefully.
    const statusCode = (error as any).status || 500;
    return {
      status: statusCode,
      error: code,
      error_description: (error as any).message,
    };
  });
};
