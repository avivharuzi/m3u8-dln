import { isURL } from './is-url';

export const buildNewURL = (url: string, uri: string): string => {
  // Check if uri is already url itself.
  if (isURL(uri)) {
    return uri;
  }

  // Split uri and remove unnecessary . which is the same as without it.
  const uriSplited = uri.split('/').filter((part) => part !== '.');

  // Count the backwards of paths, but remove one because we have always the last occurrence the file name.
  const backwardsCount =
    uriSplited.filter((uriSplit) => uriSplit === '..').length - 1;

  let newURL = url;

  if (backwardsCount > 0) {
    newURL = newURL.split('/').slice(0, -backwardsCount).join('/');
  }

  const newURI = uriSplited.at(-1);

  return `${newURL}/${newURI}`;
};
