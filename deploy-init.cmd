@echo off
REM ===========================================================================
REM deploy-init.cmd - ONE-TIME production database setup (push schema + seed)
REM
REM BEFORE running:
REM   1. Edit backend\.env:
REM        DATABASE_URL="mongodb+srv://USER:PASS@cluster0.../isdt_kairos?retryWrites=true&w=majority"
REM        ADMIN_PASSWORD=<your real admin password>
REM   2. Double-click this file.
REM
REM AFTER it succeeds:
REM   Set DATABASE_URL back to the local value (mongodb://127.0.0.1:27018/...)
REM   so your dev server keeps writing to the LOCAL database, not production.
REM ===========================================================================
setlocal
cd /d "%~dp0backend"

if not exist .env (
  echo [deploy-init] backend\.env not found.
  exit /b 1
)

findstr /c:"mongodb+srv://" .env >nul
if errorlevel 1 (
  echo [deploy-init] DATABASE_URL in backend\.env is not an Atlas string yet.
  echo [deploy-init] Copy the SRV string from Atlas ^> Connect ^> Drivers ^> Node.js
  echo [deploy-init] and paste it as DATABASE_URL="mongodb+srv://..." in backend\.env
  exit /b 1
)

findstr /c:"ADMIN_PASSWORD=CHANGE_ME" .env >nul
if not errorlevel 1 (
  echo [deploy-init] ADMIN_PASSWORD is still CHANGE_ME - set a real password in backend\.env first.
  exit /b 1
)

echo [deploy-init] 1/3 Generating Prisma client...
call npm run db:generate
if errorlevel 1 exit /b 1

echo [deploy-init] 2/3 Pushing schema ^(collections + unique indexes^) to Atlas...
call npm run db:push
if errorlevel 1 exit /b 1

echo [deploy-init] 3/3 Seeding the first admin account...
call npm run db:seed
if errorlevel 1 exit /b 1

echo.
echo [deploy-init] DONE - schema and admin are now on Atlas.
echo [deploy-init] IMPORTANT: switch DATABASE_URL in backend\.env BACK to the
echo [deploy-init] local mongodb://127.0.0.1:27018/... value so local dev stays local.
endlocal
