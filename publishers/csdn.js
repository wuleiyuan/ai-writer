const axios = require('axios');
const { BasePublisher } = require('./base');

class CsdnPublisher extends BasePublisher {
  constructor(config = {}) {
    super(config);
    this.cookie = config.cookie;
    this.username = config.username;
  }

  async publish(title, content, options = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Cookie': this.cookie,
        'Referer': 'https://blog.csdn.net',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      };

      const articleData = {
        title: title,
        content: content,
        categories: [],
        tags: [],
        type: 'original',
        status: options.publish ? 'publish' : 'draft'
      };

      const response = await axios.post(
        'https://bizapi.csdn.net/blog-console-api/v3/article',
        articleData,
        { headers }
      );

      if (response.data?.data?.url) {
        return {
          success: true,
          url: response.data.data.url,
          message: '文章已发布到 CSDN',
          platform: 'csdn'
        };
      }

      throw new Error(response.data?.msg || '发布失败');
    } catch (error) {
      throw new Error('CSDN 发布失败: ' + error.message);
    }
  }

  async transform(title, content) {
    return { title, content };
  }
}

module.exports = CsdnPublisher;
