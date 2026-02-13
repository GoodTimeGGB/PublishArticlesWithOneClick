const platformConfigs = [
  {
    id: 'cnblogs',
    name: '博客园',
    icon: '博',
    color: '#008080',
    loginUrl: 'https://www.cnblogs.com/',
    authType: 'cookie',
    description: '访问主页后点击右上角登录',
    helpUrl: 'https://i.cnblogs.com/'
  },
  {
    id: 'csdn',
    name: 'CSDN',
    icon: 'C',
    color: '#FC5531',
    loginUrl: 'https://www.csdn.net/',
    authType: 'cookie',
    description: '访问主页后点击登录',
    helpUrl: 'https://mp.csdn.net/'
  },
  {
    id: '51cto',
    name: '51CTO',
    icon: '5',
    color: '#00A0E9',
    loginUrl: 'https://www.51cto.com/',
    authType: 'cookie',
    description: '访问主页后点击登录',
    helpUrl: 'https://blog.51cto.com/'
  },
  {
    id: 'juejin',
    name: '稀土掘金',
    icon: '掘',
    color: '#1E80FF',
    loginUrl: 'https://juejin.cn/',
    authType: 'cookie',
    description: '访问主页后点击登录',
    helpUrl: 'https://juejin.cn/'
  },
  {
    id: 'tencent',
    name: '腾讯云开发者社区',
    icon: '腾',
    color: '#00A4FF',
    loginUrl: 'https://cloud.tencent.com/',
    authType: 'cookie',
    description: '访问主页后点击登录',
    helpUrl: 'https://cloud.tencent.com/developer'
  },
  {
    id: 'volcengine',
    name: '火山引擎开发者社区',
    icon: '火',
    color: '#FF6A00',
    loginUrl: 'https://www.volcengine.com/',
    authType: 'cookie',
    description: '访问主页后点击登录',
    helpUrl: 'https://www.volcengine.com/developer'
  },
  {
    id: 'aliyun',
    name: '阿里云开发者社区',
    icon: '阿',
    color: '#FF6A00',
    loginUrl: 'https://developer.aliyun.com/',
    authType: 'cookie',
    description: '访问开发者社区后登录',
    helpUrl: 'https://developer.aliyun.com/'
  },
  {
    id: 'huawei',
    name: '华为云开发者社区',
    icon: '华',
    color: '#CF0A2C',
    loginUrl: 'https://developer.huaweicloud.com/',
    authType: 'cookie',
    description: '访问开发者社区后登录',
    helpUrl: 'https://developer.huaweicloud.com/'
  },
  {
    id: 'jdcloud',
    name: '京东云开发者社区',
    icon: '京',
    color: '#E1251B',
    loginUrl: 'https://developer.jdcloud.com/',
    authType: 'cookie',
    description: '访问开发者社区后登录',
    helpUrl: 'https://developer.jdcloud.com/'
  },
  {
    id: 'zhihu',
    name: '知乎',
    icon: '知',
    color: '#0066FF',
    loginUrl: 'https://www.zhihu.com/',
    authType: 'cookie',
    description: '访问主页后点击登录',
    helpUrl: 'https://zhuanlan.zhihu.com/'
  },
  {
    id: 'jianshu',
    name: '简书',
    icon: '简',
    color: '#EA6F5A',
    loginUrl: 'https://www.jianshu.com/',
    authType: 'cookie',
    description: '访问主页后点击登录',
    helpUrl: 'https://www.jianshu.com/'
  },
  {
    id: 'xiaobaotong',
    name: '小报童',
    icon: '报',
    color: '#FFD700',
    loginUrl: 'https://xiaobaotong.net/',
    authType: 'cookie',
    description: '访问主页后点击登录',
    helpUrl: 'https://xiaobaotong.net/'
  },
  {
    id: 'infoq',
    name: 'InfoQ',
    icon: 'Q',
    color: '#007DC5',
    loginUrl: 'https://www.infoq.cn/',
    authType: 'cookie',
    description: '访问主页后点击登录',
    helpUrl: 'https://www.infoq.cn/'
  },
  {
    id: 'segmentfault',
    name: 'SegmentFault思否',
    icon: 'S',
    color: '#009A61',
    loginUrl: 'https://segmentfault.com/',
    authType: 'cookie',
    description: '访问主页后点击登录',
    helpUrl: 'https://segmentfault.com/'
  },
  {
    id: 'alipay',
    name: '支付宝开发者社区',
    icon: '支',
    color: '#1677FF',
    loginUrl: 'https://open.alipay.com/',
    authType: 'cookie',
    description: '访问开放平台后登录',
    helpUrl: 'https://open.alipay.com/'
  }
];

let accounts = {};
let currentLoginPlatform = null;
let loginStep = 0;

document.addEventListener('DOMContentLoaded', async () => {
  await loadAccounts();
  renderPlatformList();
  bindEvents();
  loadSettings();
});

async function loadAccounts() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['accounts'], (result) => {
      accounts = result.accounts || {};
      resolve();
    });
  });
}

function renderPlatformList() {
  const list = document.getElementById('platformList');
  list.innerHTML = '';

  const headerDiv = document.createElement('div');
  headerDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;';
  headerDiv.innerHTML = `
    <span style="font-size: 14px; color: #666;">
      已绑定 <strong>${Object.values(accounts).filter(a => a.loggedIn).length}</strong> / ${platformConfigs.length} 个平台
    </span>
    <div style="display: flex; gap: 8px;">
      <button class="btn btn-secondary" id="bindAllBtn">批量绑定未绑定平台</button>
      <button class="btn btn-secondary" id="verifyAllBtn">验证所有已绑定</button>
    </div>
  `;
  list.appendChild(headerDiv);

  platformConfigs.forEach(platform => {
    const account = accounts[platform.id] || {};
    const isConnected = account.loggedIn || false;

    const card = document.createElement('div');
    card.className = 'platform-card';
    card.innerHTML = `
      <div class="platform-icon" style="background: ${platform.color}">${platform.icon}</div>
      <div class="platform-info">
        <div class="platform-name">${platform.name}</div>
        <div class="platform-status ${isConnected ? 'connected' : 'disconnected'}">
          ${isConnected ? '✓ 已绑定' : '✗ 未绑定'}
          ${isConnected && account.lastChecked ? ` (上次验证: ${new Date(account.lastChecked).toLocaleDateString()})` : ''}
        </div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">${platform.description}</div>
      </div>
      <div class="platform-actions">
        ${isConnected ? `
          <button class="btn btn-info" data-action="info" data-platform="${platform.id}">查看详情</button>
          <button class="btn btn-secondary" data-action="refresh" data-platform="${platform.id}">刷新状态</button>
          <button class="btn btn-danger" data-action="disconnect" data-platform="${platform.id}">解除绑定</button>
        ` : `
          <button class="btn btn-primary" data-action="login" data-platform="${platform.id}">登录绑定</button>
        `}
      </div>
    `;

    list.appendChild(card);
  });

  list.querySelectorAll('.btn[data-action]').forEach(btn => {
    btn.addEventListener('click', handlePlatformAction);
  });

  document.getElementById('bindAllBtn').addEventListener('click', bindAllPlatforms);
  document.getElementById('verifyAllBtn').addEventListener('click', verifyAllPlatforms);
}

async function handlePlatformAction(e) {
  const btn = e.target;
  const action = btn.dataset.action;
  const platformId = btn.dataset.platform;
  const platform = platformConfigs.find(p => p.id === platformId);

  switch (action) {
    case 'login':
      await loginPlatform(platform);
      break;
    case 'refresh':
      await refreshPlatformStatus(platform);
      break;
    case 'disconnect':
      await disconnectPlatform(platform);
      break;
    case 'info':
      await showPlatformInfo(platform);
      break;
  }
}

function resetModal() {
  const modal = document.getElementById('loginModal');
  const modalConfirm = document.getElementById('modalConfirm');
  modal.classList.remove('active');
  modalConfirm.disabled = false;
  modalConfirm.textContent = '确认';
  modalConfirm.onclick = null;
  currentLoginPlatform = null;
  loginStep = 0;
}

async function loginPlatform(platform) {
  const modal = document.getElementById('loginModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalConfirm = document.getElementById('modalConfirm');
  const modalCancel = document.getElementById('modalCancel');

  currentLoginPlatform = platform;
  loginStep = 1;

  modalTitle.textContent = `登录绑定 - ${platform.name}`;
  
  modalBody.innerHTML = `
    <div class="help-text">
      <strong>操作步骤：</strong><br>
      1. 点击"打开页面"按钮<br>
      2. 在打开的页面中完成登录<br>
      3. 登录成功后返回此页面<br>
      4. 点击"验证登录状态"按钮
    </div>
    <div class="form-group">
      <label>访问地址</label>
      <input type="text" value="${platform.loginUrl}" readonly style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <p style="margin-bottom: 16px; font-size: 13px; color: #666;">
      提示：${platform.description}
    </p>
  `;

  modalConfirm.disabled = false;
  modalConfirm.textContent = '打开页面';
  modal.classList.add('active');

  modalConfirm.onclick = async () => {
    if (loginStep === 1) {
      await chrome.tabs.create({ url: platform.loginUrl });
      loginStep = 2;
      modalBody.innerHTML = `
        <div class="help-text">
          <strong>请在打开的页面中完成登录</strong><br>
          登录成功后，返回此页面点击"验证登录状态"按钮。
        </div>
        <p style="color: #666; font-size: 13px;">
          注意：必须在该平台完成登录后才能验证成功。
        </p>
      `;
      modalConfirm.textContent = '验证登录状态';
    } else if (loginStep === 2) {
      modalConfirm.disabled = true;
      modalConfirm.textContent = '验证中...';
      
      const result = await verifyLogin(platform);
      if (result.success) {
        showToast(`${platform.name} 绑定成功！`, 'success');
        resetModal();
        await loadAccounts();
        renderPlatformList();
      } else {
        showToast(result.message || '验证失败，请确保已登录', 'error');
        modalConfirm.disabled = false;
        modalConfirm.textContent = '验证登录状态';
      }
    }
  };
}

async function bindAllPlatforms() {
  const unboundPlatforms = platformConfigs.filter(p => !accounts[p.id]?.loggedIn);
  
  if (unboundPlatforms.length === 0) {
    showToast('所有平台都已绑定！', 'success');
    return;
  }

  const modal = document.getElementById('loginModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalConfirm = document.getElementById('modalConfirm');

  modalTitle.textContent = '批量绑定平台';
  modalBody.innerHTML = `
    <div class="help-text">
      <strong>批量绑定说明：</strong><br>
      将依次打开各平台主页，请在每个页面完成登录后再点击"验证并继续"。
    </div>
    <div style="max-height: 300px; overflow-y: auto;">
      <p style="margin-bottom: 12px; font-weight: 600;">待绑定平台 (${unboundPlatforms.length}个)：</p>
      ${unboundPlatforms.map(p => `
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f6f8fa; border-radius: 4px; margin-bottom: 8px;">
          <span style="width: 24px; height: 24px; background: ${p.color}; color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px;">${p.icon}</span>
          <span>${p.name}</span>
        </div>
      `).join('')}
    </div>
  `;

  modalConfirm.textContent = '开始批量绑定';
  modalConfirm.disabled = false;
  modal.classList.add('active');

  let currentIndex = 0;

  const processNext = async () => {
    if (currentIndex < unboundPlatforms.length) {
      const platform = unboundPlatforms[currentIndex];
      modalBody.innerHTML = `
        <div class="help-text">
          <strong>正在绑定 ${platform.name}</strong> (${currentIndex + 1}/${unboundPlatforms.length})<br>
          请在打开的页面中完成登录，然后返回点击"验证并继续"。
        </div>
        <p style="color: #666; font-size: 13px;">
          提示：${platform.description}
        </p>
      `;
      
      await chrome.tabs.create({ url: platform.loginUrl });
      modalConfirm.textContent = '验证并继续';
      modalConfirm.disabled = false;
      modalConfirm.onclick = async () => {
        modalConfirm.disabled = true;
        modalConfirm.textContent = '验证中...';
        
        const result = await verifyLogin(platform);
        if (result.success) {
          showToast(`${platform.name} 绑定成功！`, 'success');
          await loadAccounts();
          currentIndex++;
          processNext();
        } else {
          showToast(`${platform.name} 验证失败：${result.message}`, 'error');
          modalConfirm.disabled = false;
          modalConfirm.textContent = '重新验证';
        }
      };
    } else {
      showToast('所有平台绑定完成！', 'success');
      resetModal();
      renderPlatformList();
    }
  };

  modalConfirm.onclick = processNext;
}

async function verifyAllPlatforms() {
  const boundPlatforms = platformConfigs.filter(p => accounts[p.id]?.loggedIn);
  
  if (boundPlatforms.length === 0) {
    showToast('没有已绑定的平台', 'info');
    return;
  }

  showToast('正在验证所有已绑定平台...', 'info');

  for (const platform of boundPlatforms) {
    const result = await verifyLogin(platform);
    if (!result.success) {
      delete accounts[platform.id].loggedIn;
    }
  }

  await chrome.storage.local.set({ accounts });
  await loadAccounts();
  renderPlatformList();
  showToast('验证完成！', 'success');
}

async function verifyLogin(platform) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: 'checkLogin',
      platform: platform.id
    }, (response) => {
      resolve(response || { success: false, message: '验证失败' });
    });
  });
}

async function refreshPlatformStatus(platform) {
  showToast('正在刷新状态...', 'info');
  const result = await verifyLogin(platform);
  if (result.success) {
    showToast(`${platform.name} 状态已更新`, 'success');
  } else {
    showToast(`${platform.name} 登录状态已失效，请重新绑定`, 'error');
  }
  await loadAccounts();
  renderPlatformList();
}

async function disconnectPlatform(platform) {
  if (!confirm(`确定要解除${platform.name}的绑定吗？`)) {
    return;
  }

  delete accounts[platform.id];
  await chrome.storage.local.set({ accounts });
  showToast(`已解除${platform.name}的绑定`, 'success');
  renderPlatformList();
}

async function showPlatformInfo(platform) {
  const account = accounts[platform.id];
  if (!account) {
    showToast('未找到绑定信息', 'error');
    return;
  }

  const modal = document.getElementById('loginModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalConfirm = document.getElementById('modalConfirm');
  const modalCancel = document.getElementById('modalCancel');

  modalTitle.textContent = `${platform.name} - 绑定详情`;

  const boundTime = account.lastChecked 
    ? new Date(account.lastChecked).toLocaleString('zh-CN')
    : '未知';
  
  const cookieInfo = account.cookieInfo || '无详细信息';
  const foundCookie = account.foundCookie || '未知';

  modalBody.innerHTML = `
    <div style="margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <span style="width: 48px; height: 48px; background: ${platform.color}; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600;">${platform.icon}</span>
        <div>
          <div style="font-size: 18px; font-weight: 600;">${platform.name}</div>
          <div style="color: #28a745; font-size: 13px;">✓ 已绑定</div>
        </div>
      </div>
    </div>
    
    <div style="background: #f6f8fa; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <div style="margin-bottom: 12px;">
        <span style="color: #666; font-size: 13px;">绑定状态</span>
        <div style="font-weight: 600; color: #28a745;">✓ 已登录</div>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #666; font-size: 13px;">上次验证时间</span>
        <div style="font-weight: 500;">${boundTime}</div>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #666; font-size: 13px;">验证方式</span>
        <div style="font-weight: 500;">${foundCookie === 'fallback' ? 'Cookie特征检测' : `认证Cookie: ${foundCookie}`}</div>
      </div>
    </div>

    <div style="background: #f6f8fa; border-radius: 8px; padding: 16px;">
      <div style="color: #666; font-size: 13px; margin-bottom: 8px;">检测到的Cookie信息</div>
      <div style="font-family: monospace; font-size: 12px; color: #333; word-break: break-all; line-height: 1.6;">
        ${cookieInfo}
      </div>
    </div>

    <div style="margin-top: 16px; padding: 12px; background: #e7f5ff; border-radius: 6px; font-size: 12px; color: #1971c2;">
      💡 <strong>提示：</strong>此信息用于诊断登录状态问题。如果状态异常，请尝试刷新状态或重新绑定。
    </div>
  `;

  modalConfirm.textContent = '关闭';
  modalConfirm.style.display = 'none';
  modalCancel.textContent = '关闭';
  modal.classList.add('active');

  const closeModal = () => {
    modal.classList.remove('active');
    modalConfirm.style.display = '';
  };

  modalConfirm.onclick = closeModal;
  modalCancel.onclick = closeModal;
  document.getElementById('modalClose').onclick = closeModal;
}

function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}-panel`).classList.add('active');
    });
  });

  document.getElementById('modalClose').addEventListener('click', resetModal);
  document.getElementById('modalCancel').addEventListener('click', resetModal);
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
}

function loadSettings() {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};
    document.getElementById('defaultPublishNow').checked = settings.defaultPublishNow !== false;
    document.getElementById('autoSaveInterval').value = settings.autoSaveInterval || 30;
    document.getElementById('markdownStyle').value = settings.markdownStyle || 'github';
  });
}

async function saveSettings() {
  const settings = {
    defaultPublishNow: document.getElementById('defaultPublishNow').checked,
    autoSaveInterval: parseInt(document.getElementById('autoSaveInterval').value),
    markdownStyle: document.getElementById('markdownStyle').value
  };
  
  await chrome.storage.local.set({ settings });
  showToast('设置已保存', 'success');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
