/**
 * 图片上传器 - 支持多种图床
 * 自动将 Markdown 中的本地图片上传到图床
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ImageUploader {
  constructor(config = {}) {
    this.provider = config.provider || 'smms'; // smms, imgbb, github
    this.config = config;
  }

  /**
   * 上传单个图片
   */
  async uploadImage(imagePath) {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`图片不存在: ${imagePath}`);
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const fileName = path.basename(imagePath);

    switch (this.provider) {
      case 'smms':
        return await this.uploadSmms(imageBase64, fileName);
      case 'imgbb':
        return await this.uploadImgbb(imageBase64, fileName);
      case 'github':
        return await this.uploadGithub(imageBuffer, fileName);
      default:
        return await this.uploadSmms(imageBase64, fileName);
    }
  }

  /**
   * SM.MS 图床 (免费)
   */
  async uploadSmms(base64, fileName) {
    try {
      const response = await axios.post('https://sm.ms/api/v2/upload', 
        {
          smfile: Buffer.from(base64, 'base64'),
          fileName
        },
        {
          headers: {
            'Authorization': this.config.smmsToken || '',
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data?.success) {
        return response.data.data.url;
      }
      throw new Error(response.data?.message || '上传失败');
    } catch (error) {
      throw new Error(`SM.MS 上传失败: ${error.message}`);
    }
  }

  /**
   * ImgBB 图床 (免费)
   */
  async uploadImgbb(base64, fileName) {
    try {
      const response = await axios.post('https://api.imgbb.com/1/upload', 
        {
          key: this.config.imgbbApiKey,
          image: base64,
          name: fileName
        }
      );
      
      if (response.data?.success) {
        return response.data.data.image.url;
      }
      throw new Error(response.data?.error?.message || '上传失败');
    } catch (error) {
      throw new Error(`ImgBB 上传失败: ${error.message}`);
    }
  }

  /**
   * GitHub 图床 (免费，需配置)
   */
  async uploadGithub(buffer, fileName) {
    // 需要配置 GitHub token, repo, owner
    const { owner, repo, token, branch = 'main' } = this.config;
    
    if (!owner || !repo || !token) {
      throw new Error('GitHub 图床配置不完整');
    }

    const date = new Date().toISOString().slice(0, 10);
    const safeName = `${date}-${fileName}`.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path_ = `images/${safeName}`;

    try {
      const response = await axios.put(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path_}`,
        {
          message: `Upload image: ${safeName}`,
          content: buffer.toString('base64'),
          branch
        },
        {
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.content.download_url;
    } catch (error) {
      throw new Error(`GitHub 上传失败: ${error.message}`);
    }
  }

  /**
   * 处理文章中的所有图片
   */
  async processArticleImages(markdownContent, basePath = '.') {
    // 查找所有本地图片
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match;
    let newContent = markdownContent;

    while ((match = imageRegex.exec(markdownContent)) !== null) {
      const [, alt, imagePath] = match;
      
      // 只处理本地图片
      if (imagePath.startsWith('http')) {
        continue;
      }

      const fullPath = path.isAbsolute(imagePath) ? imagePath : path.join(basePath, imagePath);

      try {
        console.log(`📤 上传图片: ${imagePath}`);
        const url = await this.uploadImage(fullPath);
        newContent = newContent.replace(`](${imagePath})`, `](${url})`);
        console.log(`✅ 图片上传成功: ${url}`);
      } catch (error) {
        console.error(`❌ 图片上传失败: ${error.message}`);
      }
    }

    return newContent;
  }
}

module.exports = { ImageUploader };
