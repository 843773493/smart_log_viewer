# 🚀 Smart Log Viewer - 5分钟快速发布指南

## 快速步骤

### 第1步：准备账户（仅需一次）

1. **创建Microsoft账户** → https://login.live.com
2. **创建Azure DevOps账户** → https://dev.azure.com
3. **创建个人访问令牌 (PAT)**
   - 访问 https://dev.azure.com/_usersSettings/tokens
   - 点击 "New Token"
   - 权限选 "Marketplace" > "Manage"
   - **复制令牌（关闭后看不到了）**
4. **在Marketplace创建发布者**
   - 访问 https://marketplace.visualstudio.com/manage
   - 点击 "Create publisher"
   - 输入发布者名称（例如：`your-username`）记住这个名称！

### 第2步：更新项目配置（仅需一次）

1. 打开 `package.json`
2. 找到这一行：`"publisher": "your-publisher-name"`
3. 将 `your-publisher-name` 替换为你的发布者名称
4. 保存文件

### 第3步：发布插件

#### 方式A：使用脚本（推荐）

**Windows:**
```bash
publish.bat
```
然后按提示选择选项

**Mac/Linux:**
```bash
bash publish.sh
```

#### 方式B：手动命令

```bash
# 1. 安装发布工具
npm install -g vsce

# 2. 编译项目
npm run compile

# 3. 发布（三选一）

# 选项1：使用PAT直接发布
vsce publish -p <your-pat>

# 选项2：交互式发布（输入发布者名称和PAT）
vsce publish

# 选项3：仅打包（手动上传）
vsce package
```

### 第4步：验证发布

1. 等待5-10分钟
2. 访问 https://marketplace.visualstudio.com
3. 搜索 "Smart Log Viewer"
4. 或在VSCode中：`Ctrl+Shift+X` → 搜索 → 安装

## 常见问题速解

| 问题 | 解决方案 |
|------|--------|
| "publisher not found" | 检查发布者名称是否与Azure DevOps中的名称完全相同 |
| "Invalid PAT" | PAT已过期，生成新的 |
| "Extension too large" | 检查.vscodeignore，确保排除了node_modules |
| "Name already taken" | 更换插件名称或联系Marketplace管理员 |

## 文件清单

确保这些文件已准备好：
- ✅ `package.json` - 已更新publisher字段
- ✅ `README.md` - 完整的说明文档
- ✅ `CHANGELOG.md` - 版本历史
- ✅ `LICENSE` - MIT许可证
- ✅ `.vscodeignore` - 排除不必要的文件
- ✅ `out/` - 已编译的TypeScript文件

## 发布后更新

```bash
# 1. 更新版本号（package.json）
# 例如：0.1.0 -> 0.2.0

# 2. 编译
npm run compile

# 3. 发布新版本
vsce publish minor  # 自动升级小版本
```

## 重要提示

⚠️ **不要**
- 不要将个人访问令牌上传到GitHub
- 不要删除已发布的版本

✅ **推荐**
- 使用.gitignore排除敏感信息
- 在生产环境使用环境变量存储PAT
- 为每个发布版本添加CHANGELOG条目

## 官方资源

- [VSCode Extension Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Marketplace Policies](https://marketplace.visualstudio.com/manage/publishers)
- [vsce Documentation](https://github.com/microsoft/vsce)

---

**需要帮助？**
- 查看详细指南：`PUBLISH_GUIDE.md`
- VSCode官方文档：https://code.visualstudio.com/api
- Marketplace支持：https://marketplace.visualstudio.com/support
