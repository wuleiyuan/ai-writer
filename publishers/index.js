/**
 * 多平台发布器 - 统一入口
 * 支持同时发布到多个平台
 */

const WordPressPublisher = require('./wordpress');
const CnBlogsPublisher = require('./cnblogs');

class MultiPublisher {
  constructor(publishersConfig = {}) {
    this.publishers = [];
    
    // 初始化各个发布器
    if (publishersConfig.wordpress) {
      this.publishers.push({
        name: 'WordPress',
        publisher: new WordPressPublisher(publishersConfig.wordpress)
      });
    }
    
    if (publishersConfig.cnblogs) {
      this.publishers.push({
        name: '博客园',
        publisher: new CnBlogsPublisher(publishersConfig.cnblogs)
      });
    }
  }

  /**
   * 发布文章到所有已配置的平台
   * @param {string} article - 文章内容 (Markdown)
   * @param {object} options - 发布选项
   * @returns {Promise<Array>} - 各平台发布结果
   */
  async publish(article, options = {}) {
    const results = [];
    
    for (const { name, publisher } of this.publishers) {
      console.log(`📤 正在发布到 ${name}...`);
      try {
        const result = await publisher.publish(article, options);
        results.push(result);
        
        if (result.success) {
          console.log(`✅ ${name} 发布成功: ${result.url}`);
        } else {
          console.log(`❌ ${name} 发布失败: ${result.error}`);
        }
      } catch (error) {
        console.log(`❌ ${name} 发布异常: ${error.message}`);
        results.push({
          success: false,
          platform: name,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * 获取已配置的平台列表
   */
  getConfiguredPlatforms() {
    return this.publishers.map(p => p.name);
  }
}

/**
 * 从环境变量加载配置
 */
function loadConfigFromEnv() {
  const config = {};
  
  // WordPress 配置
  if (process.env.WP_SITE_URL && process.env.WP_USERNAME && process.env.WP_PASSWORD) {
    config.wordpress = {
      siteUrl: process.env.WP_SITE_URL,
      username: process.env.WP_USERNAME,
      password: process.env.WP_PASSWORD
    };
  }
  
  // 博客园配置
  if (process.env.CNBLOGS_BLOGNAME && process.env.CNBLOGS_USERNAME && process.env.CNBLOGS_PASSWORD) {
    config.cnblogs = {
      blogName: process.env.CNBLOGS_BLOGNAME,
      username: process.env.CNBLOGS_USERNAME,
      password: process.env.CNBLOGS_PASSWORD
    };
  }
  
  return config;
}

module.exports = {
  MultiPublisher,
  WordPressPublisher,
  CnBlogsPublisher,
  loadConfigFromEnv
};
