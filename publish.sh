#!/bin/bash
# Smart Log Viewer - 快速发布脚本

set -e

echo "=== Smart Log Viewer 发布助手 ==="
echo ""

# 检查vsce是否安装
if ! command -v vsce &> /dev/null; then
    echo "❌ vsce 未安装"
    echo "请先运行: npm install -g vsce"
    exit 1
fi

echo "✅ vsce 已安装"
echo ""

# 检查package.json中的发布者信息
PUBLISHER=$(grep -o '"publisher": "[^"]*' package.json | cut -d'"' -f4)
if [ "$PUBLISHER" = "your-publisher-name" ]; then
    echo "⚠️  您需要更新 package.json 中的 'publisher' 字段"
    echo "请将 'your-publisher-name' 替换为您在 Azure DevOps 中的发布者名称"
    exit 1
fi

echo "发布者: $PUBLISHER"
echo ""

# 编译项目
echo "📦 编译 TypeScript..."
npm run compile
if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi
echo "✅ 编译成功"
echo ""

# 提示用户输入
echo "请选择发布方式:"
echo "1) 使用 PAT (个人访问令牌) 直接发布"
echo "2) 交互式登录并发布"
echo "3) 仅打包为 .vsix 文件（不发布）"
echo ""
read -p "请输入选项 [1-3]: " choice

case $choice in
    1)
        read -sp "请输入您的个人访问令牌 (PAT): " PAT
        echo ""
        echo "🚀 发布中..."
        vsce publish -p "$PAT"
        echo "✅ 发布成功！"
        ;;
    2)
        echo "🚀 发布中..."
        vsce publish
        echo "✅ 发布成功！"
        ;;
    3)
        echo "📦 打包为 .vsix 文件..."
        vsce package
        VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -1)
        if [ -n "$VSIX_FILE" ]; then
            SIZE=$(ls -lh "$VSIX_FILE" | awk '{print $5}')
            echo "✅ 打包成功: $VSIX_FILE ($SIZE)"
            echo "现在您可以手动上传到 https://marketplace.visualstudio.com"
        fi
        ;;
    *)
        echo "❌ 无效的选项"
        exit 1
        ;;
esac

echo ""
echo "=== 完成 ==="
