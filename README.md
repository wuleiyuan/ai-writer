# 🤖 AI-Writer

[![Version](https://img.shields.io/badge/Version-v1.1.0-blue.svg)](https://github.com/wuleiyuan/ai-writer/releases)
[![Node](https://img.shields.io/badge/Node-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/wuleiyuan/ai-writer?style=social)](https://github.com/wuleiyuan/ai-writer/stargazers)

> 🇨🇳 中文 | [English](./README_EN.md)

**AI 写作助手** - 一键将 AI 学习记录、文章链接整理成公众号文章，支持多平台发布！

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| 📋 **一键整理** | 剪贴板/文件/URL 自动整理成文章 |
| 🎨 **公众号格式** | 自动生成适合公众号的 HTML 样式 |
| 🌐 **多平台发布** | 支持 WordPress、博客园一键发布 |
| 🤖 **AI 驱动** | 调用 Ollama/Qwen 本地大模型 |
| 📦 **开箱即用** | 零配置先体验，默认本地模型 |

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

### 基本使用

```bash
# 📋 最懒人：直接读取剪贴板
./ai-writer.js clipboard
# 或
./ai-writer.js -c

# 💬 整理 AI 对话记录
./ai-writer.js chat 对话记录.txt

# 🔗 整理链接 + 个人理解
./ai-writer.js link https://文章链接.com "我的理解"

# 📝 直接输入内容
./ai-writer.js "今天学习了什么..."

# 📤 发布文章到配置的平台
./ai-writer.js publish 生成的markdown文件.md
./ai-writer.js publish 生成的markdown文件.md --publish  # 直接发布
```

## 📤 多平台发布

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
```

### 使用示例

```bash
# 生成文章后一键发布
./ai-writer.js publish ~/ai-writer-output/2025-02-26-文章.md

# 直接发布到 WordPress
./ai-writer.js publish article.md --publish
```

## 📁 项目结构

```
ai-writer/
├── ai-writer.js           # 主程序
├── publishers/            # 多平台发布模块
│   ├── index.js         # 统一发布入口
│   ├── wordpress.js      # WordPress 发布器
│   └── cnblogs.js       # 博客园发布器
├── package.json          # 项目配置
└── .env.example         # 环境变量示例
```

## 📊 支持的模型

| 模型 | 配置 | 说明 |
|------|------|------|
| Qwen 2.5 | `OLLAMA_MODEL=qwen2.5:14b` | 默认，推荐 |
| Llama 3 | `OLLAMA_MODEL=llama3:8b` | 可选 |
| ChatGPT | `OPENAI_API_KEY=xxx` | 需要 API Key |

## 📈 功能对比

| 功能 | 免费版 | Pro 版 |
|------|--------|--------|
| 剪贴板整理 | ✅ | ✅ |
| AI 对话整理 | ✅ | ✅ |
| URL 内容整理 | ✅ | ✅ |
| 公众号 HTML | ✅ | ✅ |
| WordPress 发布 | ✅ | ✅ |
| 博客园发布 | ✅ | ✅ |
| 知乎发布 | 🚧 | ✅ |
| 批量发布 | 🚧 | ✅ |

## 🛠️ 高级配置

### 公众号粘贴技巧

1. 用浏览器打开生成的 HTML 文件
2. 全选复制内容
3. 粘贴到公众号编辑器
4. 样式会自动保留

### 自定义模型

```bash
# 使用不同的模型
OLLAMA_MODEL=llama3:8b ./ai-writer.js "你的内容"

# 或修改 .env 文件
OLLAMA_MODEL=glm4:9b
```

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 License

MIT License - 查看 [LICENSE](LICENSE) 了解详情

---

**⭐ 如果这个项目对你有帮助，请点个 Star 支持一下！**
