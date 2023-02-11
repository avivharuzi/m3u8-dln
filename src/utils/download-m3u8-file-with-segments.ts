import path from 'node:path';

import { createTextFile } from './create-text-file.js';
import { downloadFileBatch, DownloadFileInfo } from './download-file-batch.js';
import { DownloadFileOptions } from './download-file.js';
import { generateUUID } from './generate-uuid.js';
import { ParseM3U8UrlResponseM3U8 } from './parse-m3u8-url.js';

export interface DownloadM3U8FileWithSegmentsOptions {
  workingDir: string;
  downloadFileOptions: Partial<DownloadFileOptions>;
  batch: number;
}

export const downloadM3U8FileWithSegments = async (
  m3u8: ParseM3U8UrlResponseM3U8,
  {
    workingDir,
    downloadFileOptions,
    batch,
  }: DownloadM3U8FileWithSegmentsOptions
): Promise<string> => {
  const m3u8FileName = `${generateUUID()}.m3u8`;
  const m3u8FilePath = path.join(workingDir, m3u8FileName);

  await createTextFile(m3u8FilePath, m3u8.content);

  const downloadFileInfos: DownloadFileInfo[] = m3u8.segments.map(
    ({ url, filePath }) => {
      return {
        url,
        filePath,
      };
    }
  );

  await downloadFileBatch(downloadFileInfos, downloadFileOptions, batch);

  return m3u8FilePath;
};
