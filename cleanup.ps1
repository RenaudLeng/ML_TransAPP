# Script de nettoyage pour ML Transport APP
Write-Host "Début du nettoyage..." -ForegroundColor Green

# 1. Nettoyer le cache npm
Write-Host "Nettoyage du cache npm..." -ForegroundColor Cyan
npm cache clean --force

# 2. Sauvegarder package.json et package-lock.json
Write-Host "Sauvegarde des fichiers de configuration..." -ForegroundColor Cyan
if (Test-Path "package.json") {
    Copy-Item "package.json" "package.json.backup" -Force
}
if (Test-Path "package-lock.json") {
    Copy-Item "package-lock.json" "package-lock.json.backup" -Force
}

# 3. Supprimer node_modules s'il existe
if (Test-Path "node_modules") {
    Write-Host "Suppression du dossier node_modules..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}

# 4. Supprimer les fichiers temporaires
Write-Host "Nettoyage des fichiers temporaires..." -ForegroundColor Cyan
Remove-Item "*.tmp" -ErrorAction SilentlyContinue
Remove-Item "*.log" -ErrorAction SilentlyContinue
Remove-Item "*.tmp.*" -ErrorAction SilentlyContinue
Remove-Item "thumbs.db" -ErrorAction SilentlyContinue

# 5. Vérifier l'espace disque
$before = (Get-ChildItem -Path . -Recurse | Where-Object { -not $_.PSIsContainer } | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Espace utilisé avant nettoyage: $($before.ToString('N2')) MB" -ForegroundColor Yellow

# 6. Réinstaller les dépendances si nécessaire
$reinstall = Read-Host "Voulez-vous réinstaller les dépendances ? (O/N)"
if ($reinstall -eq "O" -or $reinstall -eq "o") {
    Write-Host "Installation des dépendances..." -ForegroundColor Cyan
    npm install
}

# 7. Vérifier l'espace après nettoyage
$after = (Get-ChildItem -Path . -Recurse | Where-Object { -not $_.PSIsContainer } | Measure-Object -Property Length -Sum).Sum / 1MB
$saved = $before - $after
Write-Host "Espace utilisé après nettoyage: $($after.ToString('N2')) MB" -ForegroundColor Green
Write-Host "Espace libéré: $($saved.ToString('N2')) MB" -ForegroundColor Green

Write-Host "Nettoyage terminé avec succès!" -ForegroundColor Green
