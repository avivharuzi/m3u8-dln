#!/usr/bin/env node
import { resolve } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { getDefaultM3U8DLNOptions, m3u8DLN } from './index.js';
import { FilterM3U8VideoStreamsStrategy } from './utils/index.js';

const defaultOptions = getDefaultM3U8DLNOptions();

const argv = await yargs(hideBin(process.argv))
  .options('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    describe: 'M3U8 url or file path',
  })
  .options('outputPath', {
    alias: 'o',
    type: 'string',
    describe: 'The output path directory for the MP4 files',
    default: process.cwd(),
  })
  .options('httpHeaders', {
    type: 'string',
    describe: 'HTTP Headers is JSON format that will pass to the http requests',
  })
  .options('segmentBatch', {
    type: 'number',
    describe: 'The number of segment files to download at the same time',
    default: defaultOptions.segmentBatch,
  })
  .options('streamBatch', {
    type: 'number',
    describe: 'The number of streams to download at the same time',
    default: defaultOptions.streamBatch,
  })
  .options('streamStrategy', {
    alias: 'ss',
    type: 'string',
    choices: [
      'all',
      'first-one',
      'last-one',
      'highest-bandwidth',
      'highest-resolution',
    ],
    default: defaultOptions.streamSelection.strategy,
  }).argv;

const {
  input,
  outputPath,
  httpHeaders,
  segmentBatch,
  streamBatch,
  streamStrategy,
} = argv;

await m3u8DLN(input, resolve(outputPath), {
  httpHeaders: httpHeaders ? JSON.parse(httpHeaders) : {},
  segmentBatch,
  streamBatch,
  streamSelection: {
    strategy: streamStrategy as FilterM3U8VideoStreamsStrategy,
  },
});
