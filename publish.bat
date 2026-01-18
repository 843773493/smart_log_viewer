@echo off
REM Smart Log Viewer - Windows 快速发布脚本

setlocal enabledelayedexpansion

echo === Smart Log Viewer 发布助手 ===
echo.

REM 检查vsce是否安装
where vsce >nul 2>nul
if errorlevel 1 (
    echo ❌ vsce 未安装
    echo 请先运行: npm install -g vsce
    exit /b 1
)

echo ✅ vsce 已安装
echo.

REM 检查package.json中的发布者信息
for /f "tokens=2 delims=:" %%A in ('findstr /R "publisher" package.json ^| findstr /V "//"') do (
    set PUBLISHER=%%A
    set PUBLISHER=!PUBLISHER:"=!
    set PUBLISHER=!PUBLISHER:,=!
    set PUBLISHER=!PUBLISHER: =!
    if "!PUBLISHER!"=="your-publisher-name" (
        echo ⚠️  您需要更新 package.json 中的 'publisher' 字段
        echo 请将 'your-publisher-name' 替换为您在 Azure DevOps 中的发布者名称
        exit /b 1
    )
)

echo 发布者: %PUBLISHER%
echo.

REM 编译项目
echo 📦 编译 TypeScript...
call npm run compile
if errorlevel 1 (
    echo ❌ 编译失败
    exit /b 1
)
echo ✅ 编译成功
echo.

REM 提示用户输入
echo 请选择发布方式:
echo 1) 使用 PAT (个人访问令牌) 直接发布
echo 2) 交互式登录并发布
echo 3) 仅打包为 .vsix 文件（不发布）
echo.

set /p choice="请输入选项 [1-3]: "

if "%choice%"=="1" (
    setlocal enabledelayedexpansion
    set /p PAT="请输入您的个人访问令牌 (PAT): "
    echo.
    echo 🚀 发布中...
    call vsce publish -p !PAT!
    if errorlevel 0 (
        echo ✅ 发布成功！
    )
) else if "%choice%"=="2" (
    echo 🚀 发布中...
    call vsce publish
    if errorlevel 0 (
        echo ✅ 发布成功！
    )
) else if "%choice%"=="3" (
    echo 📦 打包为 .vsix 文件...
    call vsce package
    if errorlevel 0 (
        echo ✅ 打包成功！现在您可以手动上传到 https://marketplace.visualstudio.com
    )
) else (
    echo ❌ 无效的选项
    exit /b 1
)

echo.
echo === 完成 ===
pause
