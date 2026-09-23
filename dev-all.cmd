@echo off
cd /d E:\Project\CODE\ISDTKAIROS
call start-mongo.cmd
call "%~dp0node_modules\.bin\concurrently.cmd" "npm --prefix backend run dev" "npm --prefix frontend run dev" > E:\Project\CODE\ISDTKAIROS\run-dev.log 2>&1
