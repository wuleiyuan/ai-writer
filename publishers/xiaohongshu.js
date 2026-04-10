const axios = require('axios');
const { BasePublisher } = require('./base');

class XiaohongshuPublisher extends BasePublisher {
  constructor(config = {}) {
    super(config);
    this.cookie = config.cookie;
    this.accessToken = config.accessToken;
  }

  async publish(title, content, options = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Cookie': this.cookie,
        'Authorization': this.accessToken ? `Bearer ${this.accessToken}` : '',
        'Referer': 'https://www.xiaohongshu.com'
      };

      const noteData = {
        title: title,
        content: content,
        note_type: 'normal'
      };

      const response = await axios.post(
        'https://edith.xiaohongshu.com/api/sns/web/v1/feed_create',
        noteData,
        { headers }
      );

      if (response.data?.success) {
        return {
          success: true,
          url: `https://www.xiaohongshu.com/discovery/item/${response.data.data.note_id}`,
          message: '文章已发布到小红书',
          platform: 'xiaohongshu'
        };
      }

      throw new Error(response.data?.msg || '发布失败');
    } catch (error) {
      throw new Error('小红书发布失败: ' + error.message);
    }
  }

  async transform(title, content) {
    const xhsContent = content
      .split('\n')
      .filter(p => p.trim())
      .map(p => `• ${p}`)
      .join('\n');

    return {
      title: title,
      content: xhsContent
    };
  }
}

module.exports = XiaohongshuPublisher;
