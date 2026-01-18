# Smart Log Viewer - 完整使用指南

## 📋 目录

1. [项目介绍](#项目介绍)
2. [快速开始](#快速开始)
3. [功能详解](#功能详解)
4. [常用正则表达式](#常用正则表达式)
5. [配置说明](#配置说明)
6. [故障排除](#故障排除)

---

## 项目介绍

Smart Log Viewer 是一个功能强大的VSCode扩展，专门为日志分析和调试设计。

### 核心优势

| 特性 | 说明 |
|------|------|
| **实时过滤** | 使用正则表达式实时过滤日志 |
| **自动高亮** | 根据日志级别自动着色（ERROR、WARN、INFO、DEBUG） |
| **实时监控** | 监控文件变化，自动刷新显示 |
| **配置持久化** | 自动保存过滤规则，下次打开时自动恢复 |
| **快速导出** | 一键导出过滤后的日志内容 |
| **大文件支持** | 高效处理GB级别的日志文件 |

---

## 快速开始

### 第一步：安装依赖

在项目根目录打开终端，执行：

```bash
npm install
```

此命令会安装所有必要的Node.js依赖包。

### 第二步：编译项目

```bash
npm run compile
```

TypeScript代码会被编译为JavaScript，输出到 `out/` 目录。

### 第三步：启动调试

按 `F5` 键或点击Run → Start Debugging，会打开一个新的VSCode窗口运行插件。

### 第四步：测试插件

1. 在新窗口中打开 `example.log` 文件
2. 插件会自动激活并显示日志编辑器
3. 尝试输入过滤规则，例如 `ERROR` 或 `WARN`

---

## 功能详解

### 1. 日志过滤

#### 基础过滤

输入简单的关键词，显示包含该词的所有行：

```
Filter: ERROR
Result: 只显示包含 "ERROR" 的行
```

#### 正则表达式过滤

使用强大的正则表达式进行高级过滤：

```
Filter: ERROR|WARN|FATAL
Result: 显示包含 ERROR、WARN 或 FATAL 的行
```

#### 反向过滤

勾选 "反向过滤" 选项，显示 **不匹配** 规则的行：

```
Filter: DEBUG
Reverse: ✓ 选中
Result: 显示所有不包含 DEBUG 的行
```

这对于排除噪音日志非常有用。

#### 高亮匹配

勾选 "高亮匹配" 选项，匹配的行会显示背景颜色突出显示。

### 2. 日志统计

编辑器顶部显示实时统计信息：

```
总行数: 1024 | 匹配: 42 | 显示: 42
```

- **总行数**: 原始日志的总行数
- **匹配**: 与过滤规则匹配的行数
- **显示**: 当前显示的行数

### 3. 颜色编码

日志自动按级别着色：

| 颜色 | 日志级别 | 示例 |
|------|----------|------|
| 🔴 红色 | ERROR | `ERROR: Failed to connect` |
| 🟡 黄色 | WARN | `WARN: Deprecated API used` |
| 🔵 蓝色 | INFO | `INFO: Process completed` |
| 🟠 橙色 | DEBUG | `DEBUG: Variable value: 42` |

### 4. 文件监控

插件自动监控日志文件的变化。当其他程序写入日志时：

- 文件内容自动更新
- 保持当前的过滤规则
- 新行自动显示在编辑器中

**示例场景**：
```
终端 1: tail -f application.log    # 持续输出新日志
终端 2: VSCode 编辑器            # 实时显示最新内容
```

### 5. 配置管理

#### 自动保存

打开日志文件后，插件会：
1. 加载此文件之前的过滤规则（如存在）
2. 应用之前的高亮和反向过滤设置
3. 用户修改设置后自动保存

#### 配置存储位置

配置文件使用文件路径的哈希值作为标识，存储在：

**Windows**:
```
C:\Users\<用户名>\AppData\Roaming\Code\User\globalStorage\smart-log-viewer\log-configs\
```

**macOS**:
```
~/Library/Application Support/Code/User/globalStorage/smart-log-viewer/log-configs/
```

**Linux**:
```
~/.config/Code/User/globalStorage/smart-log-viewer/log-configs/
```

#### 清除配置

删除对应的 JSON 配置文件即可重置该日志文件的配置。

### 6. 导出日志

按 `Ctrl+S` (Windows/Linux) 或 `Cmd+S` (macOS) 导出当前显示的日志：

1. 弹出保存对话框
2. 选择保存位置和文件名
3. 过滤后的内容被保存为新的.log文件

---

## 常用正则表达式

### 按日志级别过滤

```regex
# 显示所有错误和警告
ERROR|WARN

# 仅显示错误
^.*ERROR.*$

# 显示错误和致命错误
ERROR|FATAL|CRITICAL
```

### 按时间过滤

```regex
# 显示特定小时的日志（10:00-10:59）
10:\d{2}:\d{2}

# 显示特定日期的日志（2026-01-18）
2026-01-18

# 显示下午的日志（12:00-23:59）
(1[2-9]|2[0-3]):\d{2}:\d{2}
```

### 按IP地址过滤

```regex
# 显示特定IP的请求
192\.168\.1\..*

# 显示所有IP请求（IP:PORT格式）
\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+

# 显示特定子网的请求
192\.168\.0\.\d{1,3}
```

### 按关键字过滤

```regex
# 显示数据库相关日志
DATABASE|SQL|QUERY

# 显示异常堆栈跟踪
Exception|Error|at com\.|Caused by

# 显示特定模块的日志
\[UserService\]|\[AuthService\]
```

### 复杂过滤示例

```regex
# 显示2026-01-18的ERROR日志
2026-01-18.*ERROR

# 显示响应时间超过1秒的请求
duration=\d{4,}ms

# 显示HTTP错误状态码（4xx, 5xx）
(HTTP|status).*[45]\d{2}

# 显示包含特定异常的行及其堆栈跟踪
NullPointerException|SQLException|TimeoutException
```

---

## 配置说明

### 配置文件格式

每个日志文件对应一个配置文件，格式为 JSON：

```json
{
  "filterRegex": "ERROR|WARN",
  "invertFilter": false,
  "highlightMatches": true
}
```

### 配置字段说明

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `filterRegex` | string | 正则表达式过滤规则 | `""` |
| `invertFilter` | boolean | 是否反向过滤 | `false` |
| `highlightMatches` | boolean | 是否高亮匹配 | `false` |

### 手动编辑配置

如需手动修改配置，可直接编辑对应的JSON文件：

1. 打开VSCode设置，搜索 "globalStorage"
2. 找到 `smart-log-viewer/log-configs/` 目录
3. 找到对应日志文件的配置文件（以 `config_` 开头）
4. 编辑JSON内容并保存

---

## 故障排除

### 问题 1: Python环境未找到

**错误提示**: `No Python interpreter found`

**解决方案**:

1. 确保已安装Python 3.7+
2. 验证Python在系统PATH中：
   ```bash
   python --version
   ```
3. 如果未在PATH中，手动添加Python安装目录到PATH

### 问题 2: 扩展无法激活

**错误提示**: Extension activation failed

**解决方案**:

1. 检查TypeScript编译是否成功：
   ```bash
   npm run compile
   ```

2. 查看VSCode的开发者控制台（`Ctrl+Shift+P` → `Developer: Toggle Developer Tools`）

3. 检查是否有TypeScript错误

### 问题 3: Python后端无法启动

**症状**: 过滤功能不工作

**解决方案**:

1. 手动测试Python后端：
   ```bash
   python python/backend.py --port 5555
   ```

2. 在另一个终端测试API：
   ```bash
   curl http://localhost:5555/health
   ```

3. 检查端口5555是否被占用：
   ```bash
   # Windows
   netstat -ano | findstr :5555
   
   # Linux/macOS
   lsof -i :5555
   ```

### 问题 4: 大文件打开缓慢

**原因**: 正则表达式过于复杂或文件过大

**解决方案**:

1. 简化正则表达式
2. 使用更具体的过滤规则
3. 分割日志文件为更小的部分

### 问题 5: 配置无法保存

**原因**: 文件权限问题或磁盘空间不足

**解决方案**:

1. 检查 `globalStorage` 目录的写入权限
2. 检查磁盘剩余空间
3. 重启VSCode

---

## 开发者信息

### 项目结构回顾

```
smart_log_viewer/
├── src/                      # TypeScript源代码
├── media/                    # WebView前端资源
├── python/                   # Python后端服务
├── out/                      # 编译输出（由npm run compile生成）
└── node_modules/             # npm依赖（由npm install生成）
```

### 常用命令

```bash
# 编译TypeScript
npm run compile

# 监视模式（自动编译）
npm run watch

# 启动调试
F5（在VSCode中）

# 检查代码风格
npm run lint

# 运行测试
npm run test

# 打包扩展
npm install -g @vscode/vsce
vsce package
```

### 贡献开发

欢迎提交改进建议！

---

最后更新: 2026年1月18日
