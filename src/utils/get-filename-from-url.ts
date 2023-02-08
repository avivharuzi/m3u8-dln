import * as nodeUrl from 'node:url';

export const getFilenameFromUrl = (url: string): string => {
  const { pathname } = nodeUrl.parse(url);

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
