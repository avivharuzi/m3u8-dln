import path from 'node:path';

import { createDir } from './create-dir.js';
import {
  filterM3U8VideoStreams,
  FilterM3U8VideoStreamsOptions,
} from './filter-m3u8-video-streams.js';
import { generateUUID } from './generate-uuid.js';
import {
  M3U8AudioStream,
  M3U8VideoStream,
  parseM3U8Url,
  ParseM3U8UrlOptions,
  ParseM3U8UrlResponse,
  ParseM3U8UrlResponseM3U8,
} from './parse-m3u8-url.js';

export interface M3U8DownloadMetadata {
  audios: Record<string, M3U8DownloadMetadataStream>;
  videos: M3U8DownloadMetadataStream[];
  videosWithAudio: M3U8DownloadMetadataStream[];
}

export interface M3U8DownloadMetadataStream {
  m3u8: ParseM3U8UrlResponseM3U8;
  m3u8TargetDir: string;
  outputFilePath: string | null;
  audioMetadataId: string | null;
}

export interface M3U8DownloadMetadataOptions {
  outputPath: string;
  parseM3U8UrlOptions: ParseM3U8UrlOptions;
  filterVideoStreamsOptions: FilterM3U8VideoStreamsOptions;
}

export const getM3U8DownloadMetadataAudio = async (
  audioStream: M3U8AudioStream,
  { parseM3U8UrlOptions }: M3U8DownloadMetadataOptions
): Promise<M3U8DownloadMetadataStream> => {
  const { url, id } = audioStream;

  // Create new directory in order to avoid duplicate of segments from other streams.
  const newTargetDir = path.join(parseM3U8UrlOptions.targetDir, generateUUID());

  await createDir(newTargetDir);

  const { m3u8 } = await parseM3U8Url(url, {
    ...parseM3U8UrlOptions,
    targetDir: newTargetDir,
  });

  if (!m3u8) {
    throw new Error(
      `There was a problem to parse m3u8 audio stream, url: ${url}`
    );
  }

  return {
    m3u8,
    m3u8TargetDir: newTargetDir,
    outputFilePath: null,
    audioMetadataId: id,
  };
};

export const getM3U8DownloadMetadataAudios = (
  audioStreams: M3U8AudioStream[],
  options: M3U8DownloadMetadataOptions
): Promise<M3U8DownloadMetadataStream>[] => {
  return audioStreams.map((audioStream) =>
    getM3U8DownloadMetadataAudio(audioStream, options)
  );
};

export const getM3U8DownloadMetadataVideo = async (
  videoStream: M3U8VideoStream,
  { outputPath, parseM3U8UrlOptions }: M3U8DownloadMetadataOptions
): Promise<M3U8DownloadMetadataStream> => {
  const { url, resolution, frameRate, audioStreamId } = videoStream;

  // Create new directory in order to avoid duplicate of segments from other streams.
  const newTargetDir = path.join(parseM3U8UrlOptions.targetDir, generateUUID());

  await createDir(newTargetDir);

  const { m3u8 } = await parseM3U8Url(url, {
    ...parseM3U8UrlOptions,
    targetDir: newTargetDir,
  });

  if (!m3u8) {
    throw new Error(
      `There was a problem to parse m3u8 video stream, url: ${url}`
    );
  }

  // Create output file path with video info.
  const outputFilePath = path.join(
    outputPath,
    `${generateUUID()}_${resolution.width}x${
      resolution.height
    }_${frameRate}.mp4`
  );

  return {
    m3u8,
    m3u8TargetDir: newTargetDir,
    outputFilePath,
    audioMetadataId: audioStreamId || null,
  };
};

export const getM3U8DownloadMetadataVideos = (
  videoStreams: M3U8VideoStream[],
  options: M3U8DownloadMetadataOptions
): Promise<M3U8DownloadMetadataStream>[] => {
  return videoStreams.map((videoStream) =>
    getM3U8DownloadMetadataVideo(videoStream, options)
  );
};

/**
 * Extract metadata before downloading m3u8 streams from parsed m3u8 file.
 *
 * Tries to get m3u8 stream information.
 * Decide to which directory to save.
 */
export const getM3U8DownloadMetadata = async (
  parsedResponse: ParseM3U8UrlResponse,
  {
    outputPath,
    parseM3U8UrlOptions,
    filterVideoStreamsOptions,
  }: M3U8DownloadMetadataOptions
): Promise<M3U8DownloadMetadata> => {
  let metadata: M3U8DownloadMetadata = {
    audios: {},
    videos: [],
    videosWithAudio: [],
  };

  const { targetDir } = parseM3U8UrlOptions;

  // If we have only one m3u8 stream.
  if (parsedResponse.m3u8) {
    const outputFilePath = path.join(outputPath, `${generateUUID()}.mp4`);

    metadata = {
      ...metadata,
      videos: [
        ...metadata.videos,
        {
          m3u8: parsedResponse.m3u8,
          m3u8TargetDir: targetDir,
          outputFilePath,
          audioMetadataId: null,
        },
      ],
    };
  }

  // If we have video streams to get information about them.
  if (parsedResponse.videoStreams) {
    let audios: Record<string, M3U8DownloadMetadataStream> = {};

    if (parsedResponse.audioStreams) {
      const metadataAudios = await Promise.all(
        getM3U8DownloadMetadataAudios(
          Object.values(parsedResponse.audioStreams),
          {
            outputPath,
            parseM3U8UrlOptions,
            filterVideoStreamsOptions,
          }
        )
      );

      metadataAudios.forEach((metadataAudio) => {
        if (metadataAudio.audioMetadataId) {
          audios[metadataAudio.audioMetadataId] = metadataAudio;
        }
      });
    }

    // Try to filter out videos before gathering metadata.
    const videoStreams = filterM3U8VideoStreams(
      parsedResponse.videoStreams,
      filterVideoStreamsOptions
    );

    const metadataVideos = await Promise.all(
      getM3U8DownloadMetadataVideos(videoStreams, {
        outputPath,
        parseM3U8UrlOptions,
        filterVideoStreamsOptions,
      })
    );

    const videos = metadataVideos.filter(
      (metadataVideo) => !metadataVideo.audioMetadataId
    );
    const videosWithAudio = metadataVideos.filter(
      (metadataVideo) =>
        metadataVideo.audioMetadataId && audios[metadataVideo.audioMetadataId]
    );

    metadata = {
      ...metadata,
      audios: {
        ...metadata.audios,
        ...audios,
      },
      videos: [...metadata.videos, ...videos],
      videosWithAudio: [...metadata.videosWithAudio, ...videosWithAudio],
    };
  }

  return metadata;
};
