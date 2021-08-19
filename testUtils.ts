export const shadowConsole = (fn: "log" | "error" | "warn") => {
  // eslint-disable-next-line no-console
  const shadowed = console[fn];

  // eslint-disable-next-line no-console
  console[fn] = () => {};

  return () => {
    // eslint-disable-next-line no-console
    console[fn] = shadowed;
  };
};
