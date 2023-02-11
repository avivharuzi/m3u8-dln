import fs from 'node:fs';

/**
 * Checks if directory exists.
 */
export const isDirExists = async (dir: string): Promise<boolean> => {
  try {
    const stat = await fs.promises.stat(dir);

    return stat.isDirectory();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false;
    } else {
      throw error;
    }
  }
};
