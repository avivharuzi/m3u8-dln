import { chunkArray } from './chunck-array';
import {
  downloadAndConvertM3U8,
  DownloadAndConvertM3U8Input,
  DownloadAndConvertM3U8Output,
} from './download-and-convert-m3u8';

export const downloadAndConvertM3U8Multi = (
  inputs: DownloadAndConvertM3U8Input[]
): Promise<DownloadAndConvertM3U8Output>[] =>
  inputs.map((input) => downloadAndConvertM3U8(input));

export const downloadAndConvertM3U8Batch = async (
  inputs: DownloadAndConvertM3U8Input[],
  batch: number
): Promise<DownloadAndConvertM3U8Output[]> => {
  let outputs: DownloadAndConvertM3U8Output[] = [];

  const chunks = chunkArray(inputs, batch);

  for await (const chunk of chunks) {
    const multiOutputs = await Promise.all(downloadAndConvertM3U8Multi(chunk));

    outputs = [...outputs, ...multiOutputs];
  }

  return outputs;
};
