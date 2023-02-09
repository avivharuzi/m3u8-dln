import { fork } from 'node:child_process';
import * as path from 'node:path';

import { ChildProcessMessage } from './child-process-message';
import { chunkArray } from './chunck-array';
import {
  DownloadAndConvertM3U8Input,
  DownloadAndConvertM3U8Output,
} from './download-and-convert-m3u8';

export const downloadAndConvertM3U8InChildProcess = (
  input: DownloadAndConvertM3U8Input
): Promise<DownloadAndConvertM3U8Output> => {
  return new Promise((resolve, reject) => {
    const childProcess = fork(
      path.join(
        __dirname,
        '..',
        'workers',
        'download-and-convert-m3u8-worker.js'
      )
    );

    childProcess.send(input);

    childProcess.on(
      'message',
      (message: ChildProcessMessage<DownloadAndConvertM3U8Output>) => {
        if (message.status === 'success') {
          resolve(message.result);
        } else {
          reject(message.error);
        }

        // When got message it finished to download file, so kill the process.
        childProcess.kill();
      }
    );

    childProcess.on('error', (error) => {
      reject(error);
    });
  });
};

export const downloadAndConvertM3U8Multi = (
  inputs: DownloadAndConvertM3U8Input[]
): Promise<DownloadAndConvertM3U8Output>[] =>
  inputs.map((input) => downloadAndConvertM3U8InChildProcess(input));

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
