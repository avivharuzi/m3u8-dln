import * as nodeUrl from 'node:url';

export const getFilenameFromUrl = (url: string): string => {
  const { pathname } = nodeUrl.parse(url);

  if (!pathname) {
    throw new Error(`Couldn't find path from url, url: ${url}`);
  }

  return pathname.split('/').at(-1);
};
