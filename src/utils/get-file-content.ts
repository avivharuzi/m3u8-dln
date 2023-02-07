import * as fs from 'node:fs';

export const getFileContent = async (filePath: string): Promise<string> =>
  fs.promises.readFile(filePath, {
    encoding: 'utf-8',
  });
