# VSCode插件发布速记卡

## 三步发布（总耗时15分钟）

### 步骤1：账户设置（仅需一次）
```
访问网址 → 操作 → 保存
─────────────────────────────────────────
https://login.live.com → 创建Microsoft账户
https://dev.azure.com → 创建Azure DevOps账户
https://dev.azure.com/_usersSettings/tokens → 生成PAT令牌
https://marketplace.visualstudio.com/manage → 创建发布者账户
```

**关键：记住发布者名称（例如：your-username）**

### 步骤2：更新配置（2分钟）
编辑 `package.json` 第6行：
```json
"publisher": "your-username",  // ← 改成你的发布者名称
```

### 步骤3：发布插件（3分钟）

**Windows:**
```batch
publish.bat
```

**Mac/Linux:**
```bash
bash publish.sh
```

**或使用npm:**
```bash
npm install -g vsce  # 第一次需要
npm run publish      # 输入PAT令牌
```

## 快速命令参考

```bash
# 编译
npm run compile

# 打包（生成.vsix文件）
npm run package

# 发布
npm run publish          # 发布（提示输入信息）
npm run publish:patch    # 自动升级补丁版本 (0.1.0 → 0.1.1)
npm run publish:minor    # 自动升级小版本 (0.1.0 → 0.2.0)
npm run publish:major    # 自动升级大版本 (0.1.0 → 1.0.0)

# 使用PAT令牌直接发布
vsce publish -p YOUR_PAT_TOKEN
```

## 在线工具链接

| 工具 | 链接 |
|-----|------|
| Microsoft账户 | https://login.live.com |
| Azure DevOps | https://dev.azure.com |
| PAT生成 | https://dev.azure.com/_usersSettings/tokens |
| Marketplace | https://marketplace.visualstudio.com |
| 管理发布 | https://marketplace.visualstudio.com/manage |
| vsce源码 | https://github.com/microsoft/vsce |
| VSCode API文档 | https://code.visualstudio.com/api |

## 错误速解表

| 错误信息 | 原因 | 解决方案 |
|--------|------|--------|
| publisher not found | 发布者名称不对 | 检查package.json中的publisher值 |
| Invalid PAT | 令牌过期或无效 | 生成新的PAT令牌 |
| Name already taken | 插件名已被占用 | 改displayName或联系support |
| Extension too large | 文件过大 | 检查.vscodeignore |
| TypeScript error | 编译失败 | 运行npm run compile查看错误 |

## 文件清单（发布前检查）

```
✅ PUBLISH_QUICK_START.md   - 5分钟快速指南
✅ PUBLISH_GUIDE.md         - 详细发布指南  
✅ PUBLISH_CHECKLIST.md     - 发布清单
✅ package.json             - 已更新publisher
✅ README.md                - 完整用户文档
✅ CHANGELOG.md             - 版本历史
✅ LICENSE                  - MIT许可证
✅ .vscodeignore            - 打包配置
✅ media/icon.png           - 128x128图标
✅ out/extension.js         - 已编译代码
```

## 版本号规则（SemVer）

```
major.minor.patch
  ↓      ↓      ↓
  1      2      3

1.2.3 → 2.0.0  (breaking change)
1.2.3 → 1.3.0  (new feature)
1.2.3 → 1.2.4  (bug fix)
```

## 发布后验证清单

```
⏳ 等待 5-10 分钟（CDN同步）

✓ 访问 https://marketplace.visualstudio.com
✓ 搜索 "Smart Log Viewer"
✓ 验证版本号、描述、图标
✓ 在VSCode中测试（Ctrl+Shift+X搜索+安装）
✓ 检查下载数和评分
```

## 注意事项

⚠️ **不要**
- ❌ 上传PAT到GitHub
- ❌ 删除已发布版本
- ❌ 频繁发布（每天多次）
- ❌ 发布beta/dev标签版本

✅ **务必**
- ✅ 更新CHANGELOG.md
- ✅ Git commit并打标签
- ✅ 测试后再发布
- ✅ 监控用户反馈

## 详细文档

需要更多信息？查看：
- 📖 PUBLISH_QUICK_START.md - 入门必读
- 📖 PUBLISH_GUIDE.md - 完整指南
- 📖 PUBLISH_CHECKLIST.md - 逐项检查

---

**记住**：第一次可能慢，之后就简单了！
