# Script de nettoyage avancé pour ML Transport APP
Write-Host "=== NETTOYAGE AVANCÉ DU PROJET ===" -ForegroundColor Green

# 1. Calculer l'espace avant nettoyage
$before = (Get-ChildItem -Path . -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Espace utilisé avant nettoyage: $($before.ToString('N2')) MB" -ForegroundColor Yellow

# 2. Dossiers et fichiers à conserver (ajuster selon les besoins)
$protectedFiles = @(
    "index.html",
    "*.js",
    "*.css",
    "*.json",
    "*.html",
    "*.md"
)
$protectedDirs = @(
    "js",
    "css",
    "img"
)

# 3. Fichiers et dossiers à supprimer
$patternsToRemove = @(
    # Fichiers temporaires
    "*.tmp", "*.temp", "~*.*", "*.bak", "*.old", "*.log",
    # Fichiers système
    "Thumbs.db", ".DS_Store", "desktop.ini",
    # Dossiers de build/dépendances
    "node_modules", ".git", ".vscode", "__pycache__"
)

# 4. Fonction pour vérifier si un fichier est protégé
function Is-Protected($file) {
    $name = $file.Name
    $ext = [System.IO.Path]::GetExtension($name).ToLower()
    $parentDir = (Get-Item $file.Directory).Name
    
    # Vérifier les dossiers protégés
    if ($protectedDirs -contains $parentDir) {
        return $true
    }
    
    # Vérifier les extensions protégées
    $protectedExtensions = $protectedFiles | Where-Object { $_.StartsWith("*") -and $_.Contains(".") } | 
        ForEach-Object { $_.Substring(1) }
    
    if ($protectedExtensions -contains $ext) {
        return $true
    }
    
    # Vérifier les noms de fichiers protégés exacts
    $exactMatches = $protectedFiles | Where-Object { -not $_.Contains("*") }
    if ($exactMatches -contains $name) {
        return $true
    }
    
    return $false
}

# 5. Nettoyage des fichiers
$totalFreed = 0
$deletedItems = @()

foreach ($pattern in $patternsToRemove) {
    Get-ChildItem -Path . -Recurse -Force -Include $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        if (-not (Is-Protected $_)) {
            $size = if ($_.PSIsContainer) {
                (Get-ChildItem -Path $_.FullName -Recurse -File -Force | Measure-Object -Property Length -Sum).Sum / 1MB
            } else {
                $_.Length / 1MB
            }
            
            $deletedItems += [PSCustomObject]@{
                Name = $_.FullName
                Type = if ($_.PSIsContainer) { "Dossier" } else { "Fichier" }
                SizeMB = [math]::Round($size, 2)
            }
            
            $totalFreed += $size
            Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

# 6. Supprimer les dossiers vides
Get-ChildItem -Path . -Recurse -Directory | Where-Object { 
    $_.GetFiles('*', 'AllDirectories').Count -eq 0 
} | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# 7. Afficher le rapport
$after = (Get-ChildItem -Path . -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "`n=== RAPPORT DE NETTOYAGE ===" -ForegroundColor Green
Write-Host "Espace libéré: $([math]::Round($totalFreed, 2)) MB" -ForegroundColor Cyan
Write-Host "Espace utilisé après nettoyage: $($after.ToString('N2')) MB" -ForegroundColor Green

if ($deletedItems.Count -gt 0) {
    Write-Host "`nÉléments supprimés:" -ForegroundColor Yellow
    $deletedItems | Format-Table @{
        Label="Type"; Expression={"$($_.Type)"}
    }, @{
        Label="Taille (MB)"; Expression={"$($_.SizeMB)"}; Align='right'
    }, @{
        Label="Chemin"; Expression={"$($_.Name)"}
    } -AutoSize | Out-String -Width 200 | Write-Host
}

Write-Host "`nNettoyage terminé avec succès!" -ForegroundColor Green
