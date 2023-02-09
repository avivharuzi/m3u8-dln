/**
 * Very simple function that merge default object with optional one.
 */
export const mergeOptions = <T>(
  defaultOptions: T,
  partialOptions: Partial<T>
): T => {
  return {
    ...defaultOptions,
    ...partialOptions,
  };
};
