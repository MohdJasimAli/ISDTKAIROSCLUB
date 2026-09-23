@echo off
cd /d E:\Project\CODE\ISDTKAIROS\backend
call npm install > E:\Project\CODE\ISDTKAIROS\be-install.log 2>&1
echo BE_DONE >> E:\Project\CODE\ISDTKAIROS\install-status.log
cd /d E:\Project\CODE\ISDTKAIROS\frontend
call npm install > E:\Project\CODE\ISDTKAIROS\fe-install.log 2>&1
echo FE_DONE >> E:\Project\CODE\ISDTKAIROS\install-status.log
cd /d E:\Project\CODE\ISDTKAIROS
call npm install > E:\Project\CODE\ISDTKAIROS\root-install.log 2>&1
echo ROOT_DONE >> E:\Project\CODE\ISDTKAIROS\install-status.log
