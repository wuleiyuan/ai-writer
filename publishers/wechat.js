const axios = require('axios');
const { BasePublisher } = require('./base');

class WechatPublisher extends BasePublisher {
  constructor(config = {}) {
    super(config);
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.accessToken = null;
    this.tokenExpireTime = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpireTime && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.access_token) {
        this.accessToken = data.access_token;
        this.tokenExpireTime = Date.now() + (data.expires_in - 200) * 1000;
        return this.accessToken;
      } else {
        throw new Error(data.errmsg || '获取access_token失败');
      }
    } catch (error) {
      throw new Error('微信 access_token 获取失败: ' + error.message);
    }
  }

  async uploadImage(imageBuffer, filename = 'cover.jpg') {
    const token = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=image`;

    const FormData = require('form-data');
    const form = new FormData();
    form.append('media', imageBuffer, {
      filename,
      contentType: 'image/jpeg'
    });

    const response = await axios.post(url, form, {
      headers: form.getHeaders()
    });

    const data = response.data;
    if (data.media_id) {
      return { mediaId: data.media_id, url: data.url };
    } else {
      throw new Error(data.errmsg || '图片上传失败');
    }
  }

  async addDraft(title, author, content, thumbMediaId = null) {
    const token = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${token}`;

    const draftArticle = {
      title,
      author,
      digest: content.substring(0, 120),
      content: content,
      content_source_url: '',
      need_open_comment: 1,
      only_fans_can_comment: 0
    };

    if (thumbMediaId) {
      draftArticle.thumb_media_id = thumbMediaId;
    }

    const response = await axios.post(url, {
      articles: [draftArticle]
    });

    const data = response.data;
    if (data.media_id) {
      return {
        success: true,
        mediaId: data.media_id,
        url: `草稿箱已创建，media_id: ${data.media_id}`
      };
    } else {
      throw new Error(data.errmsg || '创建草稿失败');
    }
  }

  async publish(article, options = {}) {
    const { title, content } = this.parseArticle(article);

    let coverImageMediaId = null;
    if (this.config.coverImage) {
      try {
        const imageResult = await this.uploadImage(this.config.coverImage);
        coverImageMediaId = imageResult.mediaId;
      } catch (e) {
        console.warn('封面图上传失败，继续发布:', e.message);
      }
    }

    const result = await this.addDraft(
      title,
      this.config.author || 'AI写作助手',
      content,
      coverImageMediaId
    );

    return {
      success: true,
      url: result.url,
      message: `微信公众号草稿创建成功`,
      platform: 'wechat'
    };
  }

  async transform(title, content) {
    const wechatContent = this.convertToWechatHtml(content);
    return {
      title: title,
      content: wechatContent
    };
  }

  convertToWechatHtml(markdownContent) {
    let html = markdownContent;

    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width:100%;">');

    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '');

    return html;
  }

  parseArticle(articleContent) {
    const titleMatch = articleContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : '未命名文章';
    const content = articleContent.replace(/^#\s+.+$/m, '').trim();
    return { title, content };
  }
}

module.exports = WechatPublisher;
