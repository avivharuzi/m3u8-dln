import {
  ChildProcessMessage,
  downloadFile,
  DownloadFileOptions,
} from '../utils';

interface DownloadFileWorkerArgs {
  url: string;
  filePath: string;
  partialOptions: Partial<DownloadFileOptions>;
}

process.on(
  'message',
  async ({
    url,
    filePath,
    partialOptions,
  }: DownloadFileWorkerArgs): Promise<void> => {
    if (!process.send) {
      return;
    }

    try {
      await downloadFile(url, filePath, partialOptions);
      process.send({ status: 'success' } as ChildProcessMessage);
    } catch (error) {
      process.send({ status: 'error', error } as ChildProcessMessage);
    }
  }
);
