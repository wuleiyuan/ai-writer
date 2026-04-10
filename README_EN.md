# 🤖 AI-Writer

[![Version](https://img.shields.io/badge/Version-v1.3.0-blue.svg)](https://github.com/wuleiyuan/ai-writer/releases)
[![Node](https://img.shields.io/badge/Node-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/wuleiyuan/ai-writer?style=social)](https://github.com/wuleiyuan/ai-writer/stargazers)

> 🇬🇧 English | [中文](./README_ZH.md)

**AI Writing Assistant** - One-click to organize AI learning notes, article links into WeChat public account articles with multi-platform publishing support!

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/wuleiyuan/ai-writer?quickstart=1)

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌐 **Web Interface** | Click to use, no CLI needed |
| 📋 **One-Click Organize** | Clipboard/file/URL auto-organized into articles |
| 🎨 **WeChat Format** | Auto-generate WeChat-compatible HTML (green theme) |
| 📺 **Video to Article** | BiliBili, YouTube video auto-transcribed |
| 🎨 **AI Cover** | Auto-generate article cover (DALL-E) |
| 🌐 **Multi-Platform** | WordPress, 博客园, 掘金, 知乎, CSDN, WeChat |
| 🤖 **AI Powered** | Ollama/Qwen/DeepSeek/Kimi/OpenAI |
| 📦 **Batch Processing** | Process multiple files |
| 📋 **Lazy Mode** | Copy & paste to auto-organize |

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/wuleiyuan/ai-writer.git
cd ai-writer
npm install
chmod +x ai-writer.js
```

### ⚡ One-Click Start (GitHub Codespaces)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/wuleiyuan/ai-writer?quickstart=1)

### Web Interface

```bash
npm run web
# Visit http://localhost:3000
```

### Basic Usage

```bash
# 📋 Lazy mode: read from clipboard
./ai-writer.js clipboard

# 💬 Organize AI chat records
./ai-writer.js chat conversation.txt

# 🔗 Organize link + notes
./ai-writer.js link https://article.com "My thoughts"

# 📺 Organize video content (BiliBili/YouTube)
./ai-writer.js video https://bilibili.com/video/BVxxx

# 📝 Direct input
./ai-writer.js "What I learned today..."

# 📁 Batch process directory
./ai-writer.js batch ./my-notes/

# 📤 Publish to configured platforms
./ai-writer.js publish article.md
./ai-writer.js publish article.md --publish
```

## 🌐 Web Interface

```
┌─────────────────────────────────────────────────────────┐
│  🤖 AI-Writer Web                                       │
├─────────────────────────────────────────────────────────┤
│  📝 Input           │  📤 Output Preview                │
│  ├─ 📋 Clipboard   │  ├─ Markdown  │  WeChat Preview  │
│  ├─ 📄 Text Input   │  └─ Copy/Download                 │
│  ├─ 🔗 Link         │                                        │
│  └─ 📺 Video        │  🚀 Publish                         │
│                      │  └─ WordPress/CSDN/Juejin/WeChat   │
│  🎨 AI Cover Gen    │                                        │
└─────────────────────────────────────────────────────────┘
```

## 📤 Multi-Platform Publishing

### Supported Platforms

| Platform | API | Description |
|----------|-----|-------------|
| WordPress | ✅ | REST API |
| 博客园 | ✅ | XML-RPC |
| 掘金 | ✅ | Cookie Auth |
| 知乎 | ✅ | Cookie Auth |
| CSDN | ✅ | Cookie Auth |
| 小红书 | ✅ | Cookie Auth |
| **WeChat** | ✅ | Draft API (Enterprise) |

### Environment Variables

```bash
# WordPress
export WP_SITE_URL=https://yourblog.com
export WP_USERNAME=your-username
export WP_PASSWORD=your-app-password

# WeChat Public Account (Enterprise)
export WECHAT_APP_ID=your-app-id
export WECHAT_APP_SECRET=your-app-secret
```

## 📁 Project Structure

```
ai-writer/
├── ai-writer.js           # CLI main program
├── web/
│   ├── server.js          # Express web server
│   └── public/
│       └── index.html     # Web UI
├── publishers/            # Multi-platform publisher
│   ├── index.js         # Factory
│   ├── base.js          # Base class
│   └── *.js             # Individual platforms
├── src/
│   ├── videoConverter.js  # Video parsing
│   └── imageGenerator.js # AI cover
├── .github/
│   ├── workflows/        # GitHub Actions
│   ├── CONTRIBUTING.md   # Contributing guide
│   └── CODEOWNERS        # Code owners
└── .devcontainer/        # GitHub Codespaces
```

## 📊 Supported Models

| Model | Config | Note |
|-------|--------|------|
| Qwen 2.5 | `OLLAMA_MODEL=qwen2.5:14b` | Default, recommended |
| Llama 3 | `OLLAMA_MODEL=llama3:8b` | Optional |
| DeepSeek | `DEEPSEEK_API_KEY=xxx` | Cloud API |
| Kimi | `KIMI_API_KEY=xxx` | Cloud API |
| ChatGPT | `OPENAI_API_KEY=xxx` | Cloud API |

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

**⭐ If this project helps you, please give it a Star!**
