import * as http from 'node:http';

import { DownloadAndConvertM3U8Input } from './download-and-convert-m3u8';
import { M3U8DownloadMetadataStream } from './get-m3u8-download-metadata';

export interface ConvertToDownloadAndConvertM3U8InputsOptions {
  segmentBatch: number;
  httpHeaders: http.IncomingHttpHeaders;
  isWithAudio: boolean;
  audioM3U8FilePathRecord: Record<string, string>;
}

export const convertToDownloadAndConvertM3U8Inputs = (
  metadataStreams: M3U8DownloadMetadataStream[],
  {
    segmentBatch,
    httpHeaders,
    isWithAudio,
    audioM3U8FilePathRecord,
  }: ConvertToDownloadAndConvertM3U8InputsOptions
): DownloadAndConvertM3U8Input[] => {
  return metadataStreams
    .filter((metadataStream) => {
      if (!isWithAudio) {
        return true;
      }

      // If it's stream with audio check it has audio m3u8 file.
      const { audioMetadataId } = metadataStream;

      return audioMetadataId && audioM3U8FilePathRecord[audioMetadataId];
    })
    .map((metadataStream) => {
      const { audioMetadataId } = metadataStream;

      return {
        metadata: metadataStream,
        downloadFileBatch: segmentBatch,
        downloadFileOptions: {
          headers: httpHeaders,
        },
        // If it's with audio extract the m3u8 file.
        m3u8AudioFilePath: isWithAudio
          ? audioM3U8FilePathRecord[audioMetadataId as string]
          : null,
      };
    });
};
