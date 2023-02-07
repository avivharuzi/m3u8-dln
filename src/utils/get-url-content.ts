import * as http from 'node:http';

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
  partialOptions: Partial<UrlContentOptions>
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const { headers }: UrlContentOptions = {
      ...getDefaultUrlContentOptions(),
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
