// Initialisation du compte administrateur par défaut
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si un compte admin existe déjà
    const settings = JSON.parse(localStorage.getItem('appSettings')) || {};
    
    // Si aucun compte admin n'existe, on en crée un par défaut
    if (!settings.username || !settings.password) {
        const defaultSettings = {
            username: 'admin',
            password: 'admin123',
            adminFullName: 'Administrateur',
            role: 'admin',
            theme: 'light',
            language: 'fr',
            // Autres paramètres par défaut si nécessaire
            companyName: 'ML Transport',
            phone: '',
            address: '',
            city: '',
            postalCode: '',
            country: 'France'
        };
        
        // Sauvegarder les paramètres
        localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
        
        // Créer également un utilisateur dans la liste des utilisateurs si nécessaire
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const adminExists = users.some(user => user.username === 'admin');
        
        if (!adminExists) {
            users.push({
                id: 'admin-1',
                username: 'admin',
                fullName: 'Administrateur',
                role: 'admin',
                email: '',
                phone: '',
                createdAt: new Date().toISOString(),
                isActive: true
            });
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        console.log('Compte administrateur par défaut créé avec succès');
    }
});
