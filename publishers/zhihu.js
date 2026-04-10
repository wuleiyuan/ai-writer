const axios = require('axios');
const { BasePublisher } = require('./base');

class ZhihuPublisher extends BasePublisher {
  constructor(config = {}) {
    super(config);
    this.cookie = config.cookie;
    this.z_c0 = config.z_c0;
  }

  async publish(title, content, options = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Cookie': this.cookie || `z_c0=${this.z_c0}`,
        'Referer': 'https://zhuanlan.zhihu.com',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      };

      const response = await axios.post(
        'https://api.zhihu.com/articles',
        {
          title: title,
          content: content,
          is_public: options.publish || false
        },
        { headers }
      );

      if (response.data?.url) {
        return {
          success: true,
          url: response.data.url,
          message: '文章已发布到知乎',
          platform: 'zhihu'
        };
      }

      throw new Error('知乎发布失败');
    } catch (error) {
      throw new Error('知乎发布失败: ' + error.message);
    }
  }

  async transform(title, content) {
    return { title, content };
  }
}

module.exports = ZhihuPublisher;
