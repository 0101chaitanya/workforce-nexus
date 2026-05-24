let navigateFn = null;

/**
 * Binds the **React Router navigate function** for external context access (e.g., inside `axios` interceptors).
 * @param {Function} fn - React Router navigate function instance.
 */
export const setNavigate = (fn) => {
  navigateFn = fn;
};

/**
 * Triggers **client-side route navigation**. Falls back to `window.location` if router is not bound.
 * @param {string} to - Destination path.
 * @param {Object} [options] - Navigation options.
 */
export const navigate = (to, options) => {
  if (navigateFn) {
    navigateFn(to, options);
  } else {
    window.location.href = to;
  }
};

