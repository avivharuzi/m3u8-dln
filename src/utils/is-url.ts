export const isURL = (str: string): boolean => {
  const pattern = /(http(s?)):\/\//i;

  return pattern.test(str);
};
