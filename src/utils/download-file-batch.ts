import { fork } from 'node:child_process';
import * as path from 'node:path';

import { ChildProcessMessage } from './child-process-message';
import { chunkArray } from './chunck-array';
import { DownloadFileOptions } from './download-file';

export interface DownloadFileInfo {
  url: string;
  filePath: string;
}

export const downloadFileInChildProcess = (
  url: string,
  filePath: string,
  partialOptions: Partial<DownloadFileOptions>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const childProcess = fork(
      path.join(__dirname, '..', 'workers', 'download-file-worker.js')
    );

    childProcess.send({ url, filePath, partialOptions });

    childProcess.on('message', (message: ChildProcessMessage) => {
      if (message.status === 'success') {
        resolve();
      } else {
        reject(message.error);
      }

      // When got message it finished to download file, so kill the process.
      childProcess.kill();
    });

    childProcess.on('error', (error) => {
      reject(error);
    });
  });
};

export const downloadFileMulti = (
  downloadFileInfos: DownloadFileInfo[],
  partialOptions: Partial<DownloadFileOptions>
): Promise<void>[] =>
  downloadFileInfos.map(({ url, filePath }) =>
    downloadFileInChildProcess(url, filePath, partialOptions)
  );

export const downloadFileBatch = async (
  downloadFileInfos: DownloadFileInfo[],
  partialOptions: Partial<DownloadFileOptions>,
  batch: number
): Promise<void> => {
  const chunks = chunkArray(downloadFileInfos, batch);

  for await (const chunk of chunks) {
    await Promise.all(downloadFileMulti(chunk, partialOptions));
  }
};
