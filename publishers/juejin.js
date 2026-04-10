const axios = require('axios');
const { BasePublisher } = require('./base');

class JuejinPublisher extends BasePublisher {
  constructor(config = {}) {
    super(config);
    this.cookie = config.cookie;
    this.csrfToken = config.csrfToken;
  }

  async publish(title, content, options = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Cookie': this.cookie,
        'x-csrf-token': this.csrfToken,
        'Referer': 'https://juejin.cn'
      };

      const categoryResponse = await axios.post(
        'https://api.juejin.cn/content_api/v1/category/get',
        {},
        { headers }
      );

      let categoryId = '6809637769959178254';
      if (categoryResponse.data?.data?.[0]?.category_id) {
        categoryId = categoryResponse.data.data[0].category_id;
      }

      const articleData = {
        category_id: categoryId,
        tag_ids: [],
        title: title,
        content: content,
        brief_content: content.substring(0, 120),
        timing_time: 0,
        column_id: ''
      };

      const response = await axios.post(
        'https://api.juejin.cn/content_api/v1/article/update',
        articleData,
        { headers }
      );

      if (response.data?.data?.article_id) {
        return {
          success: true,
          url: `https://juejin.cn/post/${response.data.data.article_id}`,
          message: '文章已发布到掘金',
          platform: 'juejin'
        };
      }

      throw new Error(response.data?.msg || '发布失败');
    } catch (error) {
      throw new Error('掘金发布失败: ' + (error.response?.data?.msg || error.message));
    }
  }

  async transform(title, content) {
    return { title, content };
  }
}

module.exports = JuejinPublisher;
