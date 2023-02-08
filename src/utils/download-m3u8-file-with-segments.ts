import * as fs from 'node:fs';
import * as path from 'node:path';

import { DownloadFileOptions } from './download-file';
import { downloadFileBatch, DownloadFileInfo } from './download-file-batch';
import { generateUUID } from './generate-uuid';
import { ParseM3U8UrlResponseM3U8 } from './parse-m3u8-url';

export interface DownloadM3U8FileWithSegmentsOptions {
  workingDir: string;
  downloadOptions: Partial<DownloadFileOptions>;
  batch: number;
}

export const downloadM3U8FileWithSegments = async (
  m3u8: ParseM3U8UrlResponseM3U8,
  { workingDir, downloadOptions, batch }: DownloadM3U8FileWithSegmentsOptions
): Promise<string> => {
  const m3u8FileName = `${generateUUID()}.m3u8`;
  const m3u8FilePath = path.join(workingDir, m3u8FileName);

  await fs.promises.writeFile(m3u8FilePath, m3u8.content, {
    encoding: 'utf-8',
  });

  const fileInfos: DownloadFileInfo[] = m3u8.segments.map(
    ({ fileName, url }) => {
      return {
        fileName,
        url,
      };
    }
  );

  await downloadFileBatch(fileInfos, workingDir, downloadOptions, batch);

  return m3u8FilePath;
};
