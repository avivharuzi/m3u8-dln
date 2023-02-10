import { exec } from 'node:child_process';

/**
 * Execute terminal command in new process.
 */
export const execCommand = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);

        return;
      }

      resolve(stdout.trim());
    });
  });
};
