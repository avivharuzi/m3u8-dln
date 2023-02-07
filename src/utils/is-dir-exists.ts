import * as fs from 'node:fs';

export const isDirExists = async (dir: string): Promise<boolean> => {
  try {
    const stat = await fs.promises.stat(dir);

    return stat.isDirectory();
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  }
};
