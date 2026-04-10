const axios = require('axios');
const { BasePublisher } = require('./base');

class WordPressPublisher extends BasePublisher {
  constructor(config = {}) {
    super(config);
    this.siteUrl = config.siteUrl;
    this.username = config.username;
    this.password = config.password;
  }

  async publish(title, content, options = {}) {
    try {
      const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');

      const categoriesResponse = await axios.get(`${this.siteUrl}/wp-json/wp/v2/categories`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });

      let categoryId = 1;
      if (categoriesResponse.data && categoriesResponse.data.length > 0) {
        categoryId = categoriesResponse.data[0].id;
      }

      const postData = {
        title: title,
        content: content,
        status: options.publish ? 'publish' : 'draft',
        categories: [categoryId]
      };

      const response = await axios.post(
        `${this.siteUrl}/wp-json/wp/v2/posts`,
        postData,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        url: response.data.link,
        message: `文章已发布到 WordPress: ${response.data.link}`,
        platform: 'wordpress'
      };
    } catch (error) {
      throw new Error('WordPress 发布失败: ' + (error.response?.data?.message || error.message));
    }
  }

  async transform(title, content) {
    return { title, content };
  }
}

module.exports = WordPressPublisher;
