@echo off
title OKKREP Catalog Server
echo ========================================
echo  OKKREP Catalog - Starting...
echo  Keep this window OPEN while browsing
echo  Open: http://localhost:3000
echo ========================================

set PATH=%PATH%;C:\Program Files\nodejs

cd /d "C:\Users\rolys\okkrep-catalog\catalog"
npx next dev --port 3000
