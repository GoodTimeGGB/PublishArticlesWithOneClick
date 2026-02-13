# 一键发布文章助手

一个强大的浏览器插件，支持在线编辑Markdown文章并一键发布到多个博客平台。

## 支持的平台

- 博客园 (cnblogs.com)
- CSDN (csdn.net)
- 51CTO博客 (51cto.com)
- 稀土掘金 (juejin.cn)
- 腾讯云开发者社区
- 火山引擎开发者社区
- 阿里云开发者社区
- 华为云开发者社区
- 京东云开发者社区
- 知乎
- 简书
- 小报童
- InfoQ (infoq.cn)
- SegmentFault思否
- 支付宝开发者社区

## 功能特点

- 📝 **Markdown编辑器**：内置强大的Markdown编辑器，支持实时预览
- 👁️ **实时预览**：边写边看，所见即所得
- 🔐 **账号管理**：安全存储各平台登录状态
- 🚀 **一键发布**：选择多个平台，一键同步发布
- 📋 **历史记录**：保存发布历史，方便管理
- 💾 **自动保存**：草稿自动保存，不怕丢失

## 安装方法

### Chrome浏览器

1. 打开Chrome浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本插件所在的文件夹
5. 安装成功后，浏览器工具栏会显示插件图标

### Edge浏览器

1. 打开Edge浏览器，访问 `edge://extensions/`
2. 开启左下角的"开发人员模式"
3. 点击"加载解压缩的扩展"
4. 选择本插件所在的文件夹
5. 安装成功后，浏览器工具栏会显示插件图标

## 使用方法

### 1. 绑定账号

1. 点击插件图标打开主界面
2. 点击右上角设置按钮进入设置页面
3. 在"账号管理"标签页中，点击各平台的"登录绑定"按钮
4. 在打开的页面中完成登录
5. 返回设置页面，点击"验证登录状态"
6. 验证成功后，账号状态会显示"已绑定"

### 2. 编辑文章

1. 点击插件图标打开主界面
2. 在"编辑器"标签页中输入文章标题
3. 在Markdown编辑区编写文章内容
4. 使用工具栏快捷插入常用格式
5. 右侧预览区实时显示渲染效果

### 3. 发布文章

1. 切换到"发布"标签页
2. 选择要发布的平台（可多选）
3. 点击"一键发布"按钮
4. 查看各平台的发布状态

### 4. 查看历史

1. 切换到"历史"标签页
2. 查看已发布文章列表
3. 点击历史记录可重新编辑

## 目录结构

```
PublishArticlesWithOneClick/
├── manifest.json          # 插件配置文件
├── popup.html             # 弹出窗口HTML
├── popup.css              # 弹出窗口样式
├── popup.js               # 弹出窗口逻辑
├── options.html           # 设置页面HTML
├── options.js             # 设置页面逻辑
├── background.js          # 后台服务脚本
├── icons/                 # 插件图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── lib/                   # 第三方库
│   ├── marked.min.js      # Markdown解析库
│   └── highlight.min.js   # 代码高亮库
├── platforms/             # 平台发布模块
│   └── index.js
└── tools/                 # 工具脚本
    └── generate-icons.ps1 # 图标生成脚本
```

## 注意事项

1. **登录状态**：插件通过Cookie检测登录状态，请确保在绑定账号时完成登录
2. **发布限制**：部分平台可能有发布频率限制，请遵守各平台规则
3. **内容审核**：发布的内容需符合各平台的社区规范
4. **API限制**：由于浏览器安全限制，部分平台需要手动跳转发布

## 技术栈

- HTML5 + CSS3 + JavaScript
- Chrome Extension Manifest V3
- Marked.js (Markdown解析)
- Highlight.js (代码高亮)

## 开发说明

### 重新生成图标

```powershell
powershell -ExecutionPolicy Bypass -File tools/generate-icons.ps1
```

### 修改平台配置

编辑 `platforms/index.js` 文件中的 `platformConfigs` 数组。

### 添加新平台

1. 在 `platforms/index.js` 中添加平台配置
2. 在 `background.js` 中添加发布和登录检测逻辑
3. 在 `manifest.json` 中添加对应的 `host_permissions`

## 许可证

MIT License
