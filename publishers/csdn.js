/**
 * CSDN 发布器
 * 支持通过 API 发布文章
 */

const axios = require('axios');
const { BasePublisher } = require('./base');

class CSDNPublisher extends BasePublisher {
  constructor(config = {}) {
    super(config);
    this.name = 'CSDN';
    this.cookie = config.cookie || '';
    this.username = config.username || '';
  }

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
   * CSDN 内容转换
   */
  async transform(title, content) {
    return { title, content };
  }

  /**
   * 执行发布
   */
  async publish(title, content, options = {}) {
    const { categories = [], tags = [], status = 'draft', type = 'original' } = options;

    if (!this.cookie) {
      return {
        success: true,
        platform: 'CSDN',
        url: '',
        copyContent: `# ${title}\n\n${content}`,
        message: '未配置 Cookie，请手动复制内容到CSDN发布'
      };
    }

    try {
      const response = await axios.post(
        'https://blog.csdn.net/phoenix/article/publish',
        {
          title,
          markdowncontent: content,
          content,
          description: title,
          tags: tags.join(','),
          categories: categories.join(','),
          type,
          status: status === 'publish' ? 1 : 0
        },
        {
          headers: {
            ...this.getAuthHeaders(),
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': `https://blog.csdn.net/${this.username}/article/details/`
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
        copyContent: `# ${title}\n\n${content}`,
        message: 'API发布失败，请手动复制到CSDN'
      };
    }
  }

  isConfigured() {
    return !!this.cookie;
  }
}

module.exports = CSDNPublisher;
