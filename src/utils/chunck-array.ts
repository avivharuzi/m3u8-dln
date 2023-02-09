/**
 * Chunks array to multiple arrays by size.
 *
 * @example
 *
 * [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] -> [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
 */
export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  return arr.length > size
    ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
    : [arr];
};
