# 🤖 AI-Writer

[![Version](https://img.shields.io/badge/Version-v1.2.0-blue.svg)](https://github.com/wuleiyuan/ai-writer/releases)
[![Node](https://img.shields.io/badge/Node-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/wuleiyuan/ai-writer?style=social)](https://github.com/wuleiyuan/ai-writer/stargazers)

> 🇨🇳 中文 | [English](./README_EN.md)

**AI 写作助手** - 一键将 AI 学习记录、文章链接整理成公众号文章，支持多平台发布！

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| 📋 **一键整理** | 剪贴板/文件/URL 自动整理成文章 |
| 🎨 **公众号格式** | 自动生成适合公众号的 HTML 样式（绿色主题） |
| 🌐 **多平台发布** | 支持 WordPress、博客园、掘金、知乎、CSDN 一键发布 |
| 🤖 **AI 驱动** | 调用 Ollama/Qwen 本地大模型 |
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

# 📁 批量处理目录中的所有文件
./ai-writer.js batch ./my-notes/

# 📤 发布文章到配置的平台
./ai-writer.js publish 生成的markdown文件.md
./ai-writer.js publish 生成的markdown文件.md --publish  # 直接发布
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

# 掘金配置 (需要Cookie)
export JUEJIN_COOKIE=your-cookie-string
export JUEJIN_CSRF_TOKEN=your-csrf-token

# 知乎配置 (需要Cookie)
export ZHIHU_COOKIE=your-cookie-string
export ZHIHU_Z_C0=your-z-c0-token

# CSDN配置 (需要Cookie)
export CSDN_COOKIE=your-cookie-string
export CSDN_USERNAME=your-username
```

### 使用示例

```bash
# 生成文章后一键发布
./ai-writer.js publish ~/ai-writer-output/2025-02-26-文章.md

# 直接发布到所有配置的平台
./ai-writer.js publish article.md --publish
```

## 📁 项目结构

```
ai-writer/
├── ai-writer.js           # 主程序
├── publishers/            # 多平台发布模块
│   ├── index.js         # 统一发布入口
│   ├── wordpress.js      # WordPress 发布器
│   ├── cnblogs.js       # 博客园发布器
│   ├── juejin.js        # 掘金发布器
│   ├── zhihu.js         # 知乎发布器
│   └── csdn.js          # CSDN 发布器
├── package.json          # 项目配置
└── .env.example         # 环境变量示例
```

## 📊 支持的模型

| 模型 | 配置 | 说明 |
|------|------|------|
| Qwen 2.5 | `OLLAMA_MODEL=qwen2.5:14b` | 默认，推荐 |
| Llama 3 | `OLLAMA_MODEL=llama3:8b` | 可选 |
| ChatGPT | `OPENAI_API_KEY=xxx` | 需要 API Key |

## 🛠️ 高级配置

### 公众号粘贴技巧

1. 用浏览器打开生成的 HTML 文件
2. 全选复制内容
3. 粘贴到公众号编辑器
4. 样式会自动保留（绿色主题，更适合公众号）

### 自定义模型

```bash
# 使用不同的模型
OLLAMA_MODEL=llama3:8b ./ai-writer.js "你的内容"

# 或修改 .env 文件
OLLAMA_MODEL=glm4:9b
```

### 批量处理

将多个对话记录或笔记放到一个目录中：

```bash
./ai-writer.js batch ./my-ai-chats/
```

程序会：
1. 读取目录中所有 `.txt` 和 `.md` 文件
2. 逐个调用 AI 整理成文章
3. 输出到 `~/ai-writer-output/` 目录

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 License

MIT License - 查看 [LICENSE](LICENSE) 了解详情

---

**⭐ 如果这个项目对你有帮助，请点个 Star 支持一下！**
