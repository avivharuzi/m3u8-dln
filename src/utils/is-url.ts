export const isURL = (str: string): boolean => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // HTTP protocol.
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // Domain name.
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // Port and path.
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // Query string.
      '(\\#[-a-z\\d_]*)?$', // Fragment locater.
    'i'
  );

  return pattern.test(str);
};
