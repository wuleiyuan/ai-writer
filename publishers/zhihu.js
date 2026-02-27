/**
 * 知乎发布器
 * 支持通过 API 发布文章
 * 也支持生成知乎支持的 Markdown 格式
 */

const axios = require('axios');

class ZhihuPublisher {
  constructor(config = {}) {
    this.config = config;
    this.cookie = config.cookie || '';
    this.z_c0 = config.z_c0 || ''; // 登录凭证
  }

  /**
   * 从 Cookie 中提取 z_c0
   */
  extractZc0(cookie) {
    const match = cookie.match(/z_c0=([^;]+)/);
    return match ? match[1] : '';
  }

  /**
   * 转换 Markdown 为知乎 HTML
   */
  convertToZhihuFormat(article) {
    let content = article
      // 标题处理
      .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
      .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
      // 文本样式
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="inline">$1</code>')
      // 代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="highlight js"><code>$2</code></pre>')
      // 列表
      .replace(/^\-\s+(.+)$/gm, '<ul><li>$1</li></ul>')
      .replace(/^\d+\.\s+(.+)$/gm, '<ol><li>$1</li></ol>')
      // 链接和图片
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" class="external-link" rel="nofollow">$1</a>')
      .replace(/!\[(.*?)\]\((.+?)\)/g, '<figure><img src="$2" alt="$1" /><figcaption>$1</figcaption></figure>')
      // 引用
      .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
      // 分割线
      .replace(/^---$/gm, '<hr />');
    
    return content;
  }

  /**
   * 发布文章到知乎
   */
  async publish(article, options = {}) {
    const { title, topic = '', license = 1 } = options;
    
    // 提取标题
    const titleMatch = article.match(/^#\s+(.+)$/m);
    const articleTitle = title || titleMatch?.[1] || 'AI 生成文章';
    
    // 转换内容
    const htmlContent = this.convertToZhihuFormat(article);
    const markdownContent = article;
    
    // 如果没有配置 Cookie，返回复制粘贴格式
    if (!this.cookie && !this.z_c0) {
      return {
        success: true,
        platform: '知乎',
        url: '',
        copyContent: article,
        message: '未配置 Cookie，请手动复制内容到知乎发布'
      };
    }

    try {
      const headers = {
        'Cookie': this.cookie || `z_c0=${this.z_c0}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.zhihu.com/'
      };

      // 创建文章
      const response = await axios.post(
        'https://www.zhihu.com/api/v4/articles',
        {
          title: articleTitle,
          html: htmlContent,
          markdown: markdownContent,
          topic: topic,
          license: license, // 1=允许转载, 2=禁止转载, 3=付费转载
          is_submit: true
        },
        { headers }
      );

      return {
        success: true,
        platform: '知乎',
        url: response.data.url,
        id: response.data.id,
        message: '发布成功'
      };
    } catch (error) {
      // 如果 API 失败，返回复制内容
      return {
        success: false,
        platform: '知乎',
        error: error.response?.data?.error?.message || error.message,
        copyContent: article,
        message: 'API发布失败，请手动复制到知乎'
      };
    }
  }

  /**
   * 生成知乎专栏 Markdown 格式
   */
  static formatForZhihu(article) {
    // 知乎支持 Markdown，但建议使用通用格式
    return article;
  }
}

module.exports = ZhihuPublisher;
