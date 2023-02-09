/**
 * Will return the url without the last occurrence of path, query and fragment.
 *
 * @example
 *
 * 'https://www.google.com/some-path/master.m3u8?q=some-query#some-fragment' -> 'https://www.google.com/some-path'
 */
export const getRelativeURL = (url: string): string => {
  const urlSplitted = url.split('/');

  return urlSplitted
    .filter((_, index) => index < urlSplitted.length - 1)
    .join('/');
};
