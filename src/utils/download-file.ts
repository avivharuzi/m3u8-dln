import * as fs from 'node:fs';
import * as http from 'node:http';
import * as https from 'node:https';
import * as nodeUrl from 'node:url';

export interface DownloadFileOptions {
  headers: http.OutgoingHttpHeaders;
}

export const getDefaultDownloadFileOptions = (): DownloadFileOptions => {
  return {
    headers: {},
  };
};

export const downloadFile = async (
  url: string,
  targetFilePath: string,
  partialOptions: Partial<DownloadFileOptions>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { headers }: DownloadFileOptions = {
      ...getDefaultDownloadFileOptions(),
      ...partialOptions,
    };

    const parsedUrl = nodeUrl.parse(url);
    const httpModule = parsedUrl.protocol === 'https:' ? https : http;

    const request = httpModule.get(
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
