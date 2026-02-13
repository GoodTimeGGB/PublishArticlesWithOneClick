const platforms = [
  { id: 'cnblogs', name: '博客园', icon: '博', color: '#008080', domain: 'cnblogs.com' },
  { id: 'csdn', name: 'CSDN', icon: 'C', color: '#FC5531', domain: 'csdn.net' },
  { id: '51cto', name: '51CTO', icon: '5', color: '#00A0E9', domain: '51cto.com' },
  { id: 'juejin', name: '稀土掘金', icon: '掘', color: '#1E80FF', domain: 'juejin.cn' },
  { id: 'tencent', name: '腾讯云', icon: '腾', color: '#00A4FF', domain: 'cloud.tencent.com' },
  { id: 'volcengine', name: '火山引擎', icon: '火', color: '#FF6A00', domain: 'volcengine.com' },
  { id: 'aliyun', name: '阿里云', icon: '阿', color: '#FF6A00', domain: 'aliyun.com' },
  { id: 'huawei', name: '华为云', icon: '华', color: '#CF0A2C', domain: 'huaweicloud.com' },
  { id: 'jdcloud', name: '京东云', icon: '京', color: '#E1251B', domain: 'jdcloud.com' },
  { id: 'zhihu', name: '知乎', icon: '知', color: '#0066FF', domain: 'zhihu.com' },
  { id: 'jianshu', name: '简书', icon: '简', color: '#EA6F5A', domain: 'jianshu.com' },
  { id: 'xiaobaotong', name: '小报童', icon: '报', color: '#FFD700', domain: 'xiaobaotong.net' },
  { id: 'infoq', name: 'InfoQ', icon: 'Q', color: '#007DC5', domain: 'infoq.cn' },
  { id: 'segmentfault', name: 'SegmentFault', icon: 'S', color: '#009A61', domain: 'segmentfault.com' },
  { id: 'alipay', name: '支付宝开发者', icon: '支', color: '#1677FF', domain: 'alipay.com' }
];

let currentArticle = {
  title: '',
  content: '',
  html: ''
};

let selectedPlatforms = new Set();
let accountStatus = {};

document.addEventListener('DOMContentLoaded', async () => {
  await initEditor();
  await loadAccountStatus();
  renderPlatformGrid();
  bindEvents();
  loadDraft();
});

async function initEditor() {
  const editor = document.getElementById('markdownEditor');
  const preview = document.getElementById('previewContent');
  
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      highlight: function(code, lang) {
        if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (e) {}
        }
        return code;
      },
      breaks: true,
      gfm: true
    });
  }

  editor.addEventListener('input', () => {
    const content = editor.value;
    currentArticle.content = content;
    updatePreview();
    saveDraft();
  });

  document.getElementById('articleTitle').addEventListener('input', (e) => {
    currentArticle.title = e.target.value;
    saveDraft();
  });
}

function updatePreview() {
  const preview = document.getElementById('previewContent');
  if (typeof marked !== 'undefined') {
    preview.innerHTML = marked.parse(currentArticle.content || '');
  } else {
    preview.innerHTML = '<p>预览功能需要加载 marked.js 库</p>';
  }
  currentArticle.html = preview.innerHTML;
}

async function loadAccountStatus() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['accounts'], (result) => {
      accountStatus = result.accounts || {};
      resolve();
    });
  });
}

function renderPlatformGrid() {
  const grid = document.getElementById('platformGrid');
  grid.innerHTML = '';

  platforms.forEach(platform => {
    const item = document.createElement('div');
    item.className = 'platform-item';
    item.dataset.platformId = platform.id;
    
    const hasAccount = accountStatus[platform.id]?.loggedIn || false;
    if (!hasAccount) {
      item.classList.add('disabled');
    }
    if (selectedPlatforms.has(platform.id)) {
      item.classList.add('selected');
    }

    item.innerHTML = `
      <div class="platform-icon" style="background: ${platform.color}">${platform.icon}</div>
      <div>
        <div class="platform-name">${platform.name}</div>
        <div class="platform-status">${hasAccount ? '已绑定' : '未绑定'}</div>
      </div>
    `;

    item.addEventListener('click', () => {
      if (!hasAccount) {
        showNotification(`请先在设置中绑定${platform.name}账号`, 'warning');
        return;
      }
      togglePlatformSelection(platform.id);
    });

    grid.appendChild(item);
  });
}

function togglePlatformSelection(platformId) {
  if (selectedPlatforms.has(platformId)) {
    selectedPlatforms.delete(platformId);
  } else {
    selectedPlatforms.add(platformId);
  }
  renderPlatformGrid();
}

function bindEvents() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
      
      if (tab.dataset.tab === 'publish') {
        updatePublishPreview();
      } else if (tab.dataset.tab === 'history') {
        loadHistory();
      }
    });
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('selectAllBtn').addEventListener('click', () => {
    const allBound = platforms.filter(p => accountStatus[p.id]?.loggedIn);
    if (selectedPlatforms.size === allBound.length) {
      selectedPlatforms.clear();
    } else {
      allBound.forEach(p => selectedPlatforms.add(p.id));
    }
    renderPlatformGrid();
  });

  document.getElementById('publishBtn').addEventListener('click', publishArticle);

  document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

  document.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      insertMarkdown(action);
    });
  });
}

function insertMarkdown(action) {
  const editor = document.getElementById('markdownEditor');
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selectedText = editor.value.substring(start, end);
  
  let newText = '';
  let cursorOffset = 0;

  switch (action) {
    case 'bold':
      newText = `**${selectedText || '粗体文本'}**`;
      cursorOffset = selectedText ? 0 : -2;
      break;
    case 'italic':
      newText = `*${selectedText || '斜体文本'}*`;
      cursorOffset = selectedText ? 0 : -1;
      break;
    case 'heading':
      newText = `## ${selectedText || '标题'}`;
      break;
    case 'link':
      newText = `[${selectedText || '链接文本'}](url)`;
      break;
    case 'image':
      newText = `![${selectedText || '图片描述'}](image-url)`;
      break;
    case 'code':
      newText = selectedText.includes('\n') 
        ? `\`\`\`\n${selectedText || '代码'}\n\`\`\``
        : `\`${selectedText || '代码'}\``;
      break;
    case 'quote':
      newText = `> ${selectedText || '引用文本'}`;
      break;
    case 'list':
      newText = `- ${selectedText || '列表项'}`;
      break;
  }

  editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
  editor.focus();
  const newCursorPos = start + newText.length + cursorOffset;
  editor.setSelectionRange(newCursorPos, newCursorPos);
  
  currentArticle.content = editor.value;
  updatePreview();
  saveDraft();
}

function updatePublishPreview() {
  document.getElementById('publishTitle').textContent = currentArticle.title || '未命名文章';
  const summary = currentArticle.content 
    ? currentArticle.content.substring(0, 100).replace(/[#*`]/g, '') + '...'
    : '暂无内容';
  document.getElementById('publishSummary').textContent = summary;
}

async function publishArticle() {
  if (!currentArticle.title) {
    showNotification('请输入文章标题', 'error');
    return;
  }
  if (!currentArticle.content) {
    showNotification('请输入文章内容', 'error');
    return;
  }
  if (selectedPlatforms.size === 0) {
    showNotification('请选择至少一个发布平台', 'error');
    return;
  }

  const publishBtn = document.getElementById('publishBtn');
  publishBtn.disabled = true;
  publishBtn.innerHTML = '<span class="loading-spinner"></span> 发布中...';

  const statusContainer = document.getElementById('publishStatus');
  statusContainer.innerHTML = '';

  const results = [];
  const platformArray = Array.from(selectedPlatforms);

  for (const platformId of platformArray) {
    const platform = platforms.find(p => p.id === platformId);
    const statusItem = createStatusItem(platform, 'pending', '发布中...');
    statusContainer.appendChild(statusItem);

    try {
      const result = await publishToPlatform(platformId, currentArticle);
      results.push({ platform: platformId, success: result.success, message: result.message, url: result.url });
      updateStatusItem(statusItem, result.success ? 'success' : 'error', 
        result.success ? '发布成功' : result.message,
        result.url
      );
    } catch (error) {
      results.push({ platform: platformId, success: false, message: error.message });
      updateStatusItem(statusItem, 'error', `发布失败: ${error.message}`);
    }
  }

  publishBtn.disabled = false;
  publishBtn.textContent = '一键发布';

  saveToHistory(results);
}

async function publishToPlatform(platformId, article) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: 'publish',
      platform: platformId,
      article: {
        title: article.title,
        content: article.content,
        html: article.html
      }
    }, (response) => {
      if (response && response.success) {
        resolve(response);
      } else {
        reject(new Error(response?.message || '发布失败'));
      }
    });
  });
}

function createStatusItem(platform, status, message) {
  const item = document.createElement('div');
  item.className = 'status-item';
  item.innerHTML = `
    <div class="platform-icon" style="background: ${platform.color}; width: 24px; height: 24px; font-size: 11px;">${platform.icon}</div>
    <span class="status-text">${platform.name}: ${message}</span>
    <div class="status-icon ${status}">
      ${status === 'pending' ? '<span class="loading-spinner"></span>' : (status === 'success' ? '✓' : '✗')}
    </div>
  `;
  return item;
}

function updateStatusItem(item, status, message, url) {
  const statusIcon = item.querySelector('.status-icon');
  statusIcon.className = `status-icon ${status}`;
  statusIcon.textContent = status === 'success' ? '✓' : '✗';
  
  const statusText = item.querySelector('.status-text');
  if (url && status === 'success') {
    statusText.innerHTML = `${statusText.textContent.split(':')[0]}: <a href="${url}" target="_blank">${message}</a>`;
  } else {
    statusText.textContent = `${statusText.textContent.split(':')[0]}: ${message}`;
  }
}

function saveDraft() {
  chrome.storage.local.set({
    draft: {
      title: currentArticle.title,
      content: currentArticle.content,
      timestamp: Date.now()
    }
  });
}

function loadDraft() {
  chrome.storage.local.get(['draft'], (result) => {
    if (result.draft) {
      currentArticle.title = result.draft.title || '';
      currentArticle.content = result.draft.content || '';
      document.getElementById('articleTitle').value = currentArticle.title;
      document.getElementById('markdownEditor').value = currentArticle.content;
      updatePreview();
    }
  });
}

function saveToHistory(results) {
  chrome.storage.local.get(['history'], (result) => {
    const history = result.history || [];
    history.unshift({
      id: Date.now(),
      title: currentArticle.title,
      content: currentArticle.content,
      platforms: results.map(r => ({
        id: r.platform,
        success: r.success,
        url: r.url
      })),
      timestamp: Date.now()
    });
    chrome.storage.local.set({ history: history.slice(0, 50) });
  });
}

function loadHistory() {
  chrome.storage.local.get(['history'], (result) => {
    const history = result.history || [];
    const list = document.getElementById('historyList');
    
    if (history.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>暂无发布历史</p>
        </div>
      `;
      return;
    }

    list.innerHTML = history.map(item => `
      <div class="history-item" data-id="${item.id}">
        <div class="history-item-title">${item.title}</div>
        <div class="history-item-meta">
          <span>${new Date(item.timestamp).toLocaleString('zh-CN')}</span>
          <span>${item.platforms.filter(p => p.success).length}/${item.platforms.length} 平台发布成功</span>
        </div>
        <div class="history-item-platforms">
          ${item.platforms.map(p => {
            const platform = platforms.find(pl => pl.id === p.id);
            return `<span class="history-platform-badge" style="color: ${p.success ? '#28a745' : '#dc3545'}">${platform?.name || p.id}</span>`;
          }).join('')}
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const historyItem = history.find(h => h.id === parseInt(item.dataset.id));
        if (historyItem) {
          currentArticle.title = historyItem.title;
          currentArticle.content = historyItem.content;
          document.getElementById('articleTitle').value = currentArticle.title;
          document.getElementById('markdownEditor').value = currentArticle.content;
          updatePreview();
          saveDraft();
          document.querySelector('.tab[data-tab="editor"]').click();
        }
      });
    });
  });
}

function clearHistory() {
  if (confirm('确定要清空所有发布历史吗？')) {
    chrome.storage.local.set({ history: [] });
    loadHistory();
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 12px 16px;
    background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#667eea'};
    color: ${type === 'warning' ? '#333' : 'white'};
    border-radius: 6px;
    font-size: 14px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
