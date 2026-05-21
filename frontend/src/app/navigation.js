let navigateFn = null;

export const setNavigate = (fn) => {
  navigateFn = fn;
};

export const navigate = (to, options) => {
  if (navigateFn) {
    navigateFn(to, options);
  } else {
    window.location.href = to;
  }
};
