import * as fs from 'node:fs';

import { isDirExists } from './is-dir-exists';

export const deleteDir = async (dir: string): Promise<void> => {
  if (!(await isDirExists(dir))) {
    return;
  }

  return fs.promises.rm(dir, {
    force: true,
    maxRetries: 5,
    recursive: true,
    retryDelay: 4000,
  });
};
