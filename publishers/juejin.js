/**
 * 掘金发布器
 * 支持通过 Cookie 认证发布文章
 * 也支持生成掘金支持的 Markdown 格式
 */

const axios = require('axios');

class JuejinPublisher {
  constructor(config = {}) {
    this.config = config;
    this.cookie = config.cookie || '';
    this.csrfToken = config.csrfToken || '';
  }

  /**
   * 从 Cookie 中提取 CSRF Token
   */
  extractCsrfToken(cookie) {
    const match = cookie.match(/csrf_token=([^;]+)/);
    return match ? match[1] : '';
  }

  /**
   * 转换 Markdown 为掘金支持的 HTML
   */
  convertToJuejinFormat(article) {
    let content = article
      // 标题处理
      .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
      .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
      // 文本样式
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // 代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // 列表
      .replace(/^\-\s+(.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
      // 链接和图片
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/!\[(.*?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')
      // 引用
      .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
      // 段落
      .replace(/\n\n/g, '</p><p>');
    
    return `<p>${content}</p>`;
  }

  /**
   * 发布文章到掘金
   */
  async publish(article, options = {}) {
    const { title, status = 'draft', tags = [] } = options;
    
    // 提取标题
    const titleMatch = article.match(/^#\s+(.+)$/m);
    const articleTitle = title || titleMatch?.[1] || 'AI 生成文章';
    
    // 转换内容
    const content = this.convertToJuejinFormat(article);
    const markContent = article; // 保留原始 Markdown
    
    // 如果没有配置 Cookie，返回复制粘贴格式
    if (!this.cookie) {
      return {
        success: true,
        platform: '掘金',
        url: '',
        copyContent: article,
        message: '未配置 Cookie，请手动复制内容到掘金发布'
      };
    }

    try {
      // 先创建草稿
      const draftResponse = await axios.post(
        'https://api.juejin.cn/content_api/v1/article_draft/create',
        {
          article_title: articleTitle,
          mark_content: markContent,
          html_content: content,
          tag_ids: tags,
          status: 0 // 草稿
        },
        {
          headers: {
            'Cookie': this.cookie,
            'X-Csrf-Token': this.csrfToken || this.extractCsrfToken(this.cookie),
            'Content-Type': 'application/json'
          }
        }
      );

      if (status === 'publish' && draftResponse.data.data?.draft_id) {
        // 发布草稿
        await axios.post(
          'https://api.juejin.cn/content_api/v1/article/publish',
          {
            draft_id: draftResponse.data.data.draft_id,
            status: 1
          },
          {
            headers: {
              'Cookie': this.cookie,
              'X-Csrf-Token': this.csrfToken || this.extractCsrfToken(this.cookie),
              'Content-Type': 'application/json'
            }
          }
        );
      }

      return {
        success: true,
        platform: '掘金',
        url: `https://juejin.cn/post/${draftResponse.data.data?.draft_id || ''}`,
        draftId: draftResponse.data.data?.draft_id,
        message: status === 'publish' ? '已发布' : '已存为草稿'
      };
    } catch (error) {
      // 如果 API 失败，返回复制内容
      return {
        success: false,
        platform: '掘金',
        error: error.response?.data?.msg || error.message,
        copyContent: article,
        message: 'API发布失败，请手动复制到掘金'
      };
    }
  }

  /**
   * 生成掘金 Markdown 格式（支持代码高亮等）
   */
  static formatForJuejin(article) {
    // 掘金原生 Markdown 支持
    return article
      .replace(/^#\s+(.+)$/gm, '# $1')
      .replace(/^##\s+(.+)$/gm, '## $1')
      .replace(/^###\s+(.+)$/gm, '### $1');
  }
}

module.exports = JuejinPublisher;
