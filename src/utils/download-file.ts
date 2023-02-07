import * as fs from 'node:fs';
import * as http from 'node:http';

export interface DownloadFileOptions {
  headers: http.OutgoingHttpHeaders;
}

const getDefaultDownloadFileOptions = (): DownloadFileOptions => {
  return {
    headers: {},
  };
};

const downloadFile = async (
  url: string,
  targetFilePath: string,
  partialOptions: Partial<DownloadFileOptions>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { headers }: DownloadFileOptions = {
      ...getDefaultDownloadFileOptions(),
      ...partialOptions,
    };

    const request = http.get(
      url,
      {
        headers,
      },
      (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Request failed with status code: ${response.statusCode}`)
          );
        }

        // Start download to the target file path.
        response.pipe(fs.createWriteStream(targetFilePath));

        response.on('end', () => {
          // File downloaded successfully.
          resolve();
        });
      }
    );

    request.on('error', reject);
  });
};
