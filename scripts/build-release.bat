@echo off
cd /d D:\AIKFCC\Storyloom
set ATC_DIST_DIR=D:\AIKFCC\Storyloom\release
set PATH=C:\Users\23501\.astrbot_launcher\components\nodejs;%PATH%

npm run build
if errorlevel 1 exit /b 1

npm run build:server
if errorlevel 1 exit /b 1

npm run build:electron
if errorlevel 1 exit /b 1

npm run electron:rebuild
if errorlevel 1 exit /b 1

npx electron-builder --win nsis --publish never
if errorlevel 1 exit /b 1

echo Build completed successfully
