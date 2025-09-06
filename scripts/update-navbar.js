const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.join(__dirname, '..');
const navbarContainer = '  <!-- Conteneur pour la barre de navigation -->\n  <div id="navbar-container">\n    <!-- La barre de navigation sera chargée ici de manière asynchrone -->\n  </div>\n  \n  <!-- Marge pour le contenu sous la barre de navigation fixe -->\n  <div style="height: 72px;"></div>';

const requiredStyles = [
  '<link href="/css/components/navbar.css" rel="stylesheet">',
  '<link href="/css/components/buttons.css" rel="stylesheet">',
  '<link href="/css/components/notifications.css" rel="stylesheet">',
  '<link href="/css/pages/style.css" rel="stylesheet">'
];

const requiredScripts = [
  '<script src="/public/js/modules/utils/include-navbar.js" defer></script>'
];

// Fonction pour mettre à jour un fichier HTML
function updateHtmlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Vérifier et ajouter le conteneur de la barre de navigation
    if (!content.includes('id="navbar-container"')) {
      const bodyOpenIndex = content.indexOf('<body');
      if (bodyOpenIndex !== -1) {
        const bodyCloseIndex = content.indexOf('>', bodyOpenIndex) + 1;
        content = content.substring(0, bodyCloseIndex) + '\n' + navbarContainer + '\n' + content.substring(bodyCloseIndex);
        updated = true;
      }
    }

    // Vérifier et ajouter les styles nécessaires
    const headCloseIndex = content.indexOf('</head>');
    if (headCloseIndex !== -1) {
      for (const style of requiredStyles) {
        if (!content.includes(style.split('"')[1])) {
          content = content.substring(0, headCloseIndex) + '\n  ' + style + content.substring(headCloseIndex);
          updated = true;
        }
      }
    }

    // Vérifier et ajouter les scripts nécessaires
    const bodyCloseIndex = content.lastIndexOf('</body>');
    if (bodyCloseIndex !== -1) {
      for (const script of requiredScripts) {
        if (!content.includes(script.split('"')[1])) {
          content = content.substring(0, bodyCloseIndex) + '\n  ' + script + '\n' + content.substring(bodyCloseIndex);
          updated = true;
        }
      }
    }

    // Écrire les modifications si nécessaire
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Mise à jour effectuée : ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Erreur lors du traitement du fichier ${filePath}:`, error);
    return false;
  }
}

// Fonction principale
function main() {
  console.log('Début de la mise à jour de la barre de navigation...');
  
  // Parcourir tous les fichiers HTML
  const files = fs.readdirSync(rootDir)
    .filter(file => file.endsWith('.html') && file !== 'navbar.html' && file !== 'login.html' && file !== 'offline.html')
    .map(file => path.join(rootDir, file));

  let updatedCount = 0;
  
  // Mettre à jour chaque fichier
  for (const file of files) {
    if (updateHtmlFile(file)) {
      updatedCount++;
    }
  }

  console.log(`\nMise à jour terminée. ${updatedCount} fichiers mis à jour sur ${files.length} fichiers traités.`);
}

// Exécuter le script
main();
