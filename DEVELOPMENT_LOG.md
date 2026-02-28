# AI-Writer 开发记录

## 项目概述

**AI 写作助手** - 一键将 AI 学习记录、文章链接整理成公众号文章，支持多平台发布！

**当前版本**: v1.2.0

---

## 两个项目目录的用途

| 目录 | 用途 |
|------|------|
| `/Users/leiyuanwu/网页小游/ai-writer/` | **本地自用工作目录** - 保留隐私配置 (.env 含 API 密钥) |
| `/Users/leiyuanwu/GitHub/ai-writer/` | **GitHub 同步目录** - 干净环境开发测试，验证后同步 |

### 工作流程 (重要)

```
GitHub 目录 (干净环境开发测试)
    ↓
开发、测试、验证
    ↓
同时同步到：
    ├── 本地工作目录 (保留隐私配置)
    └── GitHub 仓库 (公开发布)
```

**核心原则**：
- GitHub 目录是测试验证环境
- 验证通过后再同步两边
- 本地工作目录保留隐私信息
- 出问题可从本地工作目录回滚

---

---

---

## 本次开发内容 (2026-02-28)

### 1. 平台风格转换

- 新增 `style` 命令
- 支持风格: xhs(小红书)、zhihu(知乎)、juejin(掘金)、csdn(CSDN)
- 用法: `ai-writer style xhs <内容>`

### 2. 发布器基类重构

- 新增 `publishers/base.js` 抽象基类
- 所有平台适配器继承 BasePublisher
- 统一生命周期: Transform -> Validate -> Execute
- 各平台可重写 `transform()` 实现自定义转换

### 3. 图片自动上传

- 新增 `publishers/imageUploader.js`
- 支持图床: SM.MS, ImgBB, GitHub
- 自动处理文章中的本地图片

### 4. 小红书发布支持

- 新增 `publishers/xiaohongshu.js`

### 5. 多模型支持

- **Ollama** - 本地免费模型 (默认)
- **DeepSeek** - 免费额度多
- **Kimi** - 免费额度
- **OpenAI** - GPT 系列
- 自动备用

### 3. 配置优化

- 统一 MODEL_PROVIDER 环境变量
- 更清晰的 .env 配置示例
- 详细的模型配置说明

---

## 历史开发内容 (2026-02-27)

### 1. 项目初始化

- 创建 AI-Writer 项目
- 实现核心功能：
  - 剪贴板一键整理
  - AI 对话记录整理
  - 链接 + 笔记整理
  - 公众号 HTML 样式生成

### 2. 多平台发布支持

- **WordPress** - REST API
- **博客园** - XML-RPC
- **掘金** - Cookie 认证
- **知乎** - Cookie 认证
- **CSDN** - Cookie 认证

### 3. 批量处理功能

- 支持批量处理目录下所有文件
- 命令: `./ai-writer.js batch <目录>`

### 4. 样式优化

- 公众号绿色主题风格 (#07c160)
- 代码高亮优化
- 响应式布局

---

## Git 操作记录

### 本次提交

| Commit | 描述 |
|--------|------|
| `314b605` | feat: 添加平台风格转换功能(style命令) |
| `8010e4a` | feat: v1.2.0 - 多平台发布支持(掘金/知乎/CSDN)、批量处理、优化样式 |
| `7abadca` | feat: 初始化AI写作助手 |

### 同步命令

```bash
# 同步到本地目录
rsync -av --exclude='.git' --exclude='__pycache__' --exclude='.env' --exclude='node_modules' --exclude='*.log' /Users/leiyuanwu/GitHub/ai-writer/ /Users/leiyuanwu/网页小游/ai-writer/

# 推送 GitHub
cd /Users/leiyuanwu/GitHub/ai-writer && git push origin main
```

---

## 版本历史

| 版本 | 日期 | 描述 |
|------|------|------|
| 1.0.0 | 2026-02-26 | 初始版本 - 基础文章整理功能 |
| 1.1.0 | 2026-02-26 | 多平台发布支持 (WordPress, 博客园) |
| 1.2.0 | 2026-02-27 | 新增掘金/知乎/CSDN发布、批量处理、优化样式 |
| 1.3.0 | 2026-02-28 | 新增小红书发布、多模型支持(DeepSeek/Kimi)、优化配置 |

---

## 已知问题

- 第三方平台 (掘金/知乎/CSDN) 需要 Cookie 认证，配置较复杂
- 个人订阅号无法通过 API 发布公众号文章

---

## 常用命令

```bash
# 进入本地工作目录
cd /Users/leiyuanwu/网页小游/ai-writer

# 测试运行
node ai-writer.js -c

# 批量处理
node ai-writer.js batch ./notes/

# 发布文章
node ai-writer.js publish article.md --publish
```

---

*最后更新: 2026-02-27*
