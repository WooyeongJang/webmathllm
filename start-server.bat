@echo off
echo TinyMathLLM 서버를 시작합니다...
echo.

REM 현재 디렉토리가 프로젝트 폴더인지 확인
if not exist "package.json" (
    echo 오류: package.json 파일을 찾을 수 없습니다.
    echo 현재 디렉토리: %cd%
    echo 프로젝트 폴더에서 실행해주세요.
    pause
    exit /b 1
)

REM Node.js serve 명령어 시도
echo Node.js serve 명령어를 시도합니다...
npx serve . --listen 8000
if %errorlevel% neq 0 (
    echo.
    echo Node.js serve에 실패했습니다. Python 서버를 시도합니다...
    python -m http.server 8000
    if %errorlevel% neq 0 (
        echo.
        echo 서버 시작에 실패했습니다.
        echo Python 또는 Node.js가 설치되어 있는지 확인해주세요.
        pause
        exit /b 1
    )
)

echo 서버가 종료되었습니다.
pause
