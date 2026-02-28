/**
 * 博客园 发布器
 * 支持通过 XML-RPC API 发布文章
 */

const axios = require('axios');
const { BasePublisher } = require('./base');

class CnBlogsPublisher extends BasePublisher {
  constructor(config) {
    super(config);
    this.name = '博客园';
    this.blogName = config.blogName;
    this.username = config.username;
    this.password = config.password;
  }

  /**
   * 博客园内容转换
   */
  async transform(title, content) {
    // 简单转换 Markdown 为 HTML
    let html = this.markdownToHtml(content);
    return { title, content: html };
  }

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
    const postData = {
      title,
      description: content,
      mt_allow_comments: 1,
      mt_allow_pings: 1,
      post_type: 'post',
      wp_slug: title.toLowerCase().replace(/\s+/g, '-')
    };

    try {
      const url = `https://rpc.cnblogs.com/metaweblog/${this.blogName || 'default'}`;
      
      const response = await axios.post(url, {
        method: 'metaWeblog.newPost',
        params: ['', this.username, this.password, postData, true],
        id: 'jsonrpc'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data?.result?.permaLink) {
        return {
          success: true,
          platform: '博客园',
          url: response.data.result.permaLink,
          id: response.data.result.postid,
          message: '发布成功'
        };
      } else {
        throw new Error(response.data?.error?.message || '发布失败');
      }
    } catch (error) {
      return {
        success: false,
        platform: '博客园',
        error: error.message
      };
    }
  }

  isConfigured() {
    return !!(this.blogName && this.username && this.password);
  }
}

module.exports = CnBlogsPublisher;
