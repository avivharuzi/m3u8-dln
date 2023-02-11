import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import nodeURL from 'node:url';

import { mergeOptions } from './merge-options.js';

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
  filePath: string,
  partialOptions: Partial<DownloadFileOptions>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { headers } = mergeOptions(
      getDefaultDownloadFileOptions(),
      partialOptions
    );

    const parsedURL = nodeURL.parse(url);
    const httpModule = parsedURL.protocol === 'https:' ? https : http;

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
        response.pipe(fs.createWriteStream(filePath));

        response.on('end', () => {
          // File downloaded successfully.
          resolve();
        });
      }
    );

    request.on('error', reject);
  });
};
