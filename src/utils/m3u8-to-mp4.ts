import { execCommand } from './exec-command';

export interface M3U8ToMP4Input {
  videoFilePath: string;
  audioFilePath?: string;
}

export const M3U8ToMP4 = async (
  { videoFilePath, audioFilePath }: M3U8ToMP4Input,
  outputFilePath: string
): Promise<void> => {
  let command = '';
  if (audioFilePath) {
    command = `ffmpeg -y -i ${videoFilePath} -i ${audioFilePath} -c copy -map 0:v:0 -map 1:a:0 ${outputFilePath}`;
  } else {
    command = `ffmpeg -y -i ${videoFilePath} -c copy ${outputFilePath}`;
  }

  await execCommand(command);
};
