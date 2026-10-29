@echo off
chcp 65001 >nul
setlocal

echo ==========================================
echo   房助 APP - HBuilderX Node 环境配置助手
echo ==========================================
echo.

REM ---------- 检查 where node ----------
where node >nul 2>&1
if %errorlevel%==0 (
    echo [√]系统 PATH 中已可找到 Node
    for /f "delims=" %%i in ('where node') do echo      %%i
    echo.
    goto :verify
)

echo [!]系统 PATH 中找不到 Node —— 这就是 HBuilderX 报错的原因
echo.
echo 正在查找可用的 Node...
echo.

REM ---------- 方案 A：HBuilderX 内置 node ----------
set "HBX_NODE=D:\Tools\HBuilderX\HBuilderX\plugins\node\node.exe"
if exist "%HBX_NODE%" (
    echo [√] 找到 HBuilderX 内置 Node: %HBX_NODE%
    for /f "tokens=*" %%v in ('"%HBX_NODE%" --version 2^>nul') do set "NODE_VER=%%v"
    echo     版本: %NODE_VER%
    echo.
    echo 方案 A：把 HBuilderX 内置目录加入用户 PATH
    echo     C:\Users\%USERNAME%\AppData\Roaming\HBuilder X\plugins\node
    echo.
    echo     优点：无需下载安装，立刻生效
    echo     缺点：升级 HBuilderX 后路径可能变化，需重新执行本脚本
    echo.

    set /p USE_A=是否使用方案 A？(Y/N，直接回车=不操作):
    if /i "%USE_A%"=="Y" (
        set "NODE_DIR=D:\Tools\HBuilderX\HBuilderX\plugins\node"
        call :add_path
        goto :done
    )
)

echo.
echo 方案 B：独立安装 Node.js（推荐，更稳定）
echo.
echo   1. 打开 https://nodejs.org/zh-cn/download
echo   2. 下载 Windows Installer (.msi)
echo   3. 安装时注意：
echo      - 建议版本 20.x LTS
echo      - 你的 C 盘仅剩 12G，安装路径可改到 D:\NodeJS
echo      - 保持默认选项即可，npm 会一并安装
echo   4. 安装完成后【重启 HBuilderX】
echo.
echo 安装好后重新运行本脚本验证。
goto :end

:verify
echo.
echo ==========================================
echo   当前 Node 环境
echo ==========================================
for /f "delims=" %%i in ('where node') do echo   %%i
echo.
node --version
call npm --version 2>nul && echo   npm已就绪
echo.
goto :end

:add_path
echo.
echo 正在添加到用户 PATH...
set "CUR=%PATH%"
echo %CUR%;%NODE_DIR% > "%TEMP%\newpath.txt"
for /f "delims=" %%p in ("%TEMP%\newpath.txt") do setx PATH "%%p" 2>nul
if %errorlevel%==0 (
    echo [√] 已添加。请【重启 HBuilderX】使配置生效
) else (
    echo [!] 自动添加失败，请手动操作：
    echo.
    echo   1. 右键点击「此电脑」→ 属性 → 高级系统设置
    echo   2. 「环境变量」→ 用户变量 Path → 编辑
    echo   3. 新增一行：%NODE_DIR%
    echo   4. 确定后重启 HBuilderX
)
goto :end

:done
echo.
echo ==========================================
echo   完成！请重启 HBuilderX 后重试
echo ==========================================
goto :end

:end
echo.
pause