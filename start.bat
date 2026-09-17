@echo off
title MoshiurGPT - Gemini AI Chatbot
echo ====================================================
echo Starting MoshiurGPT (Gemini + n8n AI Chatbot)...
echo ====================================================
cd /d "%~dp0"

if not exist node_modules (
  echo Installing project dependencies...
  call npm install
)

echo Starting development server...
start http://localhost:5173
call npm run dev
pause
