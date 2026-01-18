# 📚 VSCode插件发布文档目录

欢迎！这是Smart Log Viewer插件的完整发布指南。

## 🚀 快速开始（推荐）

**首次发布？** 从这里开始👇

1. **[PUBLISH_QUICK_START.md](PUBLISH_QUICK_START.md)** ⭐⭐⭐
   - ⏱️ 耗时：5分钟
   - 📋 内容：三步快速发布指南
   - 👥 适合：所有用户
   - **👉 从这里开始！**

2. **[PUBLISH_CHEATSHEET.md](PUBLISH_CHEATSHEET.md)** 
   - ⏱️ 耗时：1分钟阅读
   - 📋 内容：命令速记卡、链接、常见错误
   - 👥 适合：快速查询
   - **👉 打印并贴在桌边**

## 📖 详细文档

需要更多细节？选择对应的情况：

### 初次发布
| 文档 | 用途 | 何时阅读 |
|------|------|--------|
| [PUBLISH_GUIDE.md](PUBLISH_GUIDE.md) | 完整的分步指南 | 遇到问题时 |
| [PUBLISH_CHECKLIST.md](PUBLISH_CHECKLIST.md) | 发布前的完整检查清单 | 发布前进行最后检查 |
| [PUBLISH_README.md](PUBLISH_README.md) | 发布准备总结 | 快速概览已完成的工作 |

### 发布后
| 文档 | 用途 | 何时阅读 |
|------|------|--------|
| [PUBLISH_MAINTENANCE.md](PUBLISH_MAINTENANCE.md) | 后续维护和更新 | 发布成功后 |

### 项目文档
| 文档 | 用途 | 何时阅读 |
|------|------|--------|
| [README.md](README.md) | 用户使用文档 | 已完成 ✅ |
| [CHANGELOG.md](CHANGELOG.md) | 版本历史和更新日志 | 发布新版本时 |
| [LICENSE](LICENSE) | MIT许可证 | 已完成 ✅ |

## 📋 文档快速查找

### 按场景分类

**"我想立即发布"**
→ [PUBLISH_QUICK_START.md](PUBLISH_QUICK_START.md)

**"我需要一份完整指南"**
→ [PUBLISH_GUIDE.md](PUBLISH_GUIDE.md)

**"我需要检查清单"**
→ [PUBLISH_CHECKLIST.md](PUBLISH_CHECKLIST.md)

**"我发布出错了"**
→ [PUBLISH_GUIDE.md#故障排除](PUBLISH_GUIDE.md) 或 [PUBLISH_CHEATSHEET.md](#错误速解表)

**"如何更新已发布的插件"**
→ [PUBLISH_MAINTENANCE.md](PUBLISH_MAINTENANCE.md)

**"我需要快速命令参考"**
→ [PUBLISH_CHEATSHEET.md](PUBLISH_CHEATSHEET.md)

## 🎯 三个发布阶段

### 阶段1：准备（5分钟）
```
准备账户
   ↓
更新配置
   ↓
验证项目
```
📄 文档：[PUBLISH_QUICK_START.md](PUBLISH_QUICK_START.md) 第1-2步

### 阶段2：发布（3分钟）
```
安装工具
   ↓
编译代码
   ↓
运行发布
```
📄 文档：[PUBLISH_QUICK_START.md](PUBLISH_QUICK_START.md) 第3步

### 阶段3：验证（10分钟等待）
```
等待CDN同步
   ↓
验证插件显示
   ↓
在VSCode中测试
```
📄 文档：[PUBLISH_QUICK_START.md](PUBLISH_QUICK_START.md) 第4步

## 🔑 关键文件

### 必须编辑
- `package.json` - 添加发布者名称

### 已准备好
- ✅ `.vscodeignore` - 打包配置
- ✅ `CHANGELOG.md` - 版本历史
- ✅ `LICENSE` - MIT许可证
- ✅ `publish.sh` - Mac/Linux发布脚本
- ✅ `publish.bat` - Windows发布脚本

### 可选但推荐
- 📄 `media/icon.png` - 插件图标（128x128）
- 📄 `CONTRIBUTING.md` - 贡献指南

## 📊 文件对照表

| 文件 | 大小 | 读时 | 必读 |
|------|------|------|------|
| PUBLISH_QUICK_START.md | ~5KB | 5分钟 | ⭐⭐⭐ |
| PUBLISH_CHEATSHEET.md | ~3KB | 1分钟 | ⭐⭐ |
| PUBLISH_GUIDE.md | ~8KB | 10分钟 | ⭐⭐ |
| PUBLISH_CHECKLIST.md | ~6KB | 5分钟 | ⭐ |
| PUBLISH_README.md | ~4KB | 3分钟 | ⭐ |
| PUBLISH_MAINTENANCE.md | ~7KB | 10分钟 | 发布后 |

## 💡 推荐阅读顺序

```
首次发布：
  1. PUBLISH_QUICK_START.md (必读)
  2. PUBLISH_CHECKLIST.md (检查)
  3. 运行publish.bat或publish.sh
  ↓
发布完成后：
  4. PUBLISH_MAINTENANCE.md (维护)

后续发布：
  1. PUBLISH_CHEATSHEET.md (速记)
  2. 更新CHANGELOG.md
  3. npm run publish:minor
```

## 🆘 常见问题快速导航

### 账户相关
- 如何创建Microsoft账户？ → [PUBLISH_GUIDE.md](PUBLISH_GUIDE.md#第一步准备工作)
- 如何生成PAT令牌？ → [PUBLISH_GUIDE.md](PUBLISH_GUIDE.md#3-创建个人访问令牌-pat)
- 如何创建发布者？ → [PUBLISH_GUIDE.md](PUBLISH_GUIDE.md#4-获取发布者id)

### 配置相关
- 如何修改package.json？ → [PUBLISH_QUICK_START.md](PUBLISH_QUICK_START.md#第2步更新项目配置)
- .vscodeignore怎么配置？ → [PUBLISH_GUIDE.md#创建-vscodeignore-文件)(PUBLISH_GUIDE.md)
- 如何添加插件图标？ → [PUBLISH_GUIDE.md](PUBLISH_GUIDE.md#2-添加插件图标)

### 发布相关
- 如何选择发布方式？ → [PUBLISH_QUICK_START.md](PUBLISH_QUICK_START.md#第3步发布插件)
- 发布出错了怎么办？ → [PUBLISH_GUIDE.md#故障排除](PUBLISH_GUIDE.md)
- 发布后多久显示？ → [PUBLISH_CHEATSHEET.md](#常见问题快速查询表](PUBLISH_CHEATSHEET.md)

### 维护相关
- 如何发布新版本？ → [PUBLISH_MAINTENANCE.md#发布新版本的流程](PUBLISH_MAINTENANCE.md)
- 如何修复紧急bug？ → [PUBLISH_MAINTENANCE.md#紧急hotfix流程](PUBLISH_MAINTENANCE.md)
- 如何写CHANGELOG？ → [PUBLISH_MAINTENANCE.md#changelog-撰写指南](PUBLISH_MAINTENANCE.md)

## 🔗 重要链接集合

### 必须访问
- 🔵 Microsoft账户: https://login.live.com
- 🟣 Azure DevOps: https://dev.azure.com
- 🔑 PAT生成页: https://dev.azure.com/_usersSettings/tokens
- 🎪 Marketplace首页: https://marketplace.visualstudio.com
- 🖥️ 管理发布者: https://marketplace.visualstudio.com/manage

### 工具和资源
- 📦 vsce工具: https://github.com/microsoft/vsce
- 📖 VSCode API: https://code.visualstudio.com/api
- 🆘 Marketplace支持: https://marketplace.visualstudio.com/support
- 🐛 GitHub issues: https://github.com/microsoft/vscode

## ✅ 发布前最后检查

在点击发布前，快速检查：

```
发布者名称: ____________________  (在package.json中)
版本号: ____________________     (v0.1.0还是新版本？)
PAT令牌: ******* (已安全保存)
.vscodeignore: ✓ (已创建)
CHANGELOG.md: ✓ (已更新)
代码编译: ✓ (npm run compile成功)

✅ 所有项目都检查了？现在可以发布了！
```

## 📞 需要帮助？

1. **快速问题** → 查看 [PUBLISH_CHEATSHEET.md](PUBLISH_CHEATSHEET.md)
2. **详细说明** → 查看 [PUBLISH_GUIDE.md](PUBLISH_GUIDE.md)
3. **特定错误** → 搜索本目录的错误速解表
4. **官方帮助** → https://code.visualstudio.com/api

## 🎊 恭喜！

您已经拥有完整的发布指南了！现在：

👉 **开始发布：阅读 [PUBLISH_QUICK_START.md](PUBLISH_QUICK_START.md)**

---

**最后更新**：2026年1月19日
**插件名称**：Smart Log Viewer
**当前版本**：0.1.0
**状态**：✅ 已准备发布
