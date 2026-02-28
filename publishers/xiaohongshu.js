/**
 * 小红书发布器
 * 支持生成小红书格式的内容
 * 注意：小红书开放平台需要企业认证，API门槛较高
 * 此处生成适合小红书的精简内容格式
 */

const axios = require('axios');

class XiaohongshuPublisher {
  constructor(config = {}) {
    this.config = config;
    this.cookie = config.cookie || '';
  }

  /**
   * 转换为小红书格式（精简内容）
   * 小红书特点：标题短、emoji多、标签丰富
   */
  convertToXiaohongshuFormat(article) {
    // 提取标题
    const titleMatch = article.match(/^#\s+(.+)$/m);
    let title = titleMatch ? titleMatch[1] : '';
    
    // 移除标题行
    let content = article.replace(/^#\s+.+$/m, '');
    
    // 转换为小红书风格
    content = content
      // 简化标题
      .replace(/^##\s+(.+)$/gm, '\n✅ $1\n')
      .replace(/^###\s+(.+)$/gm, '\n👉 $1\n')
      // 加粗改为emoji强调
      .replace(/\*\*(.+?)\*\*/g, '⭐$1')
      // 代码块改为引用
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '\n💻 $2\n')
      // 列表改为emoji
      .replace(/^-\s+(.+)$/gm, '• $1')
      .replace(/^\d+\.\s+(.+)$/gm, '$1')
      // 链接改为话题
      .replace(/\[(.+?)\]\((.+?)\)/g, '')
      // 清理多余空行
      .replace(/\n{3,}/g, '\n\n');
    
    return { title, content };
  }

  /**
   * 提取话题标签
   */
  extractTags(article) {
    const tags = [];
    // 提取 #话题
    const tagMatches = article.match(/#[^\s#]+/g);
    if (tagMatches) {
      tags.push(...tagMatches);
    }
    // 添加默认标签
    if (tags.length < 5) {
      tags.push('#AI工具', '#学习笔记', '#干货分享');
    }
    return tags.slice(0, 10); // 小红书最多10个话题
  }

  /**
   * 发布文章
   */
  async publish(article, options = {}) {
    const { title, status = 'draft' } = options;
    
    const { title: extractedTitle, content } = this.convertToXiaohongshuFormat(article);
    const finalTitle = title || extractedTitle;
    const tags = this.extractTags(article);
    
    // 如果没有配置 API，返回复制粘贴格式
    if (!this.cookie && !this.config.accessToken) {
      return {
        success: true,
        platform: '小红书',
        url: '',
        copyContent: `${finalTitle}\n\n${content}\n\n${tags.join(' ')}`,
        message: '未配置 API，请手动复制内容到小红书发布'
      };
    }

    try {
      // TODO: 实现真实 API 调用
      // 小红书开放平台需要企业认证，此处预留接口
      return {
        success: true,
        platform: '小红书',
        url: '',
        copyContent: `${finalTitle}\n\n${content}\n\n${tags.join(' ')}`,
        message: 'API 待实现，请手动复制到小红书'
      };
    } catch (error) {
      return {
        success: false,
        platform: '小红书',
        error: error.message,
        copyContent: `${finalTitle}\n\n${content}\n\n${tags.join(' ')}`,
        message: '发布失败，请手动复制'
      };
    }
  }

  /**
   * 生成小红书风格的Markdown
   */
  static formatForXiaohongshu(article) {
    // 转换为简洁风格
    return article
      .replace(/^#\s+(.+)$/gm, '$1')
      .replace(/^##\s+(.+)$/gm, '\n✅ $1\n')
      .replace(/\*\*(.+?)\*\*/g, '⭐$1');
  }
}

module.exports = XiaohongshuPublisher;
