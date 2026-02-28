/**
 * 小红书发布器
 * 支持生成小红书格式的内容
 * 注意：小红书开放平台需要企业认证，API门槛较高
 */

const axios = require('axios');
const { BasePublisher } = require('./base');

class XiaohongshuPublisher extends BasePublisher {
  constructor(config = {}) {
    super(config);
    this.name = '小红书';
    this.cookie = config.cookie || '';
    this.accessToken = config.accessToken || '';
  }

  /**
   * 小红书内容转换 - 可重写实现 AI 风格转换
   * 小红书特点：标题短、emoji多、标签丰富
   */
  async transform(title, content) {
    // 简化和转换内容为小红书风格
    let shortContent = content
      .replace(/^#+\s+/gm, '')  // 移除 Markdown 标题
      .replace(/\*\*/g, '')     // 移除加粗
      .replace(/`/g, '')        // 移除代码标记
      .substring(0, 1000);       // 限制长度
    
    // 提取标签
    const tags = content.match(/#[^\s#]+/g) || [];
    
    return { 
      title: title.substring(0, 20), // 小红书标题要短
      content: `${shortContent}\n\n${tags.slice(0, 10).join(' ')}`
    };
  }

  /**
   * 执行发布
   */
  async publish(title, content, options = {}) {
    if (!this.cookie && !this.accessToken) {
      return {
        success: true,
        platform: '小红书',
        url: '',
        copyContent: `【${title}】\n\n${content}`,
        message: '未配置 API，请手动复制内容到小红书发布'
      };
    }

    try {
      // TODO: 实现真实 API 调用
      // 小红书开放平台需要企业认证
      return {
        success: true,
        platform: '小红书',
        url: '',
        copyContent: `【${title}】\n\n${content}`,
        message: 'API 待实现，请手动复制到小红书'
      };
    } catch (error) {
      return {
        success: false,
        platform: '小红书',
        error: error.message,
        copyContent: `【${title}】\n\n${content}`,
        message: '发布失败，请手动复制'
      };
    }
  }

  isConfigured() {
    return !!(this.cookie || this.accessToken);
  }
}

module.exports = XiaohongshuPublisher;
