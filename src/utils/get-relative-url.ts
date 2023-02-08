export const getRelativeUrl = (url: string): string => {
  const urlSplitted = url.split('/');

  return urlSplitted
    .filter((_, index) => index < urlSplitted.length - 1)
    .join('/');
};
