@echo off
echo.
echo ======================================
echo    CCF Location Tracker Setup
echo ======================================
echo.
echo This script will help you set up Google OAuth for your application.
echo.
echo Step 1: Go to Google Cloud Console
echo https://console.cloud.google.com/
echo.
echo Step 2: Create a new project or select existing one
echo.
echo Step 3: Enable the Google+ API
echo - Go to "APIs & Services" > "Library"
echo - Search for "Google+ API" and enable it
echo.
echo Step 4: Create OAuth 2.0 Client ID
echo - Go to "APIs & Services" > "Credentials"
echo - Click "Create Credentials" > "OAuth 2.0 Client ID"
echo - Application type: "Web application"
echo - Name: "CCF Location Tracker"
echo.
echo Step 5a: Add Authorized JavaScript Origins:
echo - http://localhost:3000
echo - https://yourdomain.com (for production)
echo.
echo Step 5b: Add Authorized Redirect URIs:
echo - http://localhost:3000/api/auth/callback/google
echo - https://yourdomain.com/api/auth/callback/google (for production)
echo.
echo Step 6: Copy Client ID and Client Secret
echo - Update .env.local file with your credentials
echo.
pause
echo.
echo Opening Google Cloud Console...
start https://console.cloud.google.com/
echo.
echo After setup, your .env.local should look like:
echo DATABASE_URL="file:./dev.db"
echo NEXTAUTH_URL=http://localhost:3000
echo NEXTAUTH_SECRET=9226e454a2bbd04b913cebe64df21610ee8c101187c46cb55e67eb2a7b47e552
echo GOOGLE_CLIENT_ID=your-actual-client-id
echo GOOGLE_CLIENT_SECRET=your-actual-client-secret
echo.
pause
