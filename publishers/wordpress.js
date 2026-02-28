/**
 * WordPress 发布器
 * 支持通过 REST API 发布文章到 WordPress
 */

const axios = require('axios');
const { BasePublisher } = require('./base');

class WordPressPublisher extends BasePublisher {
  constructor(config) {
    super(config);
    this.name = 'WordPress';
    this.siteUrl = config.siteUrl;
    this.username = config.username;
    this.password = config.password;
  }

  /**
   * WordPress 内容转换
   */
  async transform(title, content) {
    // 将 Markdown 转换为 HTML
    let html = this.markdownToHtml(content);
    return { title, content: html };
  }

  /**
   * Markdown 转 HTML
   */
  markdownToHtml(markdown) {
    return markdown
      .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
      .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/^-\s+(.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  }

  /**
   * 执行发布
   */
  async publish(title, content, options = {}) {
    const { categories = [], tags = [], status = 'draft' } = options;

    const htmlContent = `<div class="ai-article">${content}</div>`;

    try {
      const response = await axios.post(
        `${this.siteUrl}/wp-json/wp/v2/posts`,
        {
          title,
          content: htmlContent,
          status,
          categories,
          tags
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
        id: response.data.id,
        message: status === 'publish' ? '已发布' : '已存为草稿'
      };
    } catch (error) {
      return {
        success: false,
        platform: 'WordPress',
        error: error.response?.data?.message || error.message
      };
    }
  }

  isConfigured() {
    return !!(this.siteUrl && this.username && this.password);
  }
}

module.exports = WordPressPublisher;
