# 🤖 AI-Writer

[![Version](https://img.shields.io/badge/Version-v1.3.0-blue.svg)](https://github.com/wuleiyuan/ai-writer/releases)
[![Node](https://img.shields.io/badge/Node-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/wuleiyuan/ai-writer?style=social)](https://github.com/wuleiyuan/ai-writer/stargazers)

> 🇨🇳 中文 | [English](./README_EN.md)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/wuleiyuan/ai-writer?quickstart=1)

**AI 写作助手** - 一键将 AI 学习记录、文章链接整理成公众号文章，支持多平台发布！

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| 🌐 **Web 界面** | 点击即可使用，无需命令行 |
| 📋 **一键整理** | 剪贴板/文件/URL 自动整理成文章 |
| 🎨 **公众号格式** | 自动生成适合公众号的 HTML 样式（绿色主题） |
| 📺 **视频转文章** | B站、YouTube 视频自动转文字文章 |
| 🎨 **AI 封面** | 自动生成文章封面图（DALL-E） |
| 🌐 **多平台发布** | 支持 WordPress、博客园、掘金、知乎、CSDN、微信公众号一键发布 |
| 🤖 **AI 驱动** | 支持 Ollama/Qwen/DeepSeek/Kimi/OpenAI 本地大模型 |
| 📦 **批量处理** | 支持批量处理多个文件 |
| 📋 **懒人模式** | 复制粘贴即可自动整理 |

## 🚀 快速开始

### 安装

```bash
git clone https://github.com/wuleiyuan/ai-writer.git
cd ai-writer
npm install
chmod +x ai-writer.js
```

### 配置

```bash
cp .env.example .env
# 编辑 .env 设置你的模型 (默认使用本地 Ollama)
```

### Web 界面启动

```bash
npm run web
# 访问 http://localhost:3000
```

### 基本使用

```bash
# 📋 最懒人：直接读取剪贴板
./ai-writer.js clipboard

# 💬 整理 AI 对话记录
./ai-writer.js chat 对话记录.txt

# 🔗 整理链接 + 个人理解
./ai-writer.js link https://文章链接.com "我的理解"

# 📺 整理视频内容 (B站/YouTube)
./ai-writer.js video https://bilibili.com/video/BVxxx

# 📝 直接输入内容
./ai-writer.js "今天学习了什么..."

# 📁 批量处理目录中的所有文件
./ai-writer.js batch ./my-notes/

# 📤 发布文章到配置的平台
./ai-writer.js publish 生成的markdown文件.md
./ai-writer.js publish 生成的markdown文件.md --publish  # 直接发布
```

## 🌐 Web 界面功能

```
┌─────────────────────────────────────────────────────────┐
│  🤖 AI-Writer Web                                       │
├─────────────────────────────────────────────────────────┤
│  📝 输入内容    │  📤 输出预览                          │
│  ├─ 📋 剪贴板   │  ├─ Markdown  │  公众号预览          │
│  ├─ 📄 文本输入 │  └─ 复制/下载                         │
│  ├─ 🔗 链接     │                                        │
│  └─ 📺 视频     │  🚀 一键发布                          │
│                  │  └─ WordPress/CSDN/掘金/知乎/公众号   │
│  🎨 AI 封面生成 │                                        │
└─────────────────────────────────────────────────────────┘
```

## 📤 多平台发布

### 支持的平台

| 平台 | API支持 | 说明 |
|------|---------|------|
| WordPress | ✅ | REST API |
| 博客园 | ✅ | XML-RPC |
| 掘金 | ✅ | Cookie认证 |
| 知乎 | ✅ | Cookie认证 |
| CSDN | ✅ | Cookie认证 |
| 小红书 | ✅ | Cookie认证 |
| **微信公众号** | ✅ | 草稿箱 API (企业认证) |

### 环境变量配置

```bash
# WordPress 配置
export WP_SITE_URL=https://yourblog.com
export WP_USERNAME=your-username
export WP_PASSWORD=your-app-password

# 博客园配置
export CNBLOGS_BLOGNAME=your-blog-name
export CNBLOGS_USERNAME=your-username
export CNBLOGS_PASSWORD=your-password

# 微信公众号配置 (新增!)
export WECHAT_APP_ID=your-app-id
export WECHAT_APP_SECRET=your-app-secret
```

## 📁 项目结构

```
ai-writer/
├── ai-writer.js           # CLI 主程序
├── web/
│   ├── server.js          # Web 服务
│   └── public/
│       └── index.html     # Web 界面
├── publishers/            # 多平台发布模块
│   ├── index.js         # 统一发布入口
│   ├── base.js          # 基类
│   ├── wordpress.js     # WordPress
│   ├── cnblogs.js       # 博客园
│   ├── juejin.js        # 掘金
│   ├── zhihu.js         # 知乎
│   ├── csdn.js          # CSDN
│   ├── xiaohongshu.js   # 小红书
│   └── wechat.js        # 微信公众号 (新增!)
├── src/
│   ├── videoConverter.js  # 视频解析
│   └── imageGenerator.js # AI 封面生成
├── package.json
└── .env.example
```

## 📊 支持的模型

| 模型 | 配置 | 说明 |
|------|------|------|
| Qwen 2.5 | `OLLAMA_MODEL=qwen2.5:14b` | 默认，推荐 |
| Llama 3 | `OLLAMA_MODEL=llama3:8b` | 可选 |
| DeepSeek | `DEEPSEEK_API_KEY=xxx` | 云端 API |
| Kimi | `KIMI_API_KEY=xxx` | 云端 API |
| ChatGPT | `OPENAI_API_KEY=xxx` | 云端 API |

## 🛠️ 高级配置

### 视频转文章

支持 B站、YouTube 视频链接自动提取字幕并生成文章：

```bash
./ai-writer.js video https://bilibili.com/video/BVxxx
./ai-writer.js video https://youtube.com/watch?v=xxx
```

### AI 封面生成

在 Web 界面输入标题即可自动生成封面图（需要 OpenAI API Key）。

### 公众号粘贴技巧

1. 用浏览器打开生成的 HTML 文件
2. 全选复制内容
3. 粘贴到公众号编辑器
4. 样式会自动保留（绿色主题，更适合公众号）

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 License

MIT License - 查看 [LICENSE](LICENSE) 了解详情

---

**⭐ 如果这个项目对你有帮助，请点个 Star 支持一下！**
