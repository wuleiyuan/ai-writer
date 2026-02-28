/**
 * 发布器基类 - 定义所有平台的标准行为
 */

class BasePublisher {
  constructor(config = {}) {
    this.config = config;
    this.name = 'Base';
  }

  /**
   * 平台特有的内容转换 (Hook)
   * 子类可重写此方法实现自定义转换
   */
  async transform(title, content) {
    return { title, content };
  }

  /**
   * 执行发布 (由子类实现)
   */
  async publish(title, content, options = {}) {
    throw new Error(`Platform ${this.name} must implement publish()`);
  }

  /**
   * 获取平台名称
   */
  getName() {
    return this.name;
  }

  /**
   * 检查是否已配置
   */
  isConfigured() {
    return true;
  }

  /**
   * 将 Markdown 内容转换为平台适配的格式
   */
  formatContent(content, platform) {
    // 通用格式化逻辑
    return content;
  }
}

module.exports = { BasePublisher };
