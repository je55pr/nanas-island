@echo off
cd /d "%~dp0"
start "" http://127.0.0.1:8877
py -m http.server 8877
