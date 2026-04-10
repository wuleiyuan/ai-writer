/**
 * 多平台发布器 - 统一入口 (工厂模式)
 * 支持同时发布到多个平台
 */

const { BasePublisher } = require('./base');

const PlatformPublishers = {
  wordpress: require('./wordpress'),
  cnblogs: require('./cnblogs'),
  juejin: require('./juejin'),
  zhihu: require('./zhihu'),
  csdn: require('./csdn'),
  xiaohongshu: require('./xiaohongshu'),
  wechat: require('./wechat')
};

const PlatformChecks = {
  wordpress: config => config.WP_SITE_URL && config.WP_USERNAME && config.WP_PASSWORD,
  cnblogs: config => config.CNBLOGS_BLOGNAME && config.CNBLOGS_USERNAME && config.CNBLOGS_PASSWORD,
  juejin: config => config.JUEJIN_COOKIE,
  zhihu: config => config.ZHIHU_COOKIE || config.ZHIHU_Z_C0,
  csdn: config => config.CSDN_COOKIE,
  xiaohongshu: config => config.XIAOHONGSHU_COOKIE || config.XIAOHONGSHU_ACCESS_TOKEN,
  wechat: config => config.WECHAT_APP_ID && config.WECHAT_APP_SECRET
};

const PlatformNames = {
  wordpress: 'WordPress',
  cnblogs: '博客园',
  juejin: '掘金',
  zhihu: '知乎',
  csdn: 'CSDN',
  xiaohongshu: '小红书',
  wechat: '微信公众号'
};

class MultiPublisher {
  constructor(publishersConfig = {}) {
    this.config = publishersConfig;
    this.publishers = this.initPublishers();
  }

  initPublishers() {
    const enabled = [];

    for (const [platform, PublisherClass] of Object.entries(PlatformPublishers)) {
      try {
        const isConfigured = PlatformChecks[platform]?.(this.config);
        if (isConfigured) {
          const configKey = platform === 'xiaohongshu' || platform === 'wechat' ? platform : platform;
          const publisher = new PublisherClass(this.config[configKey] || {});
          enabled.push({
            name: PlatformNames[platform] || platform,
            platform,
            publisher
          });
        }
      } catch (e) {
        console.warn(`平台 ${platform} 加载失败:`, e.message);
      }
    }

    return enabled;
  }

  getConfiguredPlatforms() {
    return this.publishers.map(p => p.name);
  }

  async publish(articleContent, options = {}) {
    const { title, content } = this.parseArticle(articleContent);

    const results = [];

    for (const { name, platform, publisher } of this.publishers) {
      console.log(`🔄 正在分发至: ${name}...`);

      try {
        const { title: pTitle, content: pContent } = await publisher.transform(title, content);
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

  parseArticle(articleContent) {
    const titleMatch = articleContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : '未命名文章';
    const content = articleContent.replace(/^#\s+.+$/m, '').trim();
    return { title, content };
  }

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

function loadConfigFromEnv() {
  return {
    wordpress: process.env.WP_SITE_URL ? {
      siteUrl: process.env.WP_SITE_URL,
      username: process.env.WP_USERNAME,
      password: process.env.WP_PASSWORD
    } : null,

    cnblogs: process.env.CNBLOGS_BLOGNAME ? {
      blogName: process.env.CNBLOGS_BLOGNAME,
      username: process.env.CNBLOGS_USERNAME,
      password: process.env.CNBLOGS_PASSWORD
    } : null,

    juejin: process.env.JUEJIN_COOKIE ? {
      cookie: process.env.JUEJIN_COOKIE,
      csrfToken: process.env.JUEJIN_CSRF_TOKEN
    } : null,

    zhihu: (process.env.ZHIHU_COOKIE || process.env.ZHIHU_Z_C0) ? {
      cookie: process.env.ZHIHU_COOKIE,
      z_c0: process.env.ZHIHU_Z_C0
    } : null,

    csdn: process.env.CSDN_COOKIE ? {
      cookie: process.env.CSDN_COOKIE,
      username: process.env.CSDN_USERNAME
    } : null,

    xiaohongshu: (process.env.XIAOHONGSHU_COOKIE || process.env.XIAOHONGSHU_ACCESS_TOKEN) ? {
      cookie: process.env.XIAOHONGSHU_COOKIE,
      accessToken: process.env.XIAOHONGSHU_ACCESS_TOKEN
    } : null,

    wechat: (process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET) ? {
      appId: process.env.WECHAT_APP_ID,
      appSecret: process.env.WECHAT_APP_SECRET,
      author: process.env.WECHAT_AUTHOR || 'AI写作助手'
    } : null
  };
}

module.exports = {
  MultiPublisher,
  BasePublisher,
  loadConfigFromEnv
};
