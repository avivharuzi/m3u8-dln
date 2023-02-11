import { DownloadFileOptions } from './download-file.js';
import { downloadM3U8FileWithSegments } from './download-m3u8-file-with-segments.js';
import { M3U8DownloadMetadataStream } from './get-m3u8-download-metadata.js';
import { m3u8ToMP4 } from './m3u8-to-mp4.js';

export interface DownloadAndConvertM3U8Input {
  metadata: M3U8DownloadMetadataStream;
  m3u8AudioFilePath: string | null;
  downloadFileBatch: number;
  downloadFileOptions: DownloadFileOptions;
}

export interface DownloadAndConvertM3U8Output {
  m3u8FilePath: string;
  outputFilePath: string | null;
  audioMetadataId: string | null;
}

export const downloadAndConvertM3U8 = async ({
  metadata,
  m3u8AudioFilePath,
  downloadFileBatch,
  downloadFileOptions,
}: DownloadAndConvertM3U8Input): Promise<DownloadAndConvertM3U8Output> => {
  const { m3u8, m3u8TargetDir, outputFilePath, audioMetadataId } = metadata;

  const m3u8FilePath = await downloadM3U8FileWithSegments(m3u8, {
    workingDir: m3u8TargetDir,
    batch: downloadFileBatch,
    downloadFileOptions,
  });

  // Check if we have output file path convert m3u8 to mp4.
  if (outputFilePath) {
    await m3u8ToMP4(
      {
        m3u8VideoFilePath: m3u8FilePath,
        m3u8AudioFilePath,
      },
      outputFilePath
    );
  }

  return {
    m3u8FilePath,
    outputFilePath,
    audioMetadataId,
  };
};

export const extractOutputFilePathsFromDownloadAndConvertM3U8Outputs = (
  outputs: DownloadAndConvertM3U8Output[]
): string[] => {
  return outputs
    .filter((output) => output.outputFilePath)
    .map((output) => output.outputFilePath as string);
};
