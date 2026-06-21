@echo off
setlocal

:: Set up MSVC environment for x64
set "VSCMD_START_DIR=%CD%"
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" x64
if errorlevel 1 goto :error

:: Run cargo build
cd /D "D:\AIKFCC\Storyloom"
cargo tauri build
if errorlevel 1 goto :error

endlocal
exit /b 0

:error
echo Build failed
endlocal
exit /b 1
