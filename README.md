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

- [Features](#✨-Features)
- [Prerequisites](#🎯-Prerequisites)
- [Installation](#🛠️-Installation)
- [Usage](#⚡️-Usage)
- [License](#📜-License)

## ✨ Features

✅ Vey fast 🏎️

✅ Can be used via CLI or in code

✅ Support m3u8 file from URL or locally from the computer

✅ Support headers and cookies in case of authentication

✅ Can download from m3u8 master playlist and all his videos inside or specfic one

✅ Can merge video and audio together (works only if the m3u8 master playlist was provided)

✅ Can download from multi URL's

✅ Using multi processing

✅ Preserve original quality (without encoding)

## 🎯 Prerequisites

- [ffmpeg](https://ffmpeg.org) (ffmpeg will be used as the last step to create the mp4 file)

## 🛠️ Installation

Using via code (for CLI no need to install locally).

```
npm i m3u8-dln
```

## ⚡️ Usage

Using via CLI.

```sh
npx m3u8-dln
```

## 📜 License

[MIT](LICENSE)
