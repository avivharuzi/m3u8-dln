import * as http from 'node:http';
import * as https from 'node:https';
import * as nodeUrl from 'node:url';

export interface UrlContentOptions {
  headers: http.OutgoingHttpHeaders;
}

export const getDefaultUrlContentOptions = (): UrlContentOptions => {
  return {
    headers: {},
  };
};

export const getUrlContent = async (
  url: string,
  partialOptions: Partial<UrlContentOptions> = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const { headers }: UrlContentOptions = {
      ...getDefaultUrlContentOptions(),
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
