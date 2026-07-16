$ErrorActionPreference = "Stop"

# 1. Smart Directory Detection (Fixes the System32 bug)
$ROOT_DIR = $PSScriptRoot
if (-not $ROOT_DIR) { $ROOT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path }
# If it's still empty or pointing to System32, force it to the user's actual Downloads folder
if (-not $ROOT_DIR -or $ROOT_DIR -like "*System32*") {
    $ROOT_DIR = [System.Environment]::GetFolderPath("UserProfile") + "\Downloads"
}

$FRONTEND_DIR = Join-Path $ROOT_DIR "lifeos-ascend"
$BACKEND_DIR = Join-Path $ROOT_DIR "backend"
$BACKEND_STATIC_DIR = Join-Path $BACKEND_DIR "static"

Write-Host "Root directory set to: $ROOT_DIR" -ForegroundColor Gray

# Validate that the folders actually exist
if (-not (Test-Path $FRONTEND_DIR)) {
    Write-Error "ERROR: Cannot find 'lifeos-ascend' folder in $ROOT_DIR."
    exit 1
}
if (-not (Test-Path $BACKEND_DIR)) {
    Write-Error "ERROR: Cannot find 'backend' folder in $ROOT_DIR."
    exit 1
}

# Step 2: Build the frontend
Write-Host "`n[1/4] Building frontend..." -ForegroundColor Cyan
Set-Location -Path $FRONTEND_DIR
npm run build

# Step 3: Copy dist to backend static
Write-Host "`n[2/4] Copying frontend build to backend static folder..." -ForegroundColor Cyan
if (-not (Test-Path $BACKEND_STATIC_DIR)) {
    New-Item -ItemType Directory -Path $BACKEND_STATIC_DIR | Out-Null
}
Copy-Item -Path "$FRONTEND_DIR\dist\*" -Destination $BACKEND_STATIC_DIR -Recurse -Force

# Step 4: Install backend requirements
Write-Host "`n[3/4] Installing backend dependencies..." -ForegroundColor Cyan
Set-Location -Path $BACKEND_DIR
pip install -r requirements.txt pyinstaller

# Step 5: Compile executable
Write-Host "`n[4/4] Compiling executable..." -ForegroundColor Cyan
pyinstaller --noconfirm --onedir --windowed `
  --add-data "static;static" `
  --add-data "app;app" `
  --hidden-import "openwakeword" `
  --hidden-import "sounddevice" `
  --hidden-import "sentence_transformers" `
  --hidden-import "webview" `
  --name "LifeOS_Ascend" `
  .\app\desktop_app.py

# Step 6: Check Admin and add Defender exclusion
Write-Host "`nConfiguring Windows Defender..." -ForegroundColor Cyan
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$exclusionPath = Join-Path $BACKEND_DIR "dist\LifeOS_Ascend"

if ($isAdmin) {
    Write-Host "Adding Defender exclusion for $exclusionPath..." -ForegroundColor Green
    Add-MpPreference -ExclusionPath "$exclusionPath"
    Write-Host "Build complete! Exclusions added." -ForegroundColor Green
} else {
    Write-Warning "WARNING: The script is NOT running as Administrator."
    Write-Warning "Please manually add '$exclusionPath' to Windows Defender Exclusions to prevent false positives."
Read-Host "Press Enter to close this window..."
}
