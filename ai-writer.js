#!/usr/bin/env node

require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 模型配置
const MODEL_PROVIDER = process.env.MODEL_PROVIDER || 'ollama'; // ollama, deepseek, kimi, openai
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen:7b-chat-q5_K_M';

// DeepSeek 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// Kimi 配置
const KIMI_API_KEY = process.env.KIMI_API_KEY || '';
const KIMI_MODEL = process.env.KIMI_MODEL || 'moonshot-v1-8k-vision-preview';

// OpenAI 配置
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

const OUTPUT_DIR = '/Users/leiyuanwu/GitHub/ai-writer-output';

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

// 统一的 AI 调用函数
async function callAI(prompt) {
  log(`🤖 调用${getProviderName()}整理中...`, 'process');
  
  try {
    switch (MODEL_PROVIDER) {
      case 'ollama':
        return await callOllama(prompt);
      case 'deepseek':
        return await callDeepSeek(prompt);
      case 'kimi':
        return await callKimi(prompt);
      case 'openai':
        return await callOpenAI(prompt);
      default:
        return await callOllama(prompt);
    }
  } catch (error) {
    log(`AI调用失败: ${error.message}`, 'error');
    // 尝试备用模型
    if (MODEL_PROVIDER === 'ollama' && (DEEPSEEK_API_KEY || KIMI_API_KEY)) {
      log('尝试备用模型...', 'process');
      if (DEEPSEEK_API_KEY) return await callDeepSeek(prompt);
      if (KIMI_API_KEY) return await callKimi(prompt);
    }
    throw error;
  }
}

function getProviderName() {
  const names = {
    ollama: 'Ollama (本地)',
    deepseek: 'DeepSeek',
    kimi: 'Kimi',
    openai: 'OpenAI'
  };
  return names[MODEL_PROVIDER] || 'AI';
}

async function callOllama(prompt) {
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

async function callDeepSeek(prompt) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('未配置 DEEPSEEK_API_KEY');
  }
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: false
    })
  });
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callKimi(prompt) {
  if (!KIMI_API_KEY) {
    throw new Error('未配置 KIMI_API_KEY');
  }
  
  const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: false
    })
  });
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callOpenAI(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error('未配置 OPENAI_API_KEY');
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: false
    })
  });
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
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
  
  // 平台风格后缀
  const styleSuffix = {
    xhs: '\\n\\n注意：用小红书风格写，标题要吸引眼球，多用emoji，段落要短，末尾加话题标签。',
    zhihu: '\\n\\n注意：用知乎专栏风格写，语气专业理性，可以加"泻药"开头。',
    juejin: '\\n\\n注意：用掘金技术文章风格写，简洁直接，干货为主。',
    csdn: '\\n\\n注意：用CSDN博客风格写，通俗易懂，步骤详细。'
  };
  
  let prompt = typePrompts[type] || typePrompts.default;
  if (styleSuffix[type]) {
    prompt = prompt.replace('输出为Markdown格式', '输出为Markdown格式' + styleSuffix[type]);
  }
  
  return prompt;
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

function generateWechatHtml(article, title) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 20px; 
      line-height: 1.8; 
      color: #333;
      background: #fff;
    }
    h1 { 
      color: #1a1a1a; 
      font-size: 30px; 
      font-weight: 700;
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #07c160;
      padding-bottom: 20px;
    }
    h2 { 
      color: #2c2c2c; 
      font-size: 24px; 
      margin-top: 35px; 
      font-weight: 600;
      border-left: 4px solid #07c160;
      padding-left: 15px;
    }
    h3 { 
      color: #3c3c3c; 
      font-size: 20px;
      font-weight: 600;
      margin-top: 25px;
    }
    p { margin: 18px 0; }
    code { 
      background: #f5f5f5; 
      padding: 3px 8px; 
      border-radius: 4px; 
      font-family: 'SF Mono', Consolas, 'Courier New', monospace;
      font-size: 14px;
      color: #e83e8c;
    }
    pre { 
      background: #282c34; 
      color: #abb2bf; 
      padding: 20px; 
      border-radius: 8px; 
      overflow-x: auto; 
      margin: 20px 0;
    }
    pre code { 
      background: none; 
      padding: 0; 
      color: inherit;
      font-size: 14px;
      line-height: 1.6;
    }
    blockquote { 
      border-left: 4px solid #07c160; 
      margin: 20px 0; 
      padding: 15px 20px; 
      background: #f8f9fa; 
      color: #666;
      border-radius: 0 8px 8px 0;
    }
    blockquote p { margin: 0; }
    ul, ol { padding-left: 30px; }
    li { margin: 10px 0; }
    a { color: #07c160; text-decoration: none; }
    a:hover { text-decoration: underline; }
    strong { color: #07c160; font-weight: 600; }
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 15px 0; }
    .footer { 
      margin-top: 50px; 
      padding-top: 25px; 
      border-top: 1px solid #eee; 
      color: #999; 
      font-size: 14px;
      text-align: center;
    }
    .author { 
      color: #07c160; 
      font-weight: 600;
    }
    hr {
      border: none;
      border-top: 1px dashed #ddd;
      margin: 30px 0;
    }
  </style>
</head>
<body>
${article}
<hr>
<div class="footer">
  <p>本文由 <span class="author">AI写作助手</span> 自动整理</p>
</div>
</body>
</html>`;
}

function generateHtml(article, title) {
  return generateWechatHtml(article, title);
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
  } else if (command === 'batch') {
    // 批量处理模式
    const batchDir = args[1];
    if (!batchDir || !fs.existsSync(batchDir)) {
      log('请提供包含多个文件的目录', 'error');
      process.exit(1);
    }
    
    const files = fs.readdirSync(batchDir).filter(f => f.endsWith('.txt') || f.endsWith('.md'));
    if (files.length === 0) {
      log('目录中没有找到文本文件', 'error');
      process.exit(1);
    }
    
    log(`📁 发现 ${files.length} 个文件，开始批量处理...`, 'info');
    
    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      log(`\n📄 处理 ${i + 1}/${files.length}: ${file}`, 'process');
      
      try {
        const fileContent = fs.readFileSync(path.join(batchDir, file), 'utf-8');
        const fileType = fileContent.includes('对话') || fileContent.includes('AI:') ? 'chat' : 'default';
        const prompt = generateArticlePrompt(fileContent, fileType);
        const article = await callAI(prompt);
        
        const titleMatch = article.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : file.replace(/\.(txt|md)$/, '');
        
        fs.writeFileSync(path.join(OUTPUT_DIR, `${file.replace(/\.(txt|md)$/, '')}-文章.md`), article, 'utf-8');
        fs.writeFileSync(path.join(OUTPUT_DIR, `${file.replace(/\.(txt|md)$/, '')}-文章.html`), generateWechatHtml(article, title), 'utf-8');
        
        successCount++;
        log(`✅ ${file} 处理完成`, 'success');
      } catch (e) {
        log(`❌ ${file} 处理失败: ${e.message}`, 'error');
      }
    }
    
    log(`\n📊 批量处理完成: ${successCount}/${files.length} 成功`, 'info');
    process.exit(0);
    
  } else if (command === 'style') {
    // 风格生成模式
    const style = args[1]; // xhs, zhihu, juejin, csdn
    const content = args.slice(2).join(' ');
    if (!style || !content) {
      log('用法: ai-writer style <风格> <内容>', 'error');
      log('风格: xhs(小红书), zhihu(知乎), juejin(掘金), csdn(CSDN)', 'info');
      process.exit(1);
    }
    log(`📄 生成${style}风格文章...`, 'info');
    const prompt = generateArticlePrompt(content, style);
    const article = await callAI(prompt);
    const timestamp = new Date().toISOString().slice(0, 10);
    const platformNames = { xhs: '小红书', zhihu: '知乎', juejin: '掘金', csdn: 'CSDN' };
    const fileName = path.join(OUTPUT_DIR, `${timestamp}-${platformNames[style] || style}.md`);
    fs.writeFileSync(fileName, article, 'utf-8');
    log(`✅ ${platformNames[style] || style}版本已保存: ${fileName}`, 'success');
    console.log('\n' + article);
    process.exit(0);
    
  } else if (command === 'publish') {
    
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
    log('  ai-writer batch <目录>              # 批量处理多个文件', 'info');
    log('  ai-writer style <风格> <内容>         # 生成指定风格文章(xhs/zhihu/juejin/csdn)', 'info');
    log('  ai-writer publish <文件>             # 发布文章到配置的平台', 'info');
    log('  ai-writer publish <文件>             # 发布文章到配置的平台', 'info');
    log('  ai-writer publish <文件> --publish  # 直接发布', 'info');
    log('\n💡 提示: 推荐使用 clipboard 模式最懒人！', 'process');
    process.exit(0);
  }
  
  const prompt = generateArticlePrompt(content, type);
  const article = await callAI(prompt);
  
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
