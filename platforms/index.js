const platformPublishers = {
  cnblogs: {
    name: '博客园',
    publish: async (article, credentials) => {
      return { success: false, message: '请在博客园后台手动发布，或配置MetaWeblog API' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.cnblogs.com' });
        const hasAuth = cookies.some(c => c.name === '.CNBlogsCookie' || c.name === '.Cnblogs.AspNetCore.Cookies');
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  csdn: {
    name: 'CSDN',
    publish: async (article, credentials) => {
      return { success: false, message: '请在CSDN后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.csdn.net' });
        const hasAuth = cookies.some(c => c.name === 'UserName' || c.name === 'uuid_tt_dd');
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  '51cto': {
    name: '51CTO',
    publish: async (article, credentials) => {
      return { success: false, message: '请在51CTO后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.51cto.com' });
        const hasAuth = cookies.some(c => c.name === 'PHPSESSID' || c.name === 'auth');
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  juejin: {
    name: '稀土掘金',
    publish: async (article, credentials) => {
      return { success: false, message: '请在掘金后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.juejin.cn' });
        const hasAuth = cookies.some(c => c.name === 'sessionid' || c.name === 'sessionid_ss');
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  tencent: {
    name: '腾讯云开发者社区',
    publish: async (article, credentials) => {
      return { success: false, message: '请在腾讯云开发者社区后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.cloud.tencent.com' });
        const hasAuth = cookies.some(c => c.name === 'qcloud_login' || c.name === 'uin');
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  volcengine: {
    name: '火山引擎开发者社区',
    publish: async (article, credentials) => {
      return { success: false, message: '请在火山引擎开发者社区后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.volcengine.com' });
        const hasAuth = cookies.length > 0;
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  aliyun: {
    name: '阿里云开发者社区',
    publish: async (article, credentials) => {
      return { success: false, message: '请在阿里云开发者社区后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.aliyun.com' });
        const hasAuth = cookies.some(c => c.name === 'login_aliyunid' || c.name === 'aliyun_country');
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  huawei: {
    name: '华为云开发者社区',
    publish: async (article, credentials) => {
      return { success: false, message: '请在华为云开发者社区后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.huaweicloud.com' });
        const hasAuth = cookies.some(c => c.name === 'HWS_ID' || c.name === 'locale');
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  jdcloud: {
    name: '京东云开发者社区',
    publish: async (article, credentials) => {
      return { success: false, message: '请在京东云开发者社区后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.jdcloud.com' });
        const hasAuth = cookies.length > 0;
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  zhihu: {
    name: '知乎',
    publish: async (article, credentials) => {
      return { success: false, message: '请在知乎专栏后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.zhihu.com' });
        const hasAuth = cookies.some(c => c.name === 'z_c0' || c.name === '_xsrf');
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  jianshu: {
    name: '简书',
    publish: async (article, credentials) => {
      return { success: false, message: '请在简书后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.jianshu.com' });
        const hasAuth = cookies.some(c => c.name === 'remember_user_token' || c.name === '_session_id');
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  xiaobaotong: {
    name: '小报童',
    publish: async (article, credentials) => {
      return { success: false, message: '请在小报童后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.xiaobaotong.net' });
        const hasAuth = cookies.length > 0;
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  infoq: {
    name: 'InfoQ',
    publish: async (article, credentials) => {
      return { success: false, message: '请在InfoQ后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.infoq.cn' });
        const hasAuth = cookies.length > 0;
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  segmentfault: {
    name: 'SegmentFault思否',
    publish: async (article, credentials) => {
      return { success: false, message: '请在SegmentFault后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.segmentfault.com' });
        const hasAuth = cookies.some(c => c.name === 'PHPSESSID' || c.name === 'jwt');
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  },
  
  alipay: {
    name: '支付宝开发者社区',
    publish: async (article, credentials) => {
      return { success: false, message: '请在支付宝开发者社区后台手动发布' };
    },
    checkLogin: async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: '.alipay.com' });
        const hasAuth = cookies.length > 0;
        return { success: hasAuth, loggedIn: hasAuth };
      } catch (e) {
        return { success: false, loggedIn: false };
      }
    }
  }
};

if (typeof window !== 'undefined') {
  window.platformPublishers = platformPublishers;
}
