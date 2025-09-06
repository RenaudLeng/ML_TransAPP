/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier à corriger
const filePath = path.join(__dirname, 'public', 'js', 'config.js');

// Lire le contenu du fichier
let content = fs.readFileSync(filePath, 'utf8');

// Remplacer toutes les fins de ligne par des CRLF
content = content.replace(/\r?\n/g, '\r\n');

// Réécrire le fichier avec les bonnes fins de ligne
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fins de ligne corrigées avec succès dans config.js');
