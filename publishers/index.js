/**
 * 多平台发布器 - 统一入口 (工厂模式)
 * 支持同时发布到多个平台
 */

const { BasePublisher } = require('./base');

// 动态加载各平台发布器
const PlatformPublishers = {
  wordpress: require('./wordpress'),
  cnblogs: require('./cnblogs'),
  juejin: require('./juejin'),
  zhihu: require('./zhihu'),
  csdn: require('./csdn'),
  xiaohongshu: require('./xiaohongshu')
};

// 平台配置检查映射
const PlatformChecks = {
  wordpress: config => config.WP_SITE_URL && config.WP_USERNAME && config.WP_PASSWORD,
  cnblogs: config => config.CNBLOGS_BLOGNAME && config.CNBLOGS_USERNAME && config.CNBLOGS_PASSWORD,
  juejin: config => config.JUEJIN_COOKIE,
  zhihu: config => config.ZHIHU_COOKIE || config.ZHIHU_Z_C0,
  csdn: config => config.CSDN_COOKIE,
  xiaohongshu: config => config.XIAOHONGSHU_COOKIE || config.XIAOHONGSHU_ACCESS_TOKEN
};

// 平台显示名称
const PlatformNames = {
  wordpress: 'WordPress',
  cnblogs: '博客园',
  juejin: '掘金',
  zhihu: '知乎',
  csdn: 'CSDN',
  xiaohongshu: '小红书'
};

class MultiPublisher {
  constructor(publishersConfig = {}) {
    this.config = publishersConfig;
    this.publishers = this.initPublishers();
  }

  /**
   * 初始化所有已配置的平台发布器
   */
  initPublishers() {
    const enabled = [];
    
    for (const [platform, PublisherClass] of Object.entries(PlatformPublishers)) {
      try {
        // 检查是否配置了该平台
        const isConfigured = PlatformChecks[platform]?.(this.config);
        if (isConfigured) {
          const configKey = platform === 'xiaohongshu' ? 'xiaohongshu' : platform;
          const publisher = new PublisherClass(this.config[configKey] || {});
          enabled.push({
            name: PlatformNames[platform] || platform,
            platform,
            publisher
          });
        }
      } catch (e) {
        // 忽略加载失败的平台
      }
    }
    
    return enabled;
  }

  /**
   * 获取已配置的平台列表
   */
  getConfiguredPlatforms() {
    return this.publishers.map(p => p.name);
  }

  /**
   * 统一发布流程：Transform -> Validate -> Execute
   */
  async publish(articleContent, options = {}) {
    // 1. 解析标题和内容
    const { title, content } = this.parseArticle(articleContent);
    
    const results = [];
    
    // 2. 遍历所有已配置的平台
    for (const { name, platform, publisher } of this.publishers) {
      console.log(`🔄 正在分发至: ${name}...`);
      
      try {
        // 2.1 平台内容转换 (Hook)
        const { title: pTitle, content: pContent } = await publisher.transform(title, content);
        
        // 2.2 执行发布
        const result = await publisher.publish(pTitle, pContent, options);
        
        results.push({
          platform: name,
          success: true,
          url: result.url || result.message,
          data: result
        });
        
        console.log(`✅ ${name} 发布成功: ${result.url || result.message}`);
        
      } catch (error) {
        console.error(`❌ ${name} 发布失败: ${error.message}`);
        results.push({
          platform: name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * 解析文章，提取标题和内容
   */
  parseArticle(articleContent) {
    const titleMatch = articleContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : '未命名文章';
    const content = articleContent.replace(/^#\s+.+$/m, '').trim();
    return { title, content };
  }

  /**
   * 发布到指定平台
   */
  async publishTo(platformName, articleContent, options = {}) {
    const target = this.publishers.find(p => p.name === platformName);
    if (!target) {
      throw new Error(`未找到平台: ${platformName}`);
    }
    
    const { title, content } = this.parseArticle(articleContent);
    const { title: pTitle, content: pContent } = await target.publisher.transform(title, content);
    
    return await target.publisher.publish(pTitle, pContent, options);
  }
}

/**
 * 从环境变量加载配置
 */
function loadConfigFromEnv() {
  return {
    // WordPress
    wordpress: process.env.WP_SITE_URL ? {
      siteUrl: process.env.WP_SITE_URL,
      username: process.env.WP_USERNAME,
      password: process.env.WP_PASSWORD
    } : null,
    
    // 博客园
    cnblogs: process.env.CNBLOGS_BLOGNAME ? {
      blogName: process.env.CNBLOGS_BLOGNAME,
      username: process.env.CNBLOGS_USERNAME,
      password: process.env.CNBLOGS_PASSWORD
    } : null,
    
    // 掘金
    juejin: process.env.JUEJIN_COOKIE ? {
      cookie: process.env.JUEJIN_COOKIE,
      csrfToken: process.env.JUEJIN_CSRF_TOKEN
    } : null,
    
    // 知乎
    zhihu: (process.env.ZHIHU_COOKIE || process.env.ZHIHU_Z_C0) ? {
      cookie: process.env.ZHIHU_COOKIE,
      z_c0: process.env.ZHIHU_Z_C0
    } : null,
    
    // CSDN
    csdn: process.env.CSDN_COOKIE ? {
      cookie: process.env.CSDN_COOKIE,
      username: process.env.CSDN_USERNAME
    } : null,
    
    // 小红书
    xiaohongshu: (process.env.XIAOHONGSHU_COOKIE || process.env.XIAOHONGSHU_ACCESS_TOKEN) ? {
      cookie: process.env.XIAOHONGSHU_COOKIE,
      accessToken: process.env.XIAOHONGSHU_ACCESS_TOKEN
    } : null
  };
}

module.exports = {
  MultiPublisher,
  BasePublisher,
  loadConfigFromEnv
};
