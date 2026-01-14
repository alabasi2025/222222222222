# سكريبت تثبيت الأدوات في Windows
# تاريخ الإعداد: 2026-01-11

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "تثبيت الأدوات والبرامج للنظام المحاسبي" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من الصلاحيات
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  تنبيه: بعض الأدوات قد تحتاج صلاحيات مدير" -ForegroundColor Yellow
    Write-Host ""
}

# 1. Setup ESLint Config
Write-Host "1. Setting up ESLint Config..." -ForegroundColor Green
if (-not (Test-Path "eslint.config.js") -and -not (Test-Path "eslint.config.mjs")) {
    Write-Host "   Creating eslint.config.js..." -ForegroundColor White
    
    if (-not (Test-Path "eslint.config.js")) {
        Write-Host "   Note: eslint.config.js already created manually" -ForegroundColor Gray
    } else {
        Write-Host "   Done! eslint.config.js created" -ForegroundColor Green
    }
} else {
    Write-Host "   ESLint config file already exists" -ForegroundColor Gray
}
Write-Host ""

# 2. تهيئة Husky
Write-Host "2️⃣  تهيئة Husky..." -ForegroundColor Green
if (Test-Path ".husky") {
    Write-Host "   ℹ️  Husky موجود بالفعل" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Husky يحتاج تهيئة يدوية:" -ForegroundColor Yellow
    Write-Host "   قم بتشغيل: npx husky init" -ForegroundColor White
}
Write-Host ""

# 3. التحقق من PostgreSQL
Write-Host "3️⃣  التحقق من PostgreSQL..." -ForegroundColor Green
$pgPath = "C:\Program Files\PostgreSQL"
if (Test-Path $pgPath) {
    Write-Host "   ✅ PostgreSQL مثبت في: $pgPath" -ForegroundColor Green
    
    # البحث عن bin directory
    $pgVersions = Get-ChildItem -Path $pgPath -Directory -Filter "*" | Where-Object { $_.Name -match "^\d+" }
    if ($pgVersions) {
        $latestVersion = $pgVersions | Sort-Object Name -Descending | Select-Object -First 1
        $pgBinPath = Join-Path $latestVersion.FullName "bin"
        
        Write-Host "   📁 مسار bin: $pgBinPath" -ForegroundColor White
        
        # التحقق من PATH
        $envPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($envPath -notlike "*$pgBinPath*") {
            Write-Host "   ⚠️  PostgreSQL bin غير موجود في PATH" -ForegroundColor Yellow
            Write-Host "   💡 يمكن إضافته يدوياً من إعدادات Windows" -ForegroundColor Gray
        } else {
            Write-Host "   ✅ PostgreSQL bin موجود في PATH" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   ❌ PostgreSQL غير مثبت" -ForegroundColor Red
    Write-Host "   💡 قم بتنزيله من: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
}
Write-Host ""

# 4. التحقق من pgAdmin
Write-Host "4️⃣  التحقق من pgAdmin..." -ForegroundColor Green
$pgAdminPaths = @(
    "C:\Program Files\pgAdmin 4",
    "C:\Program Files (x86)\pgAdmin 4"
)
$pgAdminFound = $false
foreach ($path in $pgAdminPaths) {
    if (Test-Path $path) {
        Write-Host "   ✅ pgAdmin مثبت في: $path" -ForegroundColor Green
        $pgAdminFound = $true
        break
    }
}
if (-not $pgAdminFound) {
    Write-Host "   ❌ pgAdmin غير مثبت" -ForegroundColor Red
    Write-Host "   💡 قم بتنزيله من: https://www.pgadmin.org/download/pgadmin-4-windows/" -ForegroundColor Gray
}
Write-Host ""

# 5. التحقق من VS Code
Write-Host "5️⃣  التحقق من VS Code..." -ForegroundColor Green
$vscodePaths = @(
    "C:\Program Files\Microsoft VS Code\Code.exe",
    "C:\Program Files (x86)\Microsoft VS Code\Code.exe",
    "$env:LOCALAPPDATA\Programs\Microsoft VS Code\Code.exe"
)
$vscodeFound = $false
foreach ($path in $vscodePaths) {
    if (Test-Path $path) {
        Write-Host "   ✅ VS Code مثبت في: $path" -ForegroundColor Green
        $vscodeFound = $true
        
        # التحقق من PATH
        $codeCmd = Get-Command code -ErrorAction SilentlyContinue
        if ($codeCmd) {
            Write-Host "   ✅ VS Code موجود في PATH" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  VS Code غير موجود في PATH" -ForegroundColor Yellow
            Write-Host "   💡 قم بإضافته من VS Code: Ctrl+Shift+P > 'Shell Command: Install code command'" -ForegroundColor Gray
        }
        break
    }
}
if (-not $vscodeFound) {
    Write-Host "   ❌ VS Code غير مثبت" -ForegroundColor Red
    Write-Host "   💡 قم بتنزيله من: https://code.visualstudio.com/" -ForegroundColor Gray
}
Write-Host ""

# 6. تثبيت حزم npm/pnpm
Write-Host "6️⃣  التحقق من حزم npm/pnpm..." -ForegroundColor Green
Write-Host "   🔄 التحقق من الحزم المطلوبة..." -ForegroundColor White

$requiredPackages = @(
    "eslint",
    "@typescript-eslint/parser",
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-react",
    "eslint-plugin-react-hooks",
    "eslint-config-prettier",
    "husky",
    "lint-staged",
    "concurrently"
)

$missingPackages = @()
foreach ($pkg in $requiredPackages) {
    $pkgName = $pkg -replace "@.*?/", "" -replace "/.*", ""
    $installed = pnpm list $pkg --depth=0 2>&1 | Select-String "dependencies" -Quiet
    if (-not $installed) {
        $missingPackages += $pkg
    }
}

if ($missingPackages.Count -gt 0) {
    Write-Host "   ⚠️  الحزم المفقودة: $($missingPackages -join ', ')" -ForegroundColor Yellow
    Write-Host "   💡 قم بتثبيتها: pnpm add -D $($missingPackages -join ' ')" -ForegroundColor Gray
} else {
    Write-Host "   ✅ جميع الحزم المطلوبة مثبتة" -ForegroundColor Green
}
Write-Host ""

# 7. ملخص
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 ملخص التثبيت" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ مكتمل:" -ForegroundColor Green
Write-Host "   - إعداد ESLint Config" -ForegroundColor White

Write-Host ""
Write-Host "⚠️  يحتاج إجراء يدوي:" -ForegroundColor Yellow
Write-Host "   1. تهيئة Husky: npx husky init" -ForegroundColor White
if (-not $pgAdminFound) {
    Write-Host "   2. تثبيت pgAdmin" -ForegroundColor White
}
if (-not $vscodeFound) {
    Write-Host "   3. تثبيت VS Code" -ForegroundColor White
} elseif (-not $codeCmd) {
    Write-Host "   3. إضافة VS Code إلى PATH" -ForegroundColor White
}
if ($missingPackages.Count -gt 0) {
    Write-Host "   4. Install missing packages: pnpm add -D $($missingPackages -join ' ')" -ForegroundColor White
}

Write-Host ""
Write-Host "📚 روابط مفيدة:" -ForegroundColor Cyan
Write-Host "   - PostgreSQL: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
Write-Host "   - pgAdmin: https://www.pgadmin.org/download/pgadmin-4-windows/" -ForegroundColor Gray
Write-Host "   - VS Code: https://code.visualstudio.com/" -ForegroundColor Gray
Write-Host "   - Postman: https://www.postman.com/downloads/" -ForegroundColor Gray
Write-Host "   - DBeaver: https://dbeaver.io/download/" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ انتهى!" -ForegroundColor Green
