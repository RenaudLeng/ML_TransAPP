const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  htmlDir: __dirname, // Dossier racine du projet
  navbarPartial: path.join(__dirname, 'public', 'partials', 'navbar.html'),
  navbarContainer: '<!-- Conteneur pour la barre de navigation -->\n  <div id="navbar-container">\n    <!-- La barre de navigation sera chargée ici de manière asynchrone -->\n  </div>\n  \n  <!-- Marge pour le contenu sous la barre de navigation fixe -->\n  <div style="height: 72px;"></div>',
  navbarCssLink: '  <link href="/css/components/navbar.css" rel="stylesheet">',
  navbarScript: '  <script src="/js/modules/utils/include-navbar.js" defer></script>',
  excludeFiles: ['login.html', 'auth.html', '404.html']
};

// Fonction pour mettre à jour un fichier HTML
function updateHtmlFile(filePath) {
  try {
    // Lire le contenu du fichier
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si le fichier a déjà été mis à jour
    if (content.includes('id="navbar-container"')) {
      console.log(`[SKIP] ${filePath} a déjà été mis à jour`);
      return;
    }
    
    // Remplacer la balise body existante
    const updatedContent = content
      // Supprimer l'ancienne barre de navigation
      .replace(/<nav[\s\S]*?<\/nav>\s*<\/body>/, `${config.navbarContainer}\n</body>`)
      // Ajouter le lien CSS de la barre de navigation
      .replace('</title>', `</title>\n${config.navbarCssLink}`)
      // Ajouter le script de la barre de navigation avant la fermeture de body
      .replace('</body>', `  ${config.navbarScript}\n</body>`);
    
    // Écrire les modifications dans le fichier
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`[OK] ${filePath} mis à jour avec succès`);
  } catch (error) {
    console.error(`[ERREUR] Impossible de mettre à jour ${filePath}:`, error.message);
  }
}

// Fonction pour trouver tous les fichiers HTML
function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let htmlFiles = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      // Ignorer les dossiers node_modules, .git, etc.
      if (!['node_modules', '.git', 'dist', 'build'].includes(file.name)) {
        htmlFiles = [...htmlFiles, ...findHtmlFiles(fullPath)];
      }
    } else if (file.name.endsWith('.html') && !config.excludeFiles.includes(file.name)) {
      htmlFiles.push(fullPath);
    }
  }
  
  return htmlFiles;
}

// Exécuter la mise à jour
console.log('Début de la mise à jour des fichiers HTML...');
const htmlFiles = findHtmlFiles(config.htmlDir);
console.log(`Trouvé ${htmlFiles.length} fichiers HTML à mettre à jour.`);

htmlFiles.forEach(file => {
  console.log(`\nTraitement de ${file}...`);
  updateHtmlFile(file);
});

console.log('\nMise à jour terminée !');
