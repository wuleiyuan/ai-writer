/**
 * 知乎发布器
 * 支持通过 API 发布文章
 */

const axios = require('axios');
const { BasePublisher } = require('./base');

class ZhihuPublisher extends BasePublisher {
  constructor(config = {}) {
    super(config);
    this.name = '知乎';
    this.cookie = config.cookie || '';
    this.z_c0 = config.z_c0 || '';
  }

  extractZc0(cookie) {
    const match = cookie?.match(/z_c0=([^;]+)/);
    return match ? match[1] : '';
  }

  /**
   * 知乎内容转换 - 可重写实现 AI 风格转换
   */
  async transform(title, content) {
    // TODO: 可在此调用 AI 将内容转换为"知乎体"
    // const zhihuContent = await callAI(content, 'zhihu');
    return { title, content };
  }

  /**
   * 执行发布
   */
  async publish(title, content, options = {}) {
    const { topic = '', license = 1 } = options;

    if (!this.cookie && !this.z_c0) {
      return {
        success: true,
        platform: '知乎',
        url: '',
        copyContent: `# ${title}\n\n${content}`,
        message: '未配置 Cookie，请手动复制内容到知乎发布'
      };
    }

    try {
      const headers = {
        'Cookie': this.cookie || `z_c0=${this.z_c0}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.zhihu.com/'
      };

      const response = await axios.post(
        'https://www.zhihu.com/api/v4/articles',
        {
          title,
          html: content,
          markdown: content,
          topic,
          license,
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
      return {
        success: false,
        platform: '知乎',
        error: error.response?.data?.error?.message || error.message,
        copyContent: `# ${title}\n\n${content}`,
        message: 'API发布失败，请手动复制到知乎'
      };
    }
  }

  isConfigured() {
    return !!(this.cookie || this.z_c0);
  }
}

module.exports = ZhihuPublisher;
