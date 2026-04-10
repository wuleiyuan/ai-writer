const axios = require('axios');
const xml2js = require('xml2js');
const { BasePublisher } = require('./base');

class CnblogsPublisher extends BasePublisher {
  constructor(config = {}) {
    super(config);
    this.blogName = config.blogName;
    this.username = config.username;
    this.password = config.password;
    this.xmlrpcUrl = `https://rpc.cnblogs.com/metaweblog/${this.blogName}`;
  }

  async publish(title, content, options = {}) {
    try {
      const postData = {
        title: title,
        description: content,
        categories: []
      };

      const response = await axios.post(
        this.xmlrpcUrl,
        {
          methodcall: {
            methodname: 'metaWeblog.newPost',
            params: {
              param: [
                { value: { string: '1' } },
                { value: { string: this.username } },
                { value: { string: this.password } },
                { value: { struct: postData } },
                { value: { boolean: options.publish ? '1' : '0' } }
              ]
            }
          }
        },
        {
          headers: { 'Content-Type': 'text/xml' }
        }
      );

      const result = xml2js.parseStringSync(response.data);
      const postId = result?.methodResponse?.params?.[0]?.param?.[0]?.value?.[0]?.string?.[0];

      return {
        success: true,
        url: `https://www.cnblogs.com/${this.blogName}/p/${postId}.html`,
        message: `文章已发布到博客园`,
        platform: 'cnblogs'
      };
    } catch (error) {
      throw new Error('博客园发布失败: ' + error.message);
    }
  }
}

module.exports = CnblogsPublisher;
