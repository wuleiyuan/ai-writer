/**
 * CSDN 发布器
 * 支持通过 API 发布文章
 * CSDN 提供较为开放的博客发布 API
 */

const axios = require('axios');

class CSDNPublisher {
  constructor(config = {}) {
    this.config = config;
    this.cookie = config.cookie || '';
    this.username = config.username || '';
  }

  /**
   * 从 Cookie 中提取认证信息
   */
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    };
    if (this.cookie) {
      headers['Cookie'] = this.cookie;
    }
    return headers;
  }

  /**
   * 转换 Markdown 为 CSDN HTML
   */
  convertToCSDNFormat(article) {
    let content = article
      // 标题处理
      .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
      .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
      .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
      // 文本样式
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // 代码块 - CSDN 支持多种语言高亮
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'javascript';
        return `<pre><code class="language-${language}">${code}</code></pre>`;
      })
      // 列表
      .replace(/^\-\s+(.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
      // 链接和图片
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/!\[(.*?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')
      // 引用
      .replace(/^>\s+(.+)$/gm, '<blockquote><p>$1</p></blockquote>')
      // 表格
      .replace(/^\|(.+)\|$/gm, (match, content) => {
        const cells = content.split('|').map(c => c.trim());
        if (cells.every(c => c.match(/^-+$/))) {
          return ''; // 表头分隔符
        }
        return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
      })
      // 段落
      .replace(/\n\n/g, '</p><p>');
    
    return content;
  }

  /**
   * 发布文章到 CSDN
   */
  async publish(article, options = {}) {
    const { 
      title, 
      categories = [], 
      tags = [], 
      status = 'draft',
      description = '',
      type = 'original' // original, reproduced, translated
    } = options;
    
    // 提取标题
    const titleMatch = article.match(/^#\s+(.+)$/m);
    const articleTitle = title || titleMatch?.[1] || 'AI 生成文章';
    
    // 转换内容
    const htmlContent = this.convertToCSDNFormat(article);
    const markdownContent = article;
    
    // 如果没有配置 Cookie，返回复制粘贴格式
    if (!this.cookie) {
      return {
        success: true,
        platform: 'CSDN',
        url: '',
        copyContent: article,
        message: '未配置 Cookie，请手动复制内容到CSDN发布'
      };
    }

    try {
      // CSDN 博客发布接口
      const response = await axios.post(
        'https://blog.csdn.net/phoenix/article/publish',
        {
          title: articleTitle,
          markdowncontent: markdownContent,
          content: markdownContent, // CSDN 同时接受 Markdown
          description: description || articleTitle,
          tags: tags.join(','),
          categories: categories.join(','),
          type: type, // original, reproduced, translated
          status: status === 'publish' ? 1 : 0
        },
        {
          headers: {
            ...this.getAuthHeaders(),
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': `https://blog.csdn.net/${this.username || ''}/article/details/`
          }
        }
      );

      if (response.data) {
        return {
          success: true,
          platform: 'CSDN',
          url: response.data.url || `https://blog.csdn.net/${this.username}/article/details/${response.data.id}`,
          id: response.data.id,
          message: status === 'publish' ? '发布成功' : '已存为草稿'
        };
      }

      throw new Error('发布失败');
    } catch (error) {
      return {
        success: false,
        platform: 'CSDN',
        error: error.response?.data?.message || error.message,
        copyContent: article,
        message: 'API发布失败，请手动复制到CSDN'
      };
    }
  }

  /**
   * 生成 CSDN Markdown 格式
   */
  static formatForCSDN(article) {
    return article;
  }
}

module.exports = CSDNPublisher;
