@echo off

cd /d "%~dp0"

echo ============================
echo 正在更新 QQ 音乐歌单
echo ============================
echo.

node scripts\import-qq.mjs

echo.
pause