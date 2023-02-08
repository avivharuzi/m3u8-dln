import { fork } from 'node:child_process';
import * as path from 'node:path';

import { chunkArray } from './chunck-array';
import { DownloadFileOptions } from './download-file';

export interface DownloadFileInfo {
  url: string;
  fileName: string;
}

export const downloadFileInChildProcess = (
  url: string,
  targetFilePath: string,
  partialOptions: Partial<DownloadFileOptions> = {}
) => {
  return new Promise((resolve, reject) => {
    const childProcess = fork(
      path.join(__dirname, '..', 'workers', 'download-file-worker.js')
    );

    childProcess.send({ url, targetFilePath, partialOptions });

    childProcess.on('message', (message) => {
      resolve(message);
      childProcess.kill();
    });

    childProcess.on('error', (error) => {
      reject(error);
    });
  });
};

export const downloadFileMulti = (
  downloadFileInfos: DownloadFileInfo[],
  targetDir: string,
  partialOptions: Partial<DownloadFileOptions> = {}
) =>
  downloadFileInfos.map((downloadFileInfo) =>
    downloadFileInChildProcess(
      downloadFileInfo.url,
      path.join(targetDir, downloadFileInfo.fileName),
      partialOptions
    )
  );

export const downloadFileBatch = async (
  downloadFileInfos: DownloadFileInfo[],
  targetDir: string,
  partialOptions: Partial<DownloadFileOptions> = {},
  batch: number
) => {
  const chunks = chunkArray(downloadFileInfos, batch);

  for await (const chunk of chunks) {
    await Promise.all(downloadFileMulti(chunk, targetDir, partialOptions));
  }
};
