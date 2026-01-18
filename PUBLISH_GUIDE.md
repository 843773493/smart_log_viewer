# VSCode插件发布指南

本指南将帮助您将 Smart Log Viewer 插件发布到 VSCode 插件商店。

## 第一步：准备工作

### 1. 创建Microsoft账户
- 访问 https://login.live.com
- 创建或使用现有Microsoft账户

### 2. 创建Azure DevOps组织
- 访问 https://dev.azure.com
- 选择"Create project"创建新项目
- 项目名称可设为 "smart-log-viewer"

### 3. 创建个人访问令牌 (PAT)
1. 进入 https://dev.azure.com/_usersSettings/tokens
2. 点击 "New Token"
3. 填写信息：
   - **名称**: vscode-publish（或其他易于识别的名称）
   - **有效期**: 选择合适的期限（建议1年）
   - **范围**: 选择 "Marketplace" > "Manage"
4. 点击 "Create"
5. **立即复制令牌**（关闭后无法再查看）

### 4. 获取发布者ID
- 访问 https://marketplace.visualstudio.com
- 点击右上角"Sign in"登录
- 点击"Manage Extensions"
- 如果您是新发布者，需要创建发布者账户：
  - 点击 "Create publisher"
  - 输入发布者名称（例如：`your-username`）
  - 这个名称将用在插件标识中

## 第二步：更新项目配置

### 1. 更新 package.json

在您的 `package.json` 中添加/更新以下字段：

```json
{
  "publisher": "your-username",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/smart-log-viewer"
  },
  "bugs": {
    "url": "https://github.com/your-username/smart-log-viewer/issues"
  },
  "homepage": "https://github.com/your-username/smart-log-viewer/blob/main/README.md",
  "icon": "media/icon.png",
  "keywords": [
    "log",
    "viewer",
    "filter",
    "regex",
    "log-analysis"
  ],
  "license": "MIT"
}
```

### 2. 添加插件图标
创建一个 128x128 像素的PNG图标保存为 `media/icon.png`
（或使用任何其他支持的格式）

### 3. 更新 .gitignore
确保以下内容在 `.gitignore` 中：
```
out/
dist/
node_modules/
*.vsix
.DS_Store
```

## 第三步：安装发布工具

### 1. 安装 vsce (VSCode Extension CLI)
```bash
npm install -g vsce
```

### 2. 验证安装
```bash
vsce --version
```

## 第四步：发布插件

### 方式一：使用个人访问令牌发布

1. **编译项目**
```bash
npm run compile
```

2. **打包插件**
```bash
vsce package
```
这会在项目根目录生成 `.vsix` 文件

3. **登录并发布**
```bash
vsce publish -p <your-pat>
```

替换 `<your-pat>` 为您的个人访问令牌

### 方式二：交互式发布

```bash
vsce publish
```
然后按提示输入发布者名称和个人访问令牌

### 方式三：分开执行（推荐用于CI/CD）

1. 登录：
```bash
vsce login your-publisher-name
```
输入个人访问令牌

2. 发布：
```bash
vsce publish
```

3. 登出：
```bash
vsce logout your-publisher-name
```

## 第五步：验证发布

1. 访问 https://marketplace.visualstudio.com
2. 搜索您的插件名称 "Smart Log Viewer"
3. 或在VSCode中：
   - 打开扩展商店 (Ctrl+Shift+X)
   - 搜索 "Smart Log Viewer"
   - 点击 "Install"

## 发布后的更新

### 更新版本号

在 `package.json` 中修改版本号（遵循 [SemVer](https://semver.org/)）：
```json
"version": "0.1.0"
```

### 发布新版本
```bash
npm run compile
vsce publish minor  // 自动升级小版本
```

或指定具体版本：
```bash
vsce publish 0.1.0
```

## 发布前检查清单

- [ ] `package.json` 中有效的 `publisher` 字段
- [ ] 有效的 `name`（必须是小写，无空格）
- [ ] 描述清晰的 `description`
- [ ] 正确的 `version` 号
- [ ] 有效的 `engines.vscode` 版本
- [ ] README.md 完整且包含使用说明
- [ ] CHANGELOG.md 或版本历史记录
- [ ] LICENSE 文件（推荐MIT或Apache 2.0）
- [ ] 插件图标 `media/icon.png` (128x128)
- [ ] 编译后没有TypeScript错误
- [ ] `.vsix` 文件大小合理（<10MB）

## 故障排除

### 错误：Publisher not found
```
错误信息：publisher is not in my publisher list.
```
**解决方案**：确认您使用的发布者名称与Azure DevOps账户中的名称完全匹配

### 错误：Invalid personal access token
```
错误信息：Invalid personal access token
```
**解决方案**：
- 检查令牌是否过期
- 重新生成新的个人访问令牌
- 确保选择了 "Marketplace" > "Manage" 权限范围

### 错误：Extension size is too large
```
错误信息：The extension is more than 20MB
```
**解决方案**：
- 删除不必要的文件
- 确保 `out/` 目录被打包（TypeScript编译输出）
- 检查是否包含了大型node_modules（应该被.vscodeignore排除）

### 创建 .vscodeignore 文件

在项目根目录创建 `.vscodeignore`：
```
.git
.gitignore
.vscode
.vscodeignore
node_modules
out/test
src
tsconfig.json
vsc-extension-quickstart.md
**/*.map
**/*.ts
!media/**
!python/**
large_test.log
*.vsix
```

## 其他资源

- [VSCode插件发布官方指南](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Marketplace政策](https://marketplace.visualstudio.com/manage/publishers)
- [vsce 文档](https://github.com/Microsoft/vsce)

## 常见问题

**Q: 发布后多久才能在商店中看到？**
A: 通常5-10分钟即可显示

**Q: 可以删除已发布的插件吗？**
A: 不能完全删除，但可以设为未列出状态，隐藏在商店中

**Q: 如何更新已发布的插件？**
A: 更新版本号后重新运行 `vsce publish`

**Q: 个人访问令牌会过期吗？**
A: 会，按您设置的有效期过期。过期后需要生成新的令牌
