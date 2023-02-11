import { M3U8VideoStream } from './parse-m3u8-url.js';

export type filterM3U8VideoStreamsStrategy =
  | 'all'
  | 'first-one'
  | 'last-one'
  | 'highest-bandwidth'
  | 'highest-resolution';

export interface filterM3U8VideoStreamsOptions {
  strategy: filterM3U8VideoStreamsStrategy;
}

const findHighestBandwidth = (
  videoStreams: M3U8VideoStream[]
): M3U8VideoStream => {
  return videoStreams.reduce((acc, curr) =>
    curr.bandwidth > acc.bandwidth ? curr : acc
  );
};

const findHighestResolution = (
  videoStreams: M3U8VideoStream[]
): M3U8VideoStream => {
  return videoStreams.reduce((acc, curr) => {
    const currentRes = curr.resolution.width * curr.resolution.height;

    const highestResValue = acc.resolution.width * acc.resolution.height;

    return currentRes > highestResValue ? curr : acc;
  });
};

export const filterM3U8VideoStreams = (
  videoStreams: M3U8VideoStream[],
  { strategy }: filterM3U8VideoStreamsOptions
): M3U8VideoStream[] => {
  switch (strategy) {
    case 'all':
      return videoStreams;
    case 'first-one':
      const firstVideoStream = videoStreams[0];

      return firstVideoStream ? [firstVideoStream] : [];
    case 'last-one':
      const lastVideoStream = videoStreams.at(-1);

      return lastVideoStream ? [lastVideoStream] : [];
    case 'highest-bandwidth':
      const highestBandwidth = findHighestBandwidth(videoStreams);

      return highestBandwidth ? [highestBandwidth] : [];
    case 'highest-resolution':
      const highestResolution = findHighestResolution(videoStreams);

      return highestResolution ? [highestResolution] : [];
  }
};
