/**
 * 博客园 发布器
 * 支持通过 XML-RPC API 发布文章
 */

const axios = require('axios');

class CnBlogsPublisher {
  constructor(config) {
    this.config = config;
    this.blogId = config.blogId || '';
    this.username = config.username;
    this.password = config.password;
  }

  async publish(article, options = {}) {
    const { title, isMarkdown = true } = options;

    // 提取标题
    const titleMatch = article.match(/^#\s+(.+)$/m);
    const articleTitle = title || titleMatch?.[1] || 'AI 生成文章';

    // 简单转换 Markdown 为 HTML
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

    // 博客园使用 MetaWeblog API
    const postData = {
      title: articleTitle,
      description: content,
      mt_allow_comments: 1,
      mt_allow_pings: 1,
      post_type: 'post',
      wp_slug: articleTitle.toLowerCase().replace(/\s+/g, '-')
    };

    try {
      // 博客园 MetaWeblog API 端点
      const url = `https://rpc.cnblogs.com/metaweblog/${this.config.blogName || 'default'}`;
      
      const response = await axios.post(url, {
        method: 'metaWeblog.newPost',
        params: [this.blogId, this.username, this.password, postData, true],
        id: 'jsonrpc'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data?.result?.permaLink) {
        return {
          success: true,
          platform: '博客园',
          url: response.data.result.permaLink,
          id: response.data.result.postid
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
}

module.exports = CnBlogsPublisher;
