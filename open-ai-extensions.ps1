# سكريبت فتح روابط Extensions AI
Write-Host "فتح روابط Extensions AI..." -ForegroundColor Cyan

$extensions = @(
    @{name="Codeium"; url="https://marketplace.visualstudio.com/items?itemName=Codeium.codeium"},
    @{name="GitHub Copilot"; url="https://marketplace.visualstudio.com/items?itemName=GitHub.copilot"},
    @{name="Codium AI"; url="https://marketplace.visualstudio.com/items?itemName=Codium.codium"},
    @{name="Continue"; url="https://marketplace.visualstudio.com/items?itemName=Continue.continue"},
    @{name="Mintlify Doc Writer"; url="https://marketplace.visualstudio.com/items?itemName=mintlify.document-writer"}
)

Write-Host ""
Write-Host "جاري فتح روابط Extensions..." -ForegroundColor Yellow
Write-Host ""

foreach ($ext in $extensions) {
    Write-Host "فتح رابط $($ext.name)..." -ForegroundColor White
    Start-Process $ext.url
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "تم فتح جميع الروابط!" -ForegroundColor Green
Write-Host ""
Write-Host "التعليمات:" -ForegroundColor Cyan
Write-Host "1. في كل صفحة، اضغط 'Install' في VS Code/Cursor" -ForegroundColor White
Write-Host "2. أو افتح Cursor واضغط Ctrl+Shift+X وابحث عن Extension" -ForegroundColor White
