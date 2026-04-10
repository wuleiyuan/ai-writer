const express = require('express');
const cors = require('cors');
const path = require('path');
const { callAI, generateArticlePrompt, generateWechatHtml } = require('../ai-writer');

const app = express();
const PORT = process.env.WEB_PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../web/public')));

const VideoConverter = require('../src/videoConverter');
const ImageGenerator = require('../src/imageGenerator');
const { MultiPublisher, loadConfigFromEnv } = require('../publishers');

const videoConverter = new VideoConverter();
const imageGenerator = new ImageGenerator();

app.post('/api/generate', async (req, res) => {
  try {
    const { content, type = 'default', style } = req.body;

    if (!content) {
      return res.status(400).json({ error: '内容不能为空' });
    }

    let prompt;
    if (style) {
      prompt = generateArticlePrompt(content, style);
    } else {
      prompt = generateArticlePrompt(content, type);
    }

    const article = await callAI(prompt);
    const titleMatch = article.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'AI生成文章';
    const html = generateWechatHtml(article, title);

    res.json({
      success: true,
      title,
      article,
      html,
      markdown: article
    });
  } catch (error) {
    console.error('生成失败:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/video-to-article', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: '视频URL不能为空' });
    }

    const content = await videoConverter.extract(url);
    const prompt = generateArticlePrompt(content, 'video');
    const article = await callAI(prompt);

    const titleMatch = article.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : '视频文章';
    const html = generateWechatHtml(article, title);

    res.json({
      success: true,
      title,
      article,
      html,
      markdown: article
    });
  } catch (error) {
    console.error('视频解析失败:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-cover', async (req, res) => {
  try {
    const { title, keywords } = req.body;

    if (!title) {
      return res.status(400).json({ error: '标题不能为空' });
    }

    const imageUrl = await imageGenerator.generate(title, keywords);

    res.json({
      success: true,
      imageUrl
    });
  } catch (error) {
    console.error('封面生成失败:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fetch-url', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL不能为空' });
    }

    const https = require('https');
    const http = require('http');

    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      client.get(url, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          const content = data.substring(0, 10000);
          resolve({ success: true, content });
        });
      }).on('error', reject);
    }).then(result => res.json(result))
      .catch(error => res.status(500).json({ error: error.message }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/publish', async (req, res) => {
  try {
    const { article, platform } = req.body;

    if (!article) {
      return res.status(400).json({ error: '文章内容不能为空' });
    }

    const config = loadConfigFromEnv();

    if (Object.keys(config).length === 0) {
      return res.status(400).json({
        error: '未配置任何发布平台，请配置环境变量'
      });
    }

    const publisher = new MultiPublisher(config);

    if (platform) {
      const result = await publisher.publishTo(platform, article);
      res.json(result);
    } else {
      const results = await publisher.publish(article);
      res.json({ results });
    }
  } catch (error) {
    console.error('发布失败:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/platforms', (req, res) => {
  const config = loadConfigFromEnv();
  const configured = [];

  if (config.wordpress) configured.push('WordPress');
  if (config.cnblogs) configured.push('博客园');
  if (config.juejin) configured.push('掘金');
  if (config.zhihu) configured.push('知乎');
  if (config.csdn) configured.push('CSDN');
  if (config.xiaohongshu) configured.push('小红书');
  if (config.wechat) configured.push('微信公众号');

  res.json({ platforms: configured });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🤖 AI-Writer Web 服务已启动                          ║
║                                                       ║
║   🌐 访问地址: http://localhost:${PORT}                   ║
║                                                       ║
║   按 Ctrl+C 停止服务                                   ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});
