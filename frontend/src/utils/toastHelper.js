import { toast } from 'react-toastify';

/**
 * Robust error toast handler that parses backend error responses.
 * If errors are returned in an array (under data.errors or data.message),
 * it displays a separate toast notification for each error.
 * 
 * @param {any} err - The error object (Axios error, standard Error, or string).
 * @param {string} fallback - The fallback message if no specific error message is found.
 */
export const toastError = (err, fallback = 'An error occurred') => {
  if (!err) {
    toast.error(fallback);
    return;
  }

  // 1. If err is directly a string
  if (typeof err === 'string') {
    toast.error(err);
    return;
  }

  const data = err?.response?.data;
  if (data) {
    // 2. Check if the backend returned an 'errors' array (e.g. Zod validation errors)
    if (Array.isArray(data.errors)) {
      data.errors.forEach((e) => {
        const msg = typeof e === 'string' ? e : (e.message || e.msg || JSON.stringify(e));
        if (msg) toast.error(msg);
      });
      return;
    }

    // 3. Check if the backend returned a 'message' array
    if (Array.isArray(data.message)) {
      data.message.forEach((msg) => {
        const text = typeof msg === 'string' ? msg : (msg.message || msg.msg || JSON.stringify(msg));
        if (text) toast.error(text);
      });
      return;
    }

    // 4. Check if 'message' is a non-empty string
    if (typeof data.message === 'string' && data.message.trim()) {
      toast.error(data.message);
      return;
    }
  }

  // 5. Fallback to standard error message property if present
  if (err.message && typeof err.message === 'string' && err.message.trim()) {
    toast.error(err.message);
    return;
  }

  // 6. Fallback message
  toast.error(fallback);
};
