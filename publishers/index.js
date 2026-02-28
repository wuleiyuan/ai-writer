/**
 * 多平台发布器 - 统一入口
 * 支持同时发布到多个平台
 */

const WordPressPublisher = require('./wordpress');
const CnBlogsPublisher = require('./cnblogs');
const JuejinPublisher = require('./juejin');
const ZhihuPublisher = require('./zhihu');
const CSDNPublisher = require('./csdn');
const XiaohongshuPublisher = require('./xiaohongshu');

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
    
    if (publishersConfig.juejin) {
      this.publishers.push({
        name: '掘金',
        publisher: new JuejinPublisher(publishersConfig.juejin)
      });
    }
    
    if (publishersConfig.zhihu) {
      this.publishers.push({
        name: '知乎',
        publisher: new ZhihuPublisher(publishersConfig.zhihu)
      });
    }
    
    if (publishersConfig.csdn) {
      this.publishers.push({
        name: 'CSDN',
        publisher: new CSDNPublisher(publishersConfig.csdn)
      });
    }
    
    if (publishersConfig.xiaohongshu) {
      this.publishers.push({
        name: '小红书',
        publisher: new XiaohongshuPublisher(publishersConfig.xiaohongshu)
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
          console.log(`✅ ${name} 发布成功: ${result.url || result.message}`);
        } else {
          console.log(`❌ ${name} 发布失败: ${result.error || result.message}`);
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
   * 发布到指定平台
   * @param {string} platform - 平台名称
   */
  async publishTo(article, platform, options = {}) {
    const target = this.publishers.find(p => p.name === platform);
    if (!target) {
      throw new Error(`未找到平台: ${platform}`);
    }
    return target.publisher.publish(article, options);
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
  
  // 掘金配置
  if (process.env.JUEJIN_COOKIE) {
    config.juejin = {
      cookie: process.env.JUEJIN_COOKIE,
      csrfToken: process.env.JUEJIN_CSRF_TOKEN
    };
  }
  
  // 知乎配置
  if (process.env.ZHIHU_COOKIE || process.env.ZHIHU_Z_C0) {
    config.zhihu = {
      cookie: process.env.ZHIHU_COOKIE,
      z_c0: process.env.ZHIHU_Z_C0
    };
  }
  
  // CSDN 配置
  if (process.env.CSDN_COOKIE) {
    config.csdn = {
      cookie: process.env.CSDN_COOKIE,
      username: process.env.CSDN_USERNAME
    };
  }
  
  // 小红书配置
  if (process.env.XIAOHONGSHU_COOKIE || process.env.XIAOHONGSHU_ACCESS_TOKEN) {
    config.xiaohongshu = {
      cookie: process.env.XIAOHONGSHU_COOKIE,
      accessToken: process.env.XIAOHONGSHU_ACCESS_TOKEN
    };
  }
  
  return config;
}

module.exports = {
  MultiPublisher,
  WordPressPublisher,
  CnBlogsPublisher,
  JuejinPublisher,
  ZhihuPublisher,
  CSDNPublisher,
  XiaohongshuPublisher,
  loadConfigFromEnv
};
