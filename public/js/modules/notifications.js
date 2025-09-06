// Fonction pour afficher une notification
function showNotification(message, type = 'success', duration = 3000) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = 'notification ' + (type || 'success');
    notification.innerHTML = [
        '<div class="notification-content">',
        '    <i class="notification-icon ', getNotificationIcon(type), '"></i>',
        '    <span>', (message || ''), '</span>',
        '</div>',
        '<button class="notification-close">&times;</button>'
    ].join('');

    // Ajouter la notification au conteneur
    const container = document.getElementById('notification-container') || createNotificationContainer();
    container.appendChild(notification);

    // Animation d'apparition
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Fermeture automatique
    const timeout = setTimeout(() => {
        closeNotification(notification);
    }, duration);

    // Fermeture au clic sur le bouton
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(timeout);
        closeNotification(notification);
    });

    // Retourner l'élément de notification pour une fermeture manuelle si nécessaire
    return notification;
}

// Créer le conteneur de notifications s'il n'existe pas
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
    return container;
}

// Fermer une notification
function closeNotification(notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    // Supprimer l'élément après l'animation
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// Obtenir l'icône appropriée en fonction du type de notification
function getNotificationIcon(type) {
    const icons = {
        success: 'ph ph-check-circle',
        error: 'ph ph-x-circle',
        warning: 'ph ph-warning',
        info: 'ph ph-info',
        loading: 'ph ph-spinner ph-spin'
    };
    return icons[type] || 'ph ph-info';
}

// Rendre les fonctions disponibles globalement
window.showNotification = showNotification;
window.closeNotification = closeNotification;
