class BasePublisher {
  constructor(config = {}) {
    this.config = config;
  }

  async publish(title, content, options = {}) {
    throw new Error('publish() 方法必须被子类实现');
  }

  async transform(title, content) {
    return { title, content };
  }

  parseArticle(articleContent) {
    const titleMatch = articleContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : '未命名文章';
    const content = articleContent.replace(/^#\s+.+$/m, '').trim();
    return { title, content };
  }
}

module.exports = { BasePublisher };
