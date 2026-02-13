chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'publish') {
    handlePublish(request.platform, request.article)
      .then(sendResponse)
      .catch(error => sendResponse({ success: false, message: error.message }));
    return true;
  }
  
  if (request.action === 'checkLogin') {
    handleCheckLogin(request.platform)
      .then(sendResponse)
      .catch(error => {
        console.error('checkLogin error:', error);
        sendResponse({ success: false, loggedIn: false, message: error.message || '检测失败' });
      });
    return true;
  }

  if (request.action === 'debugCookies') {
    debugCookies(request.domains)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (request.action === 'getPlatformInfo') {
    getPlatformInfo(request.platform)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

async function debugCookies(domains) {
  const allCookies = [];
  for (const domain of domains) {
    try {
      const cookies = await chrome.cookies.getAll({ domain: domain });
      allCookies.push(...cookies.map(c => ({ 
        name: c.name, 
        domain: c.domain, 
        valueLength: c.value?.length || 0 
      })));
    } catch (e) {
      console.log(`Failed to get cookies for domain ${domain}:`, e);
    }
  }
  return { domains: domains, cookies: allCookies, count: allCookies.length };
}

async function getPlatformInfo(platformId) {
  const publisher = platformPublishers[platformId];
  if (!publisher) {
    return { error: '不支持的平台' };
  }

  try {
    const config = publisher.domains || [];
    const cookies = await getCookiesForDomains(config);
    
    return {
      platform: platformId,
      name: publisher.name,
      domains: config,
      cookieCount: cookies.length,
      cookies: cookies.map(c => ({
        name: c.name,
        domain: c.domain,
        valueLength: c.value?.length || 0,
        secure: c.secure,
        httpOnly: c.httpOnly,
        expirationDate: c.expirationDate
      }))
    };
  } catch (e) {
    return { error: e.message };
  }
}

async function handlePublish(platformId, article) {
  const publisher = platformPublishers[platformId];
  if (!publisher) {
    return { success: false, message: '不支持的平台' };
  }

  const accounts = await getAccounts();
  const credentials = accounts[platformId];
  
  if (!credentials || !credentials.loggedIn) {
    return { success: false, message: '请先绑定账号' };
  }

  try {
    const result = await publisher.publish(article, credentials);
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function handleCheckLogin(platformId) {
  const publisher = platformPublishers[platformId];
  if (!publisher) {
    return { success: false, loggedIn: false, message: '不支持的平台' };
  }

  try {
    console.log(`Checking login for platform: ${platformId}`);
    const result = await publisher.checkLogin();
    console.log(`Login check result for ${platformId}:`, result);
    
    if (result.success) {
      const accounts = await getAccounts();
      accounts[platformId] = {
        ...accounts[platformId],
        loggedIn: true,
        lastChecked: Date.now(),
        cookieInfo: result.cookieInfo,
        foundCookie: result.foundCookie
      };
      await chrome.storage.local.set({ accounts });
    }
    
    return result;
  } catch (error) {
    console.error(`Login check error for ${platformId}:`, error);
    return { success: false, loggedIn: false, message: error.message || '检测失败' };
  }
}

async function getAccounts() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['accounts'], (result) => {
      resolve(result.accounts || {});
    });
  });
}

async function getCookiesForDomains(domains) {
  const allCookies = [];
  for (const domain of domains) {
    try {
      const cookies = await chrome.cookies.getAll({ domain: domain });
      allCookies.push(...cookies);
    } catch (e) {
      console.log(`Failed to get cookies for domain ${domain}:`, e);
    }
  }
  return allCookies;
}

function getCookieInfo(cookies) {
  return cookies.map(c => `${c.name}(${c.value?.length || 0}字符)`).join(', ');
}

function checkLoginStatus(cookies, config) {
  const { authNames = [], minCookies = 3, minCookieLength = 20 } = config;
  
  for (const name of authNames) {
    const cookie = cookies.find(c => c.name === name);
    if (cookie && cookie.value && cookie.value.length > 5) {
      console.log(`Found auth cookie: ${name}`);
      return { success: true, foundCookie: name };
    }
  }
  
  const hasLongCookie = cookies.some(c => c.value && c.value.length > minCookieLength);
  if (hasLongCookie && cookies.length >= minCookies) {
    console.log(`Fallback: found ${cookies.length} cookies with some long values`);
    return { success: true, foundCookie: 'fallback' };
  }
  
  return { success: false };
}

const platformPublishers = {
  cnblogs: {
    name: '博客园',
    domains: ['.cnblogs.com', 'cnblogs.com'],
    publish: async () => ({ success: false, message: '请在博客园后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.cnblogs.com', 'cnblogs.com'];
        const cookies = await getCookiesForDomains(domains);
        console.log('Cnblogs cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['.CNBlogsCookie', '.Cnblogs.AspNetCore.Cookies', 'Cnblogs.AspNetCore.Cookies', 'CNBlogsCookie'],
          minCookies: 3,
          minCookieLength: 20
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录博客园', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  csdn: {
    name: 'CSDN',
    domains: ['.csdn.net', 'csdn.net'],
    publish: async () => ({ success: false, message: '请在CSDN后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.csdn.net', 'csdn.net'];
        const cookies = await getCookiesForDomains(domains);
        console.log('CSDN cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['UserName', 'UserToken', 'uuid_tt_dd', 'JWTToken', 'access_token'],
          minCookies: 3,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录CSDN', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  '51cto': {
    name: '51CTO',
    domains: ['.51cto.com', '51cto.com'],
    publish: async () => ({ success: false, message: '请在51CTO后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.51cto.com', '51cto.com'];
        const cookies = await getCookiesForDomains(domains);
        console.log('51CTO cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['auth', 'member_id', 'user_id', 'token', 'SESSIONID', 'login_token', 'userInfo'],
          minCookies: 3,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录51CTO', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  juejin: {
    name: '稀土掘金',
    domains: ['.juejin.cn', 'juejin.cn'],
    publish: async () => ({ success: false, message: '请在掘金后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.juejin.cn', 'juejin.cn'];
        const cookies = await getCookiesForDomains(domains);
        console.log('Juejin cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['sessionid', 'sessionid_ss', 'MONITOR_WEB_ID', 'passport_id'],
          minCookies: 2,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录掘金', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  tencent: {
    name: '腾讯云开发者社区',
    domains: ['.cloud.tencent.com', 'cloud.tencent.com', '.tencent.com'],
    publish: async () => ({ success: false, message: '请在腾讯云开发者社区后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.cloud.tencent.com', 'cloud.tencent.com', '.tencent.com'];
        const cookies = await getCookiesForDomains(domains);
        console.log('Tencent cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['uin', 'skey', 'uin_cookie', 'nick', 'login_type'],
          minCookies: 4,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录腾讯云', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  volcengine: {
    name: '火山引擎开发者社区',
    domains: ['.volcengine.com', 'volcengine.com'],
    publish: async () => ({ success: false, message: '请在火山引擎开发者社区后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.volcengine.com', 'volcengine.com'];
        const cookies = await getCookiesForDomains(domains);
        console.log('Volcengine cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['sessionid', 'token', 'userId', 'user_id'],
          minCookies: 3,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录火山引擎', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  aliyun: {
    name: '阿里云开发者社区',
    domains: ['.aliyun.com', 'aliyun.com'],
    publish: async () => ({ success: false, message: '请在阿里云开发者社区后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.aliyun.com', 'aliyun.com'];
        const cookies = await getCookiesForDomains(domains);
        console.log('Aliyun cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['login_aliyunid', 'login_aliyunid_csrf', 'aliyun_country', 'userName', 'login_aliyunid_pk'],
          minCookies: 4,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录阿里云', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  huawei: {
    name: '华为云开发者社区',
    domains: ['.huaweicloud.com', 'huaweicloud.com'],
    publish: async () => ({ success: false, message: '请在华为云开发者社区后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.huaweicloud.com', 'huaweicloud.com'];
        const cookies = await getCookiesForDomains(domains);
        console.log('Huawei cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['HWS_ID', 'userAccount', 'locale', 'userId', 'user_id'],
          minCookies: 4,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录华为云', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  jdcloud: {
    name: '京东云开发者社区',
    domains: ['.jdcloud.com', 'jdcloud.com'],
    publish: async () => ({ success: false, message: '请在京东云开发者社区后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.jdcloud.com', 'jdcloud.com'];
        const cookies = await getCookiesForDomains(domains);
        console.log('JDCloud cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['token', 'userId', 'user_id', 'sessionid'],
          minCookies: 3,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录京东云', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  zhihu: {
    name: '知乎',
    domains: ['.zhihu.com', 'zhihu.com'],
    publish: async () => ({ success: false, message: '请在知乎专栏后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.zhihu.com', 'zhihu.com'];
        const cookies = await getCookiesForDomains(domains);
        console.log('Zhihu cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['z_c0', 'SESSIONID', '_xsrf', 'zck', 'q_c1'],
          minCookies: 4,
          minCookieLength: 20
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录知乎', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  jianshu: {
    name: '简书',
    domains: ['.jianshu.com', 'jianshu.com'],
    publish: async () => ({ success: false, message: '请在简书后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.jianshu.com', 'jianshu.com'];
        const cookies = await getCookiesForDomains(domains);
        console.log('Jianshu cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['remember_user_token', 'token', '_session_id', 'user_id'],
          minCookies: 3,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录简书', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  xiaobaotong: {
    name: '小报童',
    domains: ['.xiaobaotong.net', 'xiaobaotong.net'],
    publish: async () => ({ success: false, message: '请在小报童后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.xiaobaotong.net', 'xiaobaotong.net'];
        const cookies = await getCookiesForDomains(domains);
        console.log('Xiaobaotong cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['token', 'userId', 'sessionid', 'auth'],
          minCookies: 2,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录小报童', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  infoq: {
    name: 'InfoQ',
    domains: ['.infoq.cn', 'infoq.cn'],
    publish: async () => ({ success: false, message: '请在InfoQ后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.infoq.cn', 'infoq.cn'];
        const cookies = await getCookiesForDomains(domains);
        console.log('InfoQ cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['token', 'userId', 'sessionid', 'auth', 'JWT_TOKEN'],
          minCookies: 3,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录InfoQ', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  segmentfault: {
    name: 'SegmentFault思否',
    domains: ['.segmentfault.com', 'segmentfault.com'],
    publish: async () => ({ success: false, message: '请在SegmentFault后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.segmentfault.com', 'segmentfault.com'];
        const cookies = await getCookiesForDomains(domains);
        console.log('SegmentFault cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['jwt', 'token', 'sf_remember', 'PHPSESSID', 'user_id'],
          minCookies: 3,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录SegmentFault', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  },
  
  alipay: {
    name: '支付宝开发者社区',
    domains: ['.alipay.com', 'alipay.com'],
    publish: async () => ({ success: false, message: '请在支付宝开发者社区后台手动发布' }),
    checkLogin: async () => {
      try {
        const domains = ['.alipay.com', 'alipay.com'];
        const cookies = await getCookiesForDomains(domains);
        console.log('Alipay cookies:', getCookieInfo(cookies));
        
        const result = checkLoginStatus(cookies, {
          authNames: ['token', 'userId', 'sessionid', 'LOGIN', 'ALIPAY_JSESSIONID'],
          minCookies: 5,
          minCookieLength: 15
        });
        
        return result.success 
          ? { success: true, loggedIn: true, cookieInfo: getCookieInfo(cookies), foundCookie: result.foundCookie }
          : { success: false, loggedIn: false, message: '未检测到登录状态，请确保已登录支付宝开放平台', cookieInfo: getCookieInfo(cookies) };
      } catch (e) {
        return { success: false, loggedIn: false, message: e.message };
      }
    }
  }
};
