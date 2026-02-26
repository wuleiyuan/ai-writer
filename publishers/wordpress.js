/**
 * WordPress 发布器
 * 支持通过 REST API 发布文章到 WordPress
 */

const axios = require('axios');

class WordPressPublisher {
  constructor(config) {
    this.config = config;
    this.siteUrl = config.siteUrl;
    this.username = config.username;
    this.password = config.password; // 应用密码
  }

  async publish(article, options = {}) {
    const { title, categories = [], tags = [], status = 'draft' } = options;

    // 提取标题（从 Markdown 中）
    const titleMatch = article.match(/^#\s+(.+)$/m);
    const articleTitle = title || titleMatch?.[1] || 'AI 生成文章';

    // 转换 Markdown 为 HTML（简单转换）
    let content = article
      .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
      .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/^\-(.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\.(.+)$/gm, '<li>$1</li>');

    // 添加 WordPress 样式
    content = `<div class="ai-article">${content}</div>`;

    try {
      const response = await axios.post(
        `${this.siteUrl}/wp-json/wp/v2/posts`,
        {
          title: articleTitle,
          content: content,
          status: status, // 'draft', 'publish', 'pending'
          categories: categories,
          tags: tags
        },
        {
          auth: {
            username: this.username,
            password: this.password
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        platform: 'WordPress',
        url: response.data.link,
        id: response.data.id
      };
    } catch (error) {
      return {
        success: false,
        platform: 'WordPress',
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = WordPressPublisher;
