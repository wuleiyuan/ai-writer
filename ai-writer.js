#!/usr/bin/env node

require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:14b';
const OUTPUT_DIR = path.join(process.env.HOME || process.env.USERPROFILE, 'ai-writer-output');

// 多平台发布
const { MultiPublisher, loadConfigFromEnv } = require('./publishers');

function log(msg, type = 'info') {
  const colors = { info: '📘', success: '✅', error: '❌', process: '🔄' };
  console.log(`${colors[type] || '📘'} ${msg}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function fetchUrlContent(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function callOllama(prompt) {
  log('🤖 调用AI整理中...', 'process');
  
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false
    })
  });
  
  const data = await response.json();
  return data.response;
}

function generateArticlePrompt(content, type) {
  const typePrompts = {
    chat: `你是一位资深技术博主。请将下面的AI对话记录整理成一篇优质的公众号技术文章。

要求：
1. 标题要吸引人，包含关键词
2. 内容要有逻辑，分段落
3. 代码片段用代码块包裹
4. 关键步骤用加粗或列表标注
5. 文章结尾可以添加思考或总结
6. 输出为Markdown格式

对话记录：
${content}`,
    
    link: `你是一位资深技术博主。请结合原文链接内容和我的个人理解，整理成一篇优质的公众号文章。

要求：
1. 标题要吸引人
2. 先简要介绍原文核心观点
3. 融入我的个人理解和思考
4. 有自己的见解和延伸
5. 段落清晰，逻辑通顺
6. 输出为Markdown格式

原文链接内容/摘要：
${content}`,
    
    default: `你是一位资深技术博主。请将下面的内容整理成一篇优质的公众号文章。

要求：
1. 标题要吸引人
2. 内容有逻辑，有深度
3. 适当加入个人见解
4. 输出为Markdown格式

内容：
${content}`
  };
  
  return typePrompts[type] || typePrompts.default;
}

async function publishToPlatforms(article, options = {}) {
  const config = loadConfigFromEnv();
  
  if (Object.keys(config).length === 0) {
    log('⚠️ 未配置任何发布平台，跳过发布', 'info');
    log('💡 配置环境变量启用发布:', 'info');
    log('   WP_SITE_URL, WP_USERNAME, WP_PASSWORD - WordPress', 'info');
    log('   CNBLOGS_BLOGNAME, CNBLOGS_USERNAME, CNBLOGS_PASSWORD - 博客园', 'info');
    return [];
  }
  
  const publisher = new MultiPublisher(config);
  log(`📤 已配置平台: ${publisher.getConfiguredPlatforms().join(', ')}`, 'info');
  
  return await publisher.publish(article, options);
}

function generateHtml(article, title) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; color: #333; }
    h1 { color: #1a1a1a; font-size: 28px; border-bottom: 2px solid #007aff; padding-bottom: 10px; }
    h2 { color: #2c2c2c; font-size: 22px; margin-top: 30px; }
    h3 { color: #3c3c3c; font-size: 18px; }
    p { margin: 15px 0; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', Consolas, monospace; }
    pre { background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; color: inherit; }
    blockquote { border-left: 4px solid #007aff; margin: 15px 0; padding: 10px 15px; background: #f8f9fa; color: #666; }
    ul, ol { padding-left: 25px; }
    li { margin: 8px 0; }
    a { color: #007aff; }
    strong { color: #007aff; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 14px; }
  </style>
</head>
<body>
${article}
<div class="footer">本文由AI写作助手生成</div>
</body>
</html>`;
}

async function main() {
  ensureDir(OUTPUT_DIR);
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  log('🚀 AI写作助手启动', 'info');
  
  let content = '';
  let type = 'default';
  
  if (command === 'chat') {
    type = 'chat';
    const filePath = args[1];
    if (filePath && fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf-8');
    } else if (filePath) {
      log('文件不存在: ' + filePath, 'error');
      process.exit(1);
    } else {
      log('请提供对话记录文件路径', 'error');
      process.exit(1);
    }
  } else if (command === 'link') {
    type = 'link';
    const url = args[1];
    const note = args.slice(2).join(' ');
    
    if (!url) {
      log('请提供链接URL', 'error');
      process.exit(1);
    }
    
    try {
      log('🌐 抓取网页内容中...', 'process');
      const pageContent = await fetchUrlContent(url);
      content = `URL: ${url}\n\n我的理解:\n${note}\n\n网页内容摘要:\n${pageContent.substring(0, 5000)}`;
    } catch (e) {
      content = `URL: ${url}\n\n我的理解:\n${note}`;
    }
  } else if (command === 'publish') {
    // 发布模式
    const articleFile = args[1];
    if (!articleFile || !fs.existsSync(articleFile)) {
      log('请提供要发布的文章文件路径', 'error');
      process.exit(1);
    }
    
    content = fs.readFileSync(articleFile, 'utf-8');
    const publishOptions = {
      status: args.includes('--publish') ? 'publish' : 'draft',
      title: args.find(a => a.startsWith('--title='))?.replace('--title=', '')
    };
    
    const results = await publishToPlatforms(content, publishOptions);
    
    const successCount = results.filter(r => r.success).length;
    log(`📊 发布完成: ${successCount}/${results.length} 成功`, 'info');
    process.exit(0);
    
} else if (command === 'clipboard' || command === '-c') {
    try {
      content = execSync('pbpaste', { encoding: 'utf-8' }).trim();
      if (!content) {
        log('剪贴板为空，请先复制内容', 'error');
        process.exit(1);
      }
      log('📋 已读取剪贴板内容', 'success');
      
      if (content.includes('http')) {
        type = 'link';
        const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[1] : '';
        const note = content.replace(url, '').trim();
        try {
          log('🌐 抓取网页内容中...', 'process');
          const pageContent = await fetchUrlContent(url);
          content = `URL: ${url}\n\n我的理解:\n${note}\n\n网页内容摘要:\n${pageContent.substring(0, 5000)}`;
        } catch (e) {
          content = `URL: ${url}\n\n我的理解:\n${note}`;
        }
      } else {
        type = 'chat';
      }
    } catch (e) {
      log('读取剪贴板失败，请确保在Mac系统运行', 'error');
      process.exit(1);
    }
  } else if (args.length > 0 && fs.existsSync(args[0])) {
    content = fs.readFileSync(args[0], 'utf-8');
    type = content.includes('对话') || content.includes('AI:') || content.includes('User:') ? 'chat' : 'default';
  } else if (args.length > 0) {
    content = args.join(' ');
    type = content.includes('http') ? 'link' : 'default';
  } else {
    log('\n📖 使用方式:\n');
    log('  ai-writer chat <对话文件>           # 整理AI对话记录', 'info');
    log('  ai-writer link <URL> <我的理解>     # 整理链接+笔记', 'info');
    log('  ai-writer clipboard                 # 直接读取剪贴板自动整理', 'info');
    log('  ai-writer <文件>                    # 读取文件内容', 'info');
    log('  ai-writer "<内容>"                  # 直接输入内容', 'info');
    log('  ai-writer publish <文件>             # 发布文章到配置的平台', 'info');
    log('  ai-writer publish <文件> --publish  # 直接发布', 'info');
    log('\n💡 提示: 推荐使用 clipboard 模式最懒人！', 'process');
    process.exit(0);
  }
  
  const prompt = generateArticlePrompt(content, type);
  const article = await callOllama(prompt);
  
  const titleMatch = article.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'AI学习文章';
  const timestamp = new Date().toISOString().slice(0, 10);
  
  const mdFile = path.join(OUTPUT_DIR, `${timestamp}-文章.md`);
  const htmlFile = path.join(OUTPUT_DIR, `${timestamp}-文章.html`);
  
  fs.writeFileSync(mdFile, article, 'utf-8');
  fs.writeFileSync(htmlFile, generateHtml(article, title), 'utf-8');
  
  log(`✅ 文章已生成!`, 'success');
  log(`📄 Markdown: ${mdFile}`, 'info');
  log(`🌐 HTML: ${htmlFile}`, 'info');
  
  console.log('\n' + '='.repeat(50));
  console.log('📝 文章预览:');
  console.log('='.repeat(50));
  console.log(article.substring(0, 2000));
  if (article.length > 2000) console.log('\n... (更多内容请查看生成的文件)');
}

main().catch(err => {
  log('错误: ' + err.message, 'error');
  process.exit(1);
});
