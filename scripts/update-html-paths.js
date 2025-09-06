const fs = require('fs');
const path = require('path');

// Configuration des chemins
const config = {
  // Dossiers à traiter
  sourceDir: path.join(__dirname, '..'),
  
  // Fichiers à ignorer
  ignoreFiles: [
    'node_modules',
    '.git',
    'public',
    'src',
    'tests',
    'docs',
    'scripts',
    '.vscode'
  ],
  
  // Mappage des anciens chemins vers les nouveaux
  pathMappings: {
    // Chemins CSS
    'href="css/': 'href="public/css/components/',
    
    // Chemins JS
    'src="js/': 'src="public/js/modules/',
    
    // Chemins des images
    'src="images/': 'src="public/assets/images/',
    'src="/images/': 'src="/public/assets/images/',
    
    // Chemins des polices
    'url(../fonts/': 'url(../public/assets/fonts/',
    
    // Autres chemins
    'href="favicon.ico"': 'href="public/assets/favicon.ico"',
    'href="/favicon.ico"': 'href="/public/assets/favicon.ico"'
  }
};

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Appliquer les remplacements
    Object.entries(config.pathMappings).forEach(([oldPath, newPath]) => {
      if (content.includes(oldPath)) {
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
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      processFile(fullPath);
    }
  }
}

console.log('Début de la mise à jour des chemins...');
processDirectory(config.sourceDir);
console.log('Mise à jour des chemins terminée.');
