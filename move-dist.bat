@echo off
echo 🚀 Starting build and move process...

echo 📦 Building frontend project...
cd frontend
call npm run build
cd ..

echo 📁 Creating target directory if it doesn't exist...
if not exist "website\dist" mkdir "website\dist"

echo 🗑️  Cleaning existing dist folder in website...
if exist "website\dist" rmdir /s /q "website\dist"
mkdir "website\dist"

echo 📋 Copying dist folder to website...
xcopy "frontend\dist\hirta-kiosk\*" "website\dist\" /E /I /Y

echo ✅ Successfully moved dist folder to website/dist