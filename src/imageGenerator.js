const axios = require('axios');

class ImageGenerator {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.dalleUrl = 'https://api.openai.com/v1/images/generations';
  }

  async generate(title, keywords = '') {
    if (!this.openaiKey) {
      throw new Error('未配置 OPENAI_API_KEY，无法生成封面图');
    }

    const prompt = this.buildPrompt(title, keywords);

    try {
      const response = await axios.post(this.dalleUrl, {
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        style: 'vivid',
        response_format: 'url'
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      if (response.data && response.data.data && response.data.data[0]) {
        return response.data.data[0].url;
      }

      throw new Error('封面生成失败');
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error('DALL-E 错误: ' + error.response.data.error?.message || error.message);
      }
      throw new Error('封面生成失败: ' + error.message);
    }
  }

  buildPrompt(title, keywords) {
    const keywordStr = keywords ? keywords.split(',').map(k => k.trim()).join(', ') : '';

    return `Create a professional article cover image for a Chinese tech blog post.

Title: ${title}
Keywords: ${keywordStr || 'technology, innovation'}

Requirements:
- Modern, clean design suitable for WeChat public account articles
- Use a color scheme with green (#07c160) as the primary accent color
- Include abstract geometric shapes or subtle tech elements
- No text or Chinese characters in the image
- Professional and eye-catching
- High quality, 1024x1024 resolution
- Vivid style`;
  }

  async generateWithUnsplash(keywords) {
    const keywordList = keywords ? keywords.split(',').map(k => k.trim()) : ['technology', 'ai'];
    const query = keywordList.join(',');

    const response = await axios.get('https://source.unsplash.com/featured/1024x768', {
      params: { query },
      timeout: 10000
    });

    return response.request.res.responseUrl;
  }
}

module.exports = ImageGenerator;
