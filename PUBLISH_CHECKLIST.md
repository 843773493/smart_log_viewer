# 📋 VSCode插件发布检查清单

在发布前，请逐项检查以下内容。

## 账户准备

- [ ] 已创建Microsoft账户
- [ ] 已创建Azure DevOps账户
- [ ] 已生成个人访问令牌（PAT）
  - [ ] 选择了"Marketplace" > "Manage"权限
  - [ ] 已记录令牌值（关闭后无法再查看）
- [ ] 已在Marketplace创建发布者账户
- [ ] 已记录发布者名称

## 项目配置

- [ ] 更新了 `package.json`
  - [ ] `publisher` 字段已填入发布者名称
  - [ ] `version` 字段已更新（当前: 0.1.0）
  - [ ] `name` 是小写，无空格
  - [ ] `displayName` 清晰易读
  - [ ] `description` 简洁准确
  - [ ] `repository.url` 指向正确的GitHub/GitLab地址
- [ ] 创建了 `.vscodeignore` 文件
- [ ] 更新了 `README.md`
  - [ ] 包含功能说明
  - [ ] 包含安装指令
  - [ ] 包含使用示例
  - [ ] 包含截图（可选但推荐）
- [ ] 创建了 `CHANGELOG.md`
  - [ ] 记录了版本历史
  - [ ] 列出了新增功能
  - [ ] 列出了修复的bug
- [ ] 创建了 `LICENSE` 文件（推荐MIT）
- [ ] 添加了插件图标 `media/icon.png`
  - [ ] 大小为128x128像素或更大
  - [ ] 格式为PNG

## 代码质量

- [ ] TypeScript代码已编译成功
  ```bash
  npm run compile
  ```
- [ ] 没有编译错误或警告
- [ ] ESLint检查通过（可选）
  ```bash
  npm run lint
  ```
- [ ] 单元测试通过（可选）
  ```bash
  npm run test
  ```
- [ ] 手动测试通过
  - [ ] 能正确打开.log文件
  - [ ] 过滤功能正常
  - [ ] 配置能正确保存和恢复
  - [ ] 大文件虚拟滚动顺畅

## 文件检查

- [ ] 不包含敏感信息
  - [ ] 没有真实API密钥
  - [ ] 没有个人令牌
  - [ ] 没有密码
- [ ] `.vscodeignore` 排除了：
  - [ ] `node_modules`
  - [ ] `.git`
  - [ ] `src` (TypeScript源文件)
  - [ ] `out/test`
  - [ ] `*.vsix`
- [ ] 没有过大的文件
  - [ ] 最终`.vsix`大小 < 10MB
  - [ ] 排除了测试数据文件

## 文档完整性

- [ ] README.md 包含：
  - [ ] 简短描述
  - [ ] 功能列表
  - [ ] 安装方法
  - [ ] 使用说明
  - [ ] 快捷键列表
  - [ ] 常见问题解答
  - [ ] 许可证信息
- [ ] 有GitHub仓库链接
- [ ] 有bug报告链接
- [ ] 有联系方式（邮箱或社交媒体）

## 版本管理

- [ ] Git仓库已提交所有更改
  ```bash
  git add .
  git commit -m "Release version 0.1.0"
  ```
- [ ] 已创建Git标签（推荐）
  ```bash
  git tag v0.1.0
  git push origin v0.1.0
  ```
- [ ] 版本号遵循SemVer规范

## 发布前最后检查

- [ ] 已安装vsce
  ```bash
  npm install -g vsce
  ```
- [ ] 已验证vsce版本
  ```bash
  vsce --version
  ```
- [ ] 已备份个人访问令牌（安全地保存）
- [ ] 已在干净的环境中进行了最终构建
  ```bash
  npm install
  npm run compile
  ```
- [ ] 插件功能进行了最后检查

## 发布步骤

选择下列任一方式：

### 方式1：脚本发布（推荐）
- [ ] Windows: 运行 `publish.bat`
- [ ] Mac/Linux: 运行 `bash publish.sh`

### 方式2：命令行发布
- [ ] 运行 `npm run publish` 或 `npm run publish:minor`
- [ ] 输入发布者名称和PAT
- [ ] 等待发布完成

### 方式3：手动发布
- [ ] 运行 `vsce package` 生成 `.vsix` 文件
- [ ] 访问 https://marketplace.visualstudio.com 手动上传

## 发布后验证

发布成功后（等待5-10分钟）：

- [ ] 访问 https://marketplace.visualstudio.com
- [ ] 搜索插件名称 "Smart Log Viewer"
- [ ] 验证插件显示正确的：
  - [ ] 名称
  - [ ] 描述
  - [ ] 图标
  - [ ] 版本号
  - [ ] README内容
- [ ] 在VSCode中安装测试
  - [ ] `Ctrl+Shift+X` 打开扩展商店
  - [ ] 搜索 "Smart Log Viewer"
  - [ ] 点击安装
  - [ ] 验证功能正常
- [ ] 检查下载统计数据
- [ ] 监控用户反馈

## 常见问题快速修复

| 症状 | 可能原因 | 解决方案 |
|------|--------|--------|
| "publisher not found" | 发布者名称错误 | 检查package.json中的publisher字段 |
| "Invalid PAT" | 令牌已过期或无效 | 生成新的个人访问令牌 |
| "Name already taken" | 扩展名已被占用 | 更换displayName或联系Marketplace支持 |
| ".vsix文件过大" | 包含了不必要的文件 | 检查.vscodeignore是否正确 |
| "TypeScript错误" | 代码编译失败 | 运行`npm run compile`检查错误 |

## 发布后维护

- [ ] 监控插件市场的评分和评论
- [ ] 记录用户反馈
- [ ] 计划下一个版本的改进
- [ ] 保持依赖项最新
- [ ] 定期发布更新（至少每季度一次）

---

**提示**: 可以打印此清单，在发布前逐项检查。
