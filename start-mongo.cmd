@echo off
REM Project-local MongoDB replica set (Prisma requires a replica set for writes).
REM Dedicated port 27018 so the system MongoDB service on 27017 stays untouched.
set PORT=27018
set DBPATH=%~dp0.mongo-data
set MONGOD=C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe

powershell -NoProfile -Command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', %PORT%); $c.Close(); exit 0 } catch { exit 1 }"
if %ERRORLEVEL%==0 (
  echo [db] MongoDB already running on port %PORT%
  exit /b 0
)

if not exist "%DBPATH%" mkdir "%DBPATH%"
powershell -NoProfile -Command "Start-Process -FilePath '%MONGOD%' -ArgumentList '--port','%PORT%','--dbpath','%DBPATH%','--replSet','rs0','--bind_ip','127.0.0.1' -WindowStyle Hidden"
echo [db] Starting MongoDB replica set on port %PORT% ...

powershell -NoProfile -Command "$ok = $false; for ($i = 0; $i -lt 30; $i++) { try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', %PORT%); $c.Close(); $ok = $true; break } catch { Start-Sleep -Milliseconds 500 } }; if (-not $ok) { Write-Error 'MongoDB failed to start'; exit 1 }; Write-Output '[db] MongoDB is up on port %PORT%'"
exit /b %ERRORLEVEL%
