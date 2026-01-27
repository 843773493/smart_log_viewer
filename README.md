# Smart Log Viewer - VSCode日志编辑器

一个强大的VSCode扩展，用于实时查看、过滤和分析日志文件。支持正则表达式过滤、文件实时监控、配置持久化等功能。

## 功能特性

✨ **核心功能**

- 📂 打开和查看 `.log` 文件
- 🔍 支持正则表达式过滤日志
- 🔄 实时监控文件变化，自动更新显示
- 💾 自动保存用户配置，避免重复设置
- 🎯 支持反向过滤（显示不匹配的行）
- 🟡 自动色彩编码（ERROR、WARN、INFO、DEBUG）
- 📊 实时显示日志统计信息

## 使用指南

### 打开日志文件

1. 在VSCode中打开任何 `.log` 文件
2. 扩展会自动激活并显示日志编辑器

### 过滤日志

#### 基本过滤

```text
输入: ERROR|WARN|alert
效果: 只显示包含ERROR、WARN或alert的行
```

#### 高级正则表达式

```text
# 显示特定时间范围的日志
^\d{4}-01-1[0-8]

# 显示特定IP的请求
\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}

# 显示包含异常的行
Exception|error|failed
```

#### 过滤选项

- **高亮匹配**: 在匹配的行上应用背景色突出显示
- **反向过滤**: 显示不匹配正则表达式的行（用于排除噪音）

### 配置持久化

插件会自动保存每个日志文件的配置：

- 过滤正则表达式
- 高亮和反向过滤选项

再次打开同一个文件时，之前的设置会被自动恢复。

配置文件存储位置：

- **Windows**: `%APPDATA%\Code\User\globalStorage\smart-log-viewer\log-configs\`
- **macOS**: `~/Library/Application Support/Code/User/globalStorage/smart-log-viewer/log-configs/`
- **Linux**: `~/.config/Code/User/globalStorage/smart-log-viewer/log-configs/`

## 键盘快捷键

| 快捷键 | 功能 |
| -------- | ------ |
| `Ctrl+S` / `Cmd+S` | 导出当前过滤后的日志 |
| `Ctrl+Shift+P` > "Clear Log Filter" | 清空过滤器 |
| `Ctrl+Shift+P` > "Save Log Configuration" | 手动保存配置 |

## 常见问题

### Q: Python环境找不到？

**A:** 确保Python已安装并在系统PATH中。你可以在终端输入 `python --version` 检查。

### Q: 大文件处理性能如何？

**A:** 支持GB级别的日志文件。处理性能取决于系统硬件和正则表达式复杂度。

### Q: 能否保存过滤后的内容？

**A:** 支持。按 `Ctrl+S` (Windows/Linux) 或 `Cmd+S` (macOS) 导出过滤后的日志。

### Q: 支持哪些日志格式？

**A:** 纯文本格式。自动检测并高亮常见日志级别（ERROR、WARN、INFO、DEBUG）。

### 调试WebView

在WebView中按 `F12` 打开开发者工具。

## 扩展思路

可以添加的功能：

- 📈 日志统计和可视化图表
- 🔐 支持加密日志文件
- 📤 导出到多种格式（CSV、JSON等）
- 🌍 多语言支持
- ⚡ 性能优化（分页显示超大文件）
- 🔗 日志关联显示（显示相关的日志上下文）

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request！
