import * as fs from 'node:fs';

/**
 * Returns text file content.
 */
export const getFileContent = async (filePath: string): Promise<string> =>
  fs.promises.readFile(filePath, {
    encoding: 'utf-8',
  });
