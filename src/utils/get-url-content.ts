import * as http from 'node:http';
import * as https from 'node:https';
import * as nodeURL from 'node:url';

import { mergeOptions } from './merge-options';

export interface UrlContentOptions {
  headers: http.OutgoingHttpHeaders;
}

export const getDefaultUrlContentOptions = (): UrlContentOptions => {
  return {
    headers: {},
  };
};

export const getURLContent = async (
  url: string,
  partialOptions: Partial<UrlContentOptions> = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const { headers } = mergeOptions(
      getDefaultUrlContentOptions(),
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

        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          resolve(data);
        });
      }
    );

    request.on('error', reject);
  });
};
