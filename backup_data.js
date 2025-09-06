// Script de sauvegarde des données du localStorage

function saveToFile(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Fonction pour sauvegarder toutes les données
function backupAllData() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    
    // Récupérer les données du localStorage
    const recettes = JSON.parse(localStorage.getItem('recettes') || '[]');
    const depenses = JSON.parse(localStorage.getItem('depenses') || '[]');
    const vehicules = JSON.parse(localStorage.getItem('vehicules') || '[]');
    
    // Filtrer les données pour les dates du 19-20 août 2025
    const startDate = new Date('2025-08-19T00:00:00');
    const endDate = new Date('2025-08-20T23:59:59');
    
    const filteredRecettes = recettes.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
    });
    
    const filteredDepenses = depenses.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
    });
    
    // Sauvegarder les données
    saveToFile(`recettes_${timestamp}.json`, filteredRecettes);
    saveToFile(`depenses_${timestamp}.json`, filteredDepenses);
    saveToFile(`vehicules_${timestamp}.json`, vehicules);
    
    console.log('Sauvegarde terminée !');
    return {
        recettes: filteredRecettes.length,
        depenses: filteredDepenses.length,
        vehicules: vehicules.length
    };
}

// Exporter la fonction pour pouvoir l'appeler depuis la console
try {
    window.backupAllData = backupAllData;
    console.log('Script de sauvegarde chargé. Tapez backupAllData() dans la console pour effectuer une sauvegarde.');
} catch (e) {
    console.error('Erreur lors de l\'initialisation du script de sauvegarde:', e);
}
