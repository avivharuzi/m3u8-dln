import { execCommand } from './exec-command.js';

export interface M3U8ToMP4Input {
  m3u8VideoFilePath: string;
  m3u8AudioFilePath: string | null;
}

export const m3u8ToMP4 = async (
  { m3u8VideoFilePath, m3u8AudioFilePath }: M3U8ToMP4Input,
  outputFilePath: string
): Promise<void> => {
  let command = '';

  if (m3u8AudioFilePath) {
    command = `ffmpeg -y -i ${m3u8VideoFilePath} -i ${m3u8AudioFilePath} -c copy -map 0:v:0 -map 1:a:0 ${outputFilePath}`;
  } else {
    command = `ffmpeg -y -i ${m3u8VideoFilePath} -c copy ${outputFilePath}`;
  }

  await execCommand(command);
};
