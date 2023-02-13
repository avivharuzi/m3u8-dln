<div align="center">
  <h1>m3u8-dln</h1>
  <p>A complete m3u8 downloader 📺</p>
  <p>An npm package and CLI tool to download M3U8/HLS streams and merge all the chunks to a MP4 video.</p>
  <p>    
    <img alt="NPM" src="https://img.shields.io/npm/v/m3u8-dln?style=for-the-badge">
    <img alt="GitHub" src="https://img.shields.io/github/license/avivharuzi/m3u8-dln?style=for-the-badge">
  </p>
  <p>
    <a href="https://github.com/github_username/m3u8-dln/issues">Report Bug</a>
    ·
    <a href="https://github.com/github_username/m3u8-dln/issues">Request Feature</a>
  </p>
</div>

---

## 📖 Table of Contents

- [Features](#-Features)
- [Prerequisites](#-Prerequisites)
- [Installation](#-Installation)
- [Usage](#-Usage)
- [License](#-License)

## ✨ Features

✅ Vey fast 🏎️

✅ Can be used via CLI or in code

✅ Support http headers in case of authentication

✅ Can download from m3u8 master playlist and all his videos inside or specific one

✅ Can merge video and audio together (works only if the m3u8 master playlist was provided)

✅ Preserve original quality (without encoding)

## 🎯 Prerequisites

- [ffmpeg](https://ffmpeg.org) (ffmpeg will be used as the last step to create the mp4 file)

## 🛠️ Installation

Using via code (for CLI no need to install locally).

> NOTE: The package is using esm modules!

Install the package locally.

```
npm i m3u8-dln
```

Basic example.

```ts
import { m3u8DLN } from 'm3u8-dln';

await m3u8DLN('https://www.example.com/some-path/master.m3u8', './');
```

With options.

```ts
import { m3u8DLN } from 'm3u8-dln';

const response = await m3u8DLN(
  'https://www.example.com/some-path/master.m3u8',
  './',
  {
    httpHeaders: {}, // HTTP headers that can be pass to the http calls.
    segmentBatch: 8, // The number of segment files to download at the same time.
    streamBatch: 4, // The number of streams to download at the same time.
    streamSelection: {
      strategy: 'highest-resolution', // Choose what streams to download.
    },
  }
);

console.log(response); // [{ outputFilePaths: ['ced0b1120d6954b6229bbbc12c162c6a_1920x1080_25.mp4'] }]
```

## ⚡️ Usage

Using via CLI.

```sh
npx m3u8-dln --help
```

Download example with input.

```sh
npx m3u8-dln -i https://www.example.com/some-path/master.m3u8
```

## 📜 License

[MIT](LICENSE)
