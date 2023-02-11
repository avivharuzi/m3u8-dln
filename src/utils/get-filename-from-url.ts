import nodeURL from 'node:url';

/**
 * Extract file name from URL.
 *
 * @example
 *
 * 'https://www.google.com/some-path/master.m3u8?q=some-query#some-fragment' -> 'master.m3u8'
 */
export const getFileNameFromURL = (url: string): string => {
  const { pathname } = nodeURL.parse(url);

  if (!pathname) {
    throw new Error(`Couldn't find path from url, url: ${url}`);
  }

  const fileName = pathname.split('/').at(-1);

  if (!fileName) {
    throw new Error(
      `There was a problem to find fileName from url, url: ${url}`
    );
  }

  return fileName;
};
