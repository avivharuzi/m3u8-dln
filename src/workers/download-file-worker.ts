import { downloadFile, DownloadFileOptions } from '../utils';

export interface DownloadFileWorkerArgs {
  url: string;
  targetFilePath: string;
  partialOptions: Partial<DownloadFileOptions>;
}

process.on(
  'message',
  async ({
    url,
    targetFilePath,
    partialOptions,
  }: DownloadFileWorkerArgs): Promise<void> => {
    if (!process.send) {
      return;
    }

    try {
      await downloadFile(url, targetFilePath, partialOptions);
      process.send({ status: 'success' });
    } catch (error) {
      process.send({ status: 'error', error });
    }
  }
);
