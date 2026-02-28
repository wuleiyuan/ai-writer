/**
 * 掘金发布器
 * 支持通过 Cookie 认证发布文章
 */

const axios = require('axios');
const { BasePublisher } = require('./base');

class JuejinPublisher extends BasePublisher {
  constructor(config = {}) {
    super(config);
    this.name = '掘金';
    this.cookie = config.cookie || '';
    this.csrfToken = config.csrfToken || '';
  }

  extractCsrfToken(cookie) {
    const match = cookie?.match(/csrf_token=([^;]+)/);
    return match ? match[1] : '';
  }

  /**
   * 掘金内容转换
   */
  async transform(title, content) {
    // 掘金支持 Markdown，直接返回
    return { title, content };
  }

  /**
   * 执行发布
   */
  async publish(title, content, options = {}) {
    const { status = 'draft', tags = [] } = options;
    const markContent = content;

    if (!this.cookie) {
      return {
        success: true,
        platform: '掘金',
        url: '',
        copyContent: `# ${title}\n\n${content}`,
        message: '未配置 Cookie，请手动复制内容到掘金发布'
      };
    }

    try {
      const draftResponse = await axios.post(
        'https://api.juejin.cn/content_api/v1/article_draft/create',
        {
          article_title: title,
          mark_content: markContent,
          html_content: content,
          tag_ids: tags,
          status: 0
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
        await axios.post(
          'https://api.juejin.cn/content_api/v1/article/publish',
          { draft_id: draftResponse.data.data.draft_id, status: 1 },
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
      return {
        success: false,
        platform: '掘金',
        error: error.response?.data?.msg || error.message,
        copyContent: `# ${title}\n\n${content}`,
        message: 'API发布失败，请手动复制到掘金'
      };
    }
  }

  isConfigured() {
    return !!this.cookie;
  }
}

module.exports = JuejinPublisher;
