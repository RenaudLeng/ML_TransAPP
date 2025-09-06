const fs = require('fs');
const path = require('path');

// Configuration des chemins
const config = {
  // Dossier source
  sourceDir: path.join(__dirname, '..', 'public', 'js'),
  
  // Fichiers à ignorer
  ignoreFiles: [
    'node_modules',
    '.git',
    'lib',
    'vendor'
  ],
  
  // Extensions de fichiers à traiter
  fileExtensions: ['.js'],
  
  // Mappage des anciens chemins vers les nouveaux
  pathMappings: {
    // Imports relatifs
    "from './": "from './",
    "from '../": "from '../",
    "from '/": "from '/public/",
    
    // Require
    "require('./": "require('./",
    "require('../": "require('../",
    "require('/": "require('/public/",
    
    // Chemins de base
    "'/js/": "'/public/js/",
    "'/css/": "'/public/css/",
    "'/images/": "'/public/assets/images/"
  },
  
  // Chemins à ignorer (ne pas modifier)
  ignorePatterns: [
    'node_modules',
    'https://',
    'http://',
    '//',
    'data:',
    'blob:'
  ]
};

// Vérifier si un chemin doit être ignoré
function shouldIgnorePath(filePath) {
  return config.ignorePatterns.some(pattern => filePath.includes(pattern));
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Mettre à jour les chemins d'import/require
    const importRegex = /(?:import|from|require)\s*(?:\(\s*['"]([^'"]+)['"]\s*\)|\s+['"]([^'"]+)['"])/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2];
      
      if (importPath && !shouldIgnorePath(importPath)) {
        let newPath = importPath;
        
        // Mettre à jour les chemins absolus
        if (importPath.startsWith('/js/')) {
          newPath = '/public' + importPath;
        } 
        // Mettre à jour les chemins relatifs si nécessaire
        else if (!importPath.startsWith('.')) {
          // Pour les imports non relatifs qui ne sont pas des modules npm
          if (!importPath.includes('/') || importPath.startsWith('@')) {
            continue; // Ignorer les modules npm
          }
          newPath = './' + importPath;
        }
        
        if (newPath !== importPath) {
          const oldImport = match[0];
          const quote = match[0].includes("'") ? "'" : '"';
          const newImport = oldImport.replace(importPath, newPath);
          
          content = content.replace(oldImport, newImport);
          updated = true;
        }
      }
    }
    
    // Appliquer les autres remplacements
    Object.entries(config.pathMappings).forEach(([oldPath, newPath]) => {
      if (content.includes(oldPath) && !shouldIgnorePath(oldPath)) {
        content = content.replace(new RegExp(oldPath, 'g'), newPath);
        updated = true;
      }
    });
    
    // Écrire le fichier si des modifications ont été apportées
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Mis à jour: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    console.error(`Erreur lors du traitement de ${filePath}:`, error.message);
  }
}

// Fonction pour parcourir les fichiers
function processDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    // Ignorer les fichiers/dossiers de la liste noire
    if (config.ignoreFiles.includes(entry.name)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && config.fileExtensions.includes(path.extname(entry.name).toLowerCase())) {
      processFile(fullPath);
    }
  }
}

console.log('Début de la mise à jour des chemins JavaScript...');
processDirectory(config.sourceDir);
console.log('Mise à jour des chemins JavaScript terminée.');
