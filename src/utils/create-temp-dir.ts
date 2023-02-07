import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { generateUUID } from './generate-uuid';

export const createTempDir = (): Promise<string> =>
  fs.promises.mkdtemp(
    path.join(os.tmpdir(), `m3u8-dln-temp-${generateUUID()}-`)
  );
