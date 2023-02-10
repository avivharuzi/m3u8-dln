import * as http from 'node:http';

import {
  convertToDownloadAndConvertM3U8Inputs,
  ConvertToDownloadAndConvertM3U8InputsOptions,
  createTempDir,
  deleteDir,
  downloadAndConvertM3U8Batch,
  extractOutputFilePathsFromDownloadAndConvertM3U8Outputs,
  getM3U8DownloadMetadata,
  mergeOptions,
  parseM3U8Url,
  ParseM3U8UrlOptions,
} from './utils';

export interface M3U8DLNOptions {
  httpHeaders: http.IncomingHttpHeaders; // HTTP headers that can be pass to the http calls.
  segmentBatch: number; // The number of segment files to download at the same time.
  streamBatch: number; // The number of streams to download at the same time.
}

export interface M3U8DLNResponse {
  outputFilePaths: string[];
}

export const getDefaultM3U8DLNOptions = (): M3U8DLNOptions => {
  return {
    httpHeaders: {},
    segmentBatch: 8,
    streamBatch: 4,
  };
};

export const m3u8DLN = async (
  input: string,
  outputPath: string,
  partialOptions: Partial<M3U8DLNOptions> = {}
): Promise<M3U8DLNResponse> => {
  let outputFilePaths: string[] = [];

  let workingDir = '';

  try {
    const { httpHeaders, segmentBatch, streamBatch } = mergeOptions(
      getDefaultM3U8DLNOptions(),
      partialOptions
    );

    // Create working directory for the temporary m3u8 and segments files.
    workingDir = await createTempDir('m3u8-dln');

    const parseM3U8UrlOptions: ParseM3U8UrlOptions = {
      urlContentOptions: {
        headers: httpHeaders,
      },
      targetDir: workingDir,
    };

    // Try to parse the first m3u8 input that was provided.
    const m3u8Parsed = await parseM3U8Url(input, parseM3U8UrlOptions);

    // Extract m3u8 metadata before downloading.
    const metadata = await getM3U8DownloadMetadata(m3u8Parsed, {
      outputPath,
      parseM3U8UrlOptions,
    });

    // Create default options for download and convert m3u8.
    const defaultConvertToDownloadAndConvertM3U8InputsOptions: ConvertToDownloadAndConvertM3U8InputsOptions =
      {
        segmentBatch,
        httpHeaders,
        isWithAudio: false,
        audioM3U8FilePathRecord: {},
      };

    const audioInputs = convertToDownloadAndConvertM3U8Inputs(
      Object.values(metadata.audios),
      defaultConvertToDownloadAndConvertM3U8InputsOptions
    );

    const videoInputs = convertToDownloadAndConvertM3U8Inputs(
      metadata.videos,
      defaultConvertToDownloadAndConvertM3U8InputsOptions
    );

    // Download first audio and video streams.
    const [audioOutputs, videoOutputs] = await Promise.all([
      downloadAndConvertM3U8Batch(audioInputs, streamBatch),
      downloadAndConvertM3U8Batch(videoInputs, streamBatch),
    ]);

    // Create object that contain all m3u8 audio files.
    const audioM3U8FilePathRecord = audioOutputs.reduce(
      (audioRecord, { audioMetadataId, m3u8FilePath }) => {
        if (audioMetadataId) {
          audioRecord[audioMetadataId] = m3u8FilePath;
        }

        return audioRecord;
      },
      {} as Record<string, string>
    );

    const videoWithAudioInputs = convertToDownloadAndConvertM3U8Inputs(
      metadata.videosWithAudio,
      {
        ...defaultConvertToDownloadAndConvertM3U8InputsOptions,
        isWithAudio: true,
        audioM3U8FilePathRecord,
      }
    );

    // Download video with audio streams.
    const videoWithAudioOutputs = await downloadAndConvertM3U8Batch(
      videoWithAudioInputs,
      streamBatch
    );

    const videoOutputFiles =
      extractOutputFilePathsFromDownloadAndConvertM3U8Outputs(videoOutputs);
    const videoWithAudioOutputFiles =
      extractOutputFilePathsFromDownloadAndConvertM3U8Outputs(
        videoWithAudioOutputs
      );

    outputFilePaths = [...videoOutputFiles, ...videoWithAudioOutputFiles];
  } catch (error) {
    // Try to delete the working directory in case of error.
    await deleteDir(workingDir);

    throw error;
  }

  // Delete working directory, no need it anymore after finishing to convert into mp4 files.
  await deleteDir(workingDir);

  return {
    outputFilePaths,
  };
};

export default {
  getDefaultM3U8DLNOptions,
  m3u8DLN,
};
