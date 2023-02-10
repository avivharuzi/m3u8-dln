import { chunkArray } from './chunck-array';
import { downloadFile, DownloadFileOptions } from './download-file';

export interface DownloadFileInfo {
  url: string;
  filePath: string;
}

export const downloadFileMulti = (
  downloadFileInfos: DownloadFileInfo[],
  partialOptions: Partial<DownloadFileOptions>
): Promise<void>[] =>
  downloadFileInfos.map(({ url, filePath }) =>
    downloadFile(url, filePath, partialOptions)
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
