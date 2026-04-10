const axios = require('axios');
const https = require('https');
const http = require('http');

class VideoConverter {
  constructor() {
    this.supportedPlatforms = ['bilibili', 'youtube', 'youku', 'douyin'];
  }

  async extract(videoUrl) {
    if (videoUrl.includes('bilibili.com') || videoUrl.includes('b23.tv')) {
      return await this.extractBilibili(videoUrl);
    } else if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      return await this.extractYoutube(videoUrl);
    } else if (videoUrl.includes('douyin.com')) {
      return await this.extractDouyin(videoUrl);
    } else {
      throw new Error('暂不支持该平台，仅支持：B站、YouTube、抖音');
    }
  }

  async extractBilibili(url) {
    try {
      const videoId = this.extractBilibiliId(url);
      if (!videoId) {
        throw new Error('无法解析B站视频ID');
      }

      const transcriptUrl = `https://api.bilibili.com/x/web-interface/view/detail/detail台词本?aid=${videoId}`;

      const response = await axios.get(transcriptUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com/'
        },
        timeout: 10000
      });

      if (response.data && response.data.data && response.data.data.list) {
        const subtitles = response.data.data.list;
        if (subtitles.length > 0) {
          const content = subtitles.map(s => s.content).join('\n');
          return this.processSubtitles(content, 'B站视频');
        }
      }

      const detailUrl = `https://api.bilibili.com/x/web-interface/view?aid=${videoId}`;
      const detailRes = await axios.get(detailUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://www.bilibili.com/'
        },
        timeout: 10000
      });

      if (detailRes.data && detailRes.data.data) {
        const videoInfo = detailRes.data.data;
        return `视频标题: ${videoInfo.title}\n\n视频描述:\n${videoInfo.desc}\n\n标签: ${videoInfo.tags?.map(t => t.tag_name).join(', ') || '无'}\n\n注意: 该视频暂无字幕，请参考视频描述和标题`;
      }

      throw new Error('无法获取视频信息');
    } catch (error) {
      throw new Error('B站视频解析失败: ' + error.message);
    }
  }

  extractBilibiliId(url) {
    const patterns = [
      /bilibili\.com\/video\/BV([a-zA-Z0-9]+)/,
      /bilibili\.com\/video\/av(\d+)/,
      /b23\.tv\/([a-zA-Z0-9]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1] || match[2];
      }
    }
    return null;
  }

  async extractYoutube(url) {
    try {
      const videoId = this.extractYoutubeId(url);
      if (!videoId) {
        throw new Error('无法解析YouTube视频ID');
      }

      const response = await axios.get(
        `https://youtubetranscript.com/api/captions?video_id=${videoId}`,
        { timeout: 10000 }
      ).catch(() => null);

      if (response && response.data) {
        return this.processSubtitles(response.data, 'YouTube视频');
      }

      return `YouTube视频: ${url}\n\n请提供视频内容的文字描述或字幕`;
    } catch (error) {
      throw new Error('YouTube视频解析失败: ' + error.message);
    }
  }

  extractYoutubeId(url) {
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /youtu\.be\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  async extractDouyin(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          'Referer': 'https://www.douyin.com/'
        },
        timeout: 10000
      });

      return `抖音视频: ${url}\n\n请复制视频的文案或描述内容`;
    } catch (error) {
      throw new Error('抖音视频解析失败: ' + error.message);
    }
  }

  processSubtitles(subtitles, source) {
    const cleaned = subtitles
      .replace(/<\/?[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    return `【${source}内容整理】\n\n${cleaned}`;
  }
}

module.exports = VideoConverter;
