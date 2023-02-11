import fs from 'node:fs';

export const createDir = async (path: string): Promise<void> => {
  await fs.promises.mkdir(path, {
    recursive: true,
  });
};
