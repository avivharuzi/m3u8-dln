/**
 * Checks if the provided string is url that have to start with http:// or https://.
 *
 * @example
 *
 * 'http://www.google.com' -> true
 * 'https://www.google.com' -> true
 * 'www.google.com' -> false
 */
export const isURL = (str: string): boolean => {
  const pattern = /(http(s?)):\/\//i;

  return pattern.test(str);
};
