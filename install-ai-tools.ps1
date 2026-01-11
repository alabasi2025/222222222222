# سكريبت تثبيت أدوات AI للتطوير
# تاريخ الإنشاء: 2026-01-11

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "تثبيت أدوات AI للتطوير" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من Node.js
Write-Host "التحقق من Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js غير مثبت. يرجى تثبيت Node.js أولاً." -ForegroundColor Red
    exit 1
}

# التحقق من pnpm
Write-Host "التحقق من pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✓ pnpm: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ pnpm غير مثبت. يرجى تثبيت pnpm أولاً." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ملاحظات مهمة:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "معظم أدوات AI هي Extensions لـ VS Code/Cursor وليست npm packages." -ForegroundColor Yellow
Write-Host ""
Write-Host "الأدوات التي تحتاج تثبيت يدوي:" -ForegroundColor Yellow
Write-Host "1. Cursor IDE: https://cursor.sh/" -ForegroundColor White
Write-Host "2. GitHub Copilot: Extension في VS Code/Cursor" -ForegroundColor White
Write-Host "3. Codeium: Extension في VS Code/Cursor" -ForegroundColor White
Write-Host "4. Codium AI: Extension في VS Code/Cursor" -ForegroundColor White
Write-Host "5. Continue: Extension في VS Code/Cursor" -ForegroundColor White
Write-Host ""
Write-Host "للأدوات التي يمكن تثبيتها عبر CLI:" -ForegroundColor Yellow
Write-Host ""

# تثبيت Aider (إذا كان Python متوفر)
Write-Host "التحقق من Python لتثبيت Aider..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python متوفر: $pythonVersion" -ForegroundColor Green
    Write-Host ""
    Write-Host "هل تريد تثبيت Aider (AI coding assistant)؟" -ForegroundColor Yellow
    Write-Host "الأمر: pip install aider-chat" -ForegroundColor White
    $installAider = Read-Host "تثبيت Aider? (y/n)"
    if ($installAider -eq "y" -or $installAider -eq "Y") {
        Write-Host "جاري تثبيت Aider..." -ForegroundColor Yellow
        pip install aider-chat
        Write-Host "✓ تم تثبيت Aider بنجاح!" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Python غير متوفر - لن يتم تثبيت Aider" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "تعليمات تثبيت Extensions في Cursor/VS Code:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. افتح Cursor/VS Code" -ForegroundColor White
Write-Host "2. اضغط Ctrl+Shift+X (أو Cmd+Shift+X على Mac)" -ForegroundColor White
Write-Host "3. ابحث عن Extension وثبت:" -ForegroundColor White
Write-Host "   - GitHub Copilot" -ForegroundColor Cyan
Write-Host "   - Codeium" -ForegroundColor Cyan
Write-Host "   - Codium AI" -ForegroundColor Cyan
Write-Host "   - Continue" -ForegroundColor Cyan
Write-Host "   - Mintlify Doc Writer" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Cursor IDE (إذا لم يكن مثبت):" -ForegroundColor White
Write-Host "   - تحميل من: https://cursor.sh/" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "تم الانتهاء!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
