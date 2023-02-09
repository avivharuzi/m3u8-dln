import * as path from 'node:path';

import { buildNewURL } from './build-new-url';
import { getFileNameFromURL } from './get-filename-from-url';
import { getRelativeURL } from './get-relative-url';
import { getURLContent, UrlContentOptions } from './get-url-content';

export enum M3U8DirectiveKey {
  EXTM3U = '#EXTM3U', // File header, must be the first line of the file.
  EXTINF = '#EXTINF', // Track information: runtime in seconds and display title of the following resource.
  EXT_X_PLAYLIST_TYPE = '#EXT-X-PLAYLIST-TYPE', // The playlist type: VOD or EVENT.
  EXT_X_MEDIA = '#EXT-X-MEDIA', // Declares some media information with attributes.
  EXT_X_STREAM_INF = '#EXT-X-STREAM-INF', // Parameters have either one combined value or one per stream, separated by commas.
}

export enum M3U8DirectivePlaylistType {
  VOD = 'VOD',
  EVENT = 'EVENT',
}

export enum M3U8DirectiveMediaAttribute {
  TYPE = 'TYPE',
  GROUP_ID = 'GROUP-ID',
  NAME = 'NAME',
  LANGUAGE = 'LANGUAGE',
  DEFAULT = 'DEFAULT',
  AUTOSELECT = 'AUTOSELECT',
  URI = 'URI',
}

export enum M3U8DirectiveStreamInfAttribute {
  RESOLUTION = 'RESOLUTION',
  CODECS = 'CODECS',
  BANDWIDTH = 'BANDWIDTH',
  FRAME_RATE = 'FRAME-RATE',
  AUDIO = 'AUDIO',
}

export interface M3U8Directive<T extends string = string> {
  line: string;
  key: string;
  value: string;
  attributes: Record<T, string>;
}

export interface M3U8AudioStream {
  id: string;
  url: string;
  fileName: string;
}

export interface M3U8VideoStream {
  url: string;
  fileName: string;
  resolution: M3U8VideoStreamResolution;
  codecs: string;
  bandwidth: number;
  frameRate: number;
  audioStreamId: string | null;
}

export interface M3U8VideoStreamResolution {
  width: number;
  height: number;
}

export interface M3U8StreamSegment {
  url: string;
  fileName: string;
  filePath: string;
}

export interface ParseM3U8UrlOptions {
  urlContentOptions: Partial<UrlContentOptions>;
  targetDir: string;
}

export interface ParseM3U8UrlResponse {
  videoStreams: M3U8VideoStream[];
  audioStreams: Record<string, M3U8AudioStream>; // In order to avoid duplicates of audios we will make a dictionary of the streams.
  m3u8: ParseM3U8UrlResponseM3U8 | null;
}

export interface ParseM3U8UrlResponseM3U8 {
  content: string;
  segments: M3U8StreamSegment[];
}

export const isM3U8Directive = (line: string) => line.startsWith('#');

export const getM3U8DirectivesRecord = (
  directiveLines: string[]
): Record<M3U8DirectiveKey, M3U8Directive | M3U8Directive[]> => {
  return directiveLines.reduce((directivesRecord, line) => {
    const lineSplited = line.split(':');
    const key = (lineSplited[0] || '') as M3U8DirectiveKey;
    const value = lineSplited[1] || '';
    const attributes = value ? extractM3U8DirectiveAttributesRecord(value) : {};

    const directive: M3U8Directive = {
      line,
      key,
      attributes,
      value,
    };

    if (directivesRecord[key]) {
      const directivesRecordValue = directivesRecord[key];

      directivesRecord[key] = Array.isArray(directivesRecordValue)
        ? [...directivesRecordValue, directive]
        : [directivesRecordValue, directive];
    } else {
      directivesRecord[key] = directive;
    }

    return directivesRecord;
  }, {} as Record<M3U8DirectiveKey, M3U8Directive | M3U8Directive[]>);
};

export const extractM3U8DirectiveAttributesRecord = <T>(
  line: string
): Record<keyof T, string> => {
  const attributes = line.split(',');

  return attributes.reduce((attributesRecord, attribute) => {
    const [key, value] = attribute.split('=') as [keyof T, string];

    if (!value) {
      return attributesRecord;
    }

    attributesRecord[key] = value.replace(/"/g, '') || '';

    return attributesRecord;
  }, {} as Record<keyof T, string>);
};

export const extractM3U8AudioStream = (
  audioStreamId: string,
  relativeURL: string,
  directivesRecord: Record<M3U8DirectiveKey, M3U8Directive | M3U8Directive[]>
): M3U8AudioStream | null => {
  let mediaDirectives = directivesRecord[M3U8DirectiveKey.EXT_X_MEDIA] as
    | M3U8Directive<M3U8DirectiveMediaAttribute>
    | M3U8Directive<M3U8DirectiveMediaAttribute>[];

  if (!mediaDirectives) {
    return null;
  }

  if (!Array.isArray(mediaDirectives)) {
    mediaDirectives = [mediaDirectives];
  }

  for (const mediaDirective of mediaDirectives) {
    const id = mediaDirective.attributes[M3U8DirectiveMediaAttribute.GROUP_ID];

    if (!id) {
      continue;
    }

    if (id !== audioStreamId) {
      continue;
    }

    const uri = mediaDirective.attributes[M3U8DirectiveMediaAttribute.URI];

    if (!uri) {
      continue;
    }

    const url = buildNewURL(relativeURL, uri);
    const fileName = getFileNameFromURL(url);

    return {
      id,
      url,
      fileName,
    };
  }

  return null;
};

export const parseM3U8Url = async (
  url: string,
  options: ParseM3U8UrlOptions
): Promise<ParseM3U8UrlResponse> => {
  // Init response object.
  let response: ParseM3U8UrlResponse = {
    videoStreams: [],
    audioStreams: {},
    m3u8: null,
  };

  // Get file content.
  const content = await getURLContent(url, options.urlContentOptions);

  // Split all the lines.
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');

  // Check if we have at least one line.
  if (lines.length === 0) {
    throw new Error('M3U8 file content is empty');
  }

  // Extract all directive lines.
  const directiveLines = lines.filter((line) => isM3U8Directive(line));

  // Create map of directives.
  const directivesRecord = getM3U8DirectivesRecord(directiveLines);

  // Check is m3u8 file has required header.
  if (!directivesRecord[M3U8DirectiveKey.EXTM3U]) {
    throw new Error(
      `M3U8 file is invalid, the first line of the file must have: ${M3U8DirectiveKey.EXTM3U}`
    );
  }

  const playlistType = directivesRecord[
    M3U8DirectiveKey.EXT_X_PLAYLIST_TYPE
  ] as M3U8Directive | null;

  // Check if m3u8 is vod.
  const isVOD = playlistType?.value === M3U8DirectivePlaylistType.VOD;

  const relativeURL = getRelativeURL(url);

  if (isVOD) {
    // Collect the segments to download.
    const streamSegments: M3U8StreamSegment[] = [];

    // New m3u8 stream file content.
    const streamContent = lines
      .map((line) => {
        if (isM3U8Directive(line)) {
          return line;
        }

        const url = buildNewURL(relativeURL, line);
        const fileName = getFileNameFromURL(url);
        const filePath = path.join(options.targetDir, fileName);

        streamSegments.push({
          url,
          fileName,
          filePath,
        });

        return filePath;
      })
      .join('\n');

    response = {
      ...response,
      m3u8: {
        content: streamContent,
        segments: streamSegments,
      },
    };
  } else {
    const videoStreams: M3U8VideoStream[] = [];
    const audioStreams: Record<string, M3U8AudioStream> = {};

    const streamDirectivesValues: string[] = [];
    let lastDirectiveKey: M3U8DirectiveKey | null = null;

    lines.forEach((line) => {
      const isDirective = isM3U8Directive(line);

      if (isDirective) {
        const lineSplited = line.split(':');

        lastDirectiveKey = (lineSplited[0] as M3U8DirectiveKey) ?? null;
      } else if (lastDirectiveKey === M3U8DirectiveKey.EXT_X_STREAM_INF) {
        streamDirectivesValues.push(line);
      }
    });

    let streamDirectives = directivesRecord[
      M3U8DirectiveKey.EXT_X_STREAM_INF
    ] as
      | M3U8Directive<M3U8DirectiveStreamInfAttribute>
      | M3U8Directive<M3U8DirectiveStreamInfAttribute>[];

    if (!streamDirectives) {
      throw new Error('Not found M3U8 stream directives');
    }

    if (!Array.isArray(streamDirectives)) {
      streamDirectives = [streamDirectives];
    }

    if (streamDirectives.length !== streamDirectivesValues.length) {
      throw new Error('M3U8 file content has incorrect stream values length');
    }

    streamDirectivesValues.forEach((streamDirectivesValue, index) => {
      const streamDirective = (
        streamDirectives as M3U8Directive<M3U8DirectiveStreamInfAttribute>[]
      )[index];

      if (!streamDirective) {
        throw new Error('Not found stream directive');
      }

      const videoStreamURL = buildNewURL(relativeURL, streamDirectivesValue);
      const fileName = getFileNameFromURL(videoStreamURL);

      const resolutionAttribute =
        streamDirective.attributes[M3U8DirectiveStreamInfAttribute.RESOLUTION];
      const codecsAttribute =
        streamDirective.attributes[M3U8DirectiveStreamInfAttribute.CODECS];
      const bandwidthAttribute =
        streamDirective.attributes[M3U8DirectiveStreamInfAttribute.BANDWIDTH];
      const frameRateAttribute =
        streamDirective.attributes[M3U8DirectiveStreamInfAttribute.FRAME_RATE];
      const audioAttribute =
        streamDirective.attributes[M3U8DirectiveStreamInfAttribute.AUDIO];

      let width = 0;
      let height = 0;
      if (resolutionAttribute) {
        const resolutionAttributeSplitted = resolutionAttribute.split('x');
        width = +resolutionAttributeSplitted[0] || 0;
        height = +resolutionAttributeSplitted[1] || 0;
      }

      const audioStreamId: string | null = audioAttribute || null;

      // Audio stream id not exists in the dictionary add it.
      if (audioStreamId && !audioStreams[audioStreamId]) {
        const audioStream = extractM3U8AudioStream(
          audioStreamId,
          relativeURL,
          directivesRecord
        );

        if (audioStream) {
          audioStreams[audioStreamId] = audioStream;
        }
      }

      videoStreams.push({
        url: videoStreamURL,
        fileName,
        resolution: {
          width,
          height,
        },
        bandwidth: +bandwidthAttribute || 0,
        codecs: codecsAttribute,
        frameRate: +frameRateAttribute || 0,
        audioStreamId,
      });
    });

    response = {
      ...response,
      videoStreams,
      audioStreams,
    };
  }

  return response;
};
