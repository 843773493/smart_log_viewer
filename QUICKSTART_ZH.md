# 🚀 Smart Log Viewer - 快速开始指南

## 一分钟快速上手

### 1️⃣ 环境检查

确保已安装：
- ✅ Node.js 14+ (检查: `node --version`)
- ✅ Python 3.7+ (检查: `python --version`)
- ✅ VSCode 1.75+ 

### 2️⃣ 安装并编译

```bash
# 进入项目目录
cd smart_log_viewer

# 安装依赖
npm install

# 编译项目
npm run compile
```

### 3️⃣ 启动插件

在VSCode中按 **F5** 启动调试模式

或者使用命令面板：
- `Ctrl+Shift+P` → "Run Extension" → 回车

### 4️⃣ 测试插件

1. 新窗口打开 `example.log` 文件
2. 看到日志编辑器界面 ✨
3. 试试输入 `ERROR` 看看效果

---

## 常用快捷操作

| 操作 | 按键 |
|------|------|
| 🔍 应用过滤 | 点击"应用过滤"按钮 |
| 🧹 清空过滤 | 点击"清空过滤"按钮 |
| 💾 导出日志 | `Ctrl+S` / `Cmd+S` |
| 📝 打开命令面板 | `Ctrl+Shift+P` |

---

## 实用例子

### 例1: 查看所有错误

```
输入: ERROR
效果: 只显示包含ERROR的行
```

### 例2: 查看错误或警告

```
输入: ERROR|WARN
效果: 同时显示ERROR和WARN的行
```

### 例3: 排除调试信息

```
输入: DEBUG
勾选: 反向过滤 ✓
效果: 显示所有不包含DEBUG的行
```

### 例4: 查看特定时间的日志

```
输入: 10:1[0-5]:\d{2}
效果: 显示10:10-10:15之间的日志
```

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `package.json` | Node依赖配置 |
| `tsconfig.json` | TypeScript配置 |
| `src/` | TypeScript源代码 |
| `media/` | WebView UI（HTML/CSS/JS） |
| `python/` | Python后端服务 |
| `out/` | 编译输出目录 |
| `example.log` | 测试日志文件 |

---

## 遇到问题？

### 编译失败

```bash
# 清理缓存
rm -rf out node_modules
npm install
npm run compile
```

### Python找不到

```bash
# 检查Python
python --version

# 如果没有，需要安装Python 3.7+
# https://www.python.org/downloads/
```

### 端口被占用

Python后端使用端口5555，如果被占用：

```bash
# 查找占用进程
# Windows: netstat -ano | findstr :5555
# Linux: lsof -i :5555
# macOS: lsof -i :5555

# 杀死进程后重试
```

---

## 更多信息

📖 完整文档: 见 `README.md`
📚 使用指南: 见 `USAGE.md`
🐍 Python源码: `python/backend.py`
⚙️ TypeScript源码: `src/` 目录

---

祝你使用愉快！ 🎉

有任何问题欢迎提Issue或PR。
