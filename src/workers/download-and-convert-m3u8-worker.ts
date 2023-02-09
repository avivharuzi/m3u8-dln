import {
  ChildProcessMessage,
  downloadAndConvertM3U8,
  DownloadAndConvertM3U8Input,
  DownloadAndConvertM3U8Output,
} from '../utils';

process.on(
  'message',
  async (input: DownloadAndConvertM3U8Input): Promise<void> => {
    if (!process.send) {
      return;
    }

    try {
      const output = await downloadAndConvertM3U8(input);

      process.send({
        status: 'success',
        result: output,
        error: null,
      } as ChildProcessMessage<DownloadAndConvertM3U8Output>);
    } catch (error) {
      process.send({
        status: 'error',
        error,
      } as ChildProcessMessage<DownloadAndConvertM3U8Output>);
    }
  }
);
