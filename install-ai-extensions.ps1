# سكريبت تثبيت أدوات AI Extensions
# تاريخ الإنشاء: 2026-01-11

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "تثبيت أدوات AI Extensions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# قائمة Extensions المطلوبة
$extensions = @(
    @{name="GitHub.copilot"; display="GitHub Copilot"; url="https://marketplace.visualstudio.com/items?itemName=GitHub.copilot"},
    @{name="Codeium.codeium"; display="Codeium"; url="https://marketplace.visualstudio.com/items?itemName=Codeium.codeium"},
    @{name="Codium.codium"; display="Codium AI"; url="https://marketplace.visualstudio.com/items?itemName=Codium.codium"},
    @{name="Continue.continue"; display="Continue"; url="https://marketplace.visualstudio.com/items?itemName=Continue.continue"},
    @{name="mintlify.document-writer"; display="Mintlify Doc Writer"; url="https://marketplace.visualstudio.com/items?itemName=mintlify.document-writer"}
)

Write-Host "التحقق من VS Code CLI..." -ForegroundColor Yellow
$vscodeAvailable = $false
$cursorAvailable = $false

# التحقق من VS Code CLI
try {
    $vscodeVersion = code --version 2>&1 | Select-Object -First 1
    if ($vscodeVersion -match "\d+\.\d+") {
        $vscodeAvailable = $true
        Write-Host "✓ VS Code CLI متوفر: $vscodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ VS Code CLI غير متوفر" -ForegroundColor Yellow
}

# التحقق من Cursor
try {
    $cursorPath = Get-Command cursor -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
    if ($cursorPath) {
        $cursorAvailable = $true
        Write-Host "✓ Cursor CLI متوفر: $cursorPath" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Cursor CLI غير متوفر" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "قائمة Extensions المطلوبة:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($ext in $extensions) {
    Write-Host "• $($ext.display)" -ForegroundColor White
    Write-Host "  رابط: $($ext.url)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($vscodeAvailable) {
    Write-Host ""
    Write-Host "VS Code متوفر! جاري تثبيت Extensions..." -ForegroundColor Green
    Write-Host ""
    
    foreach ($ext in $extensions) {
        Write-Host "جاري تثبيت $($ext.display)..." -ForegroundColor Yellow
        try {
            code --install-extension $ext.name --force 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ تم تثبيت $($ext.display) بنجاح!" -ForegroundColor Green
            } else {
                Write-Host "✗ فشل تثبيت $($ext.display)" -ForegroundColor Red
            }
        } catch {
            Write-Host "✗ خطأ في تثبيت $($ext.display): $_" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "تم تثبيت Extensions!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
} elseif ($cursorAvailable) {
    Write-Host ""
    Write-Host "Cursor متوفر!" -ForegroundColor Green
    Write-Host "Cursor يستخدم نفس Extensions مثل VS Code" -ForegroundColor Yellow
    Write-Host "يمكنك تثبيت Extensions من داخل Cursor:" -ForegroundColor Yellow
    Write-Host "1. اضغط Ctrl+Shift+X" -ForegroundColor White
    Write-Host "2. ابحث عن Extension وثبت" -ForegroundColor White
    Write-Host ""
    
    # محاولة استخدام نفس الأمر
    foreach ($ext in $extensions) {
        Write-Host "محاولة تثبيت $($ext.display)..." -ForegroundColor Yellow
        try {
            cursor --install-extension $ext.name 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ تم تثبيت $($ext.display) بنجاح!" -ForegroundColor Green
            } else {
                Write-Host "✗ فشل تثبيت $($ext.display)" -ForegroundColor Yellow
                Write-Host "  يرجى التثبيت يدوياً من داخل Cursor" -ForegroundColor Gray
            }
        } catch {
            Write-Host "✗ Cursor CLI لا يدعم تثبيت Extensions مباشرة" -ForegroundColor Yellow
            break
        }
    }
} else {
    Write-Host ""
    Write-Host "⚠️  VS Code/Cursor CLI غير متوفر" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "التثبيت اليدوي:" -ForegroundColor Cyan
    Write-Host "1. افتح Cursor/VS Code" -ForegroundColor White
    Write-Host "2. اضغط Ctrl+Shift+X (Extensions)" -ForegroundColor White
    Write-Host "3. ابحث وثبت Extensions التالية:" -ForegroundColor White
    Write-Host ""
    
    foreach ($ext in $extensions) {
        Write-Host "   • $($ext.display)" -ForegroundColor Cyan
        Write-Host "     $($ext.url)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "أو افتح الروابط التالية:" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($ext in $extensions) {
        $open = Read-Host "فتح رابط $($ext.display)? (y/n)"
        if ($open -eq "y" -or $open -eq "Y") {
            Start-Process $ext.url
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ملاحظات مهمة:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. GitHub Copilot:" -ForegroundColor White
Write-Host "   - يحتاج تسجيل دخول بحساب GitHub" -ForegroundColor Gray
Write-Host "   - مجاني للطلاب / $10/شهر للأفراد" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Codeium:" -ForegroundColor White
Write-Host "   - مجاني تماماً" -ForegroundColor Gray
Write-Host "   - بديل جيد لـ GitHub Copilot" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Codium AI:" -ForegroundColor White
Write-Host "   - لإنشاء tests تلقائياً" -ForegroundColor Gray
Write-Host "   - يعمل مع Vitest" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Cursor IDE (إذا لم يكن مثبت):" -ForegroundColor White
Write-Host "   - تحميل من: https://cursor.sh/" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "تم الانتهاء!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
