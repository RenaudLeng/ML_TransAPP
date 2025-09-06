@echo off
setlocal enabledelayedexpansion

set "file=public\js\config.js"

echo Correction des fins de ligne pour %file%

type %file% | find /v "" > temp.txt
move /y temp.txt %file%

echo Terminé !
pause
