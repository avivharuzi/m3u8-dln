import { isURL } from './is-url';

export const buildNewUrl = (relativeUrl: string, uri: string): string => {
  // Check if uri is already full url.
  if (isURL(uri)) {
    return uri;
  }

  const uriSplited = uri.split('/').filter((part) => part !== '.');

  const backwardsCount =
    uriSplited.filter((uriSplit) => uriSplit === '..').length - 1;

  let baseUrl = relativeUrl;

  if (backwardsCount > 0) {
    baseUrl = baseUrl.split('/').slice(0, -backwardsCount).join('/');
  }

  const newUri = uriSplited.at(-1);

  return `${baseUrl}/${newUri}`;
};
