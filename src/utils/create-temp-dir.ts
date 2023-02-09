import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { generateUUID } from './generate-uuid';

export const createTempDir = (prefix: string): Promise<string> =>
  fs.promises.mkdtemp(
    path.join(os.tmpdir(), `${prefix}-temp-${generateUUID()}-`)
  );
