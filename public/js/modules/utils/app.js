// Gestion des notifications
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des tooltips Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Gestion des messages de notification depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const notificationType = urlParams.get('notification');
    const notificationMessage = urlParams.get('message');

    if (notificationType && notificationMessage) {
        showNotification(decodeURIComponent(notificationMessage), notificationType);
        // Nettoyer l'URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
});

// Fonction utilitaire pour formater les montants
function formatMoney(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Fonction pour confirmer une action critique
function confirmAction(message, callback) {
    if (confirm(message)) {
        if (typeof callback === 'function') {
            callback();
        }
        return true;
    }
    return false;
}

// Fonction pour désactiver un bouton pendant le chargement
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span class="visually-hidden">Chargement...</span>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text') || button.textContent;
    }
}

// Fonction pour initialiser les boutons de chargement
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.btn-loading').forEach(button => {
        button.setAttribute('data-original-text', button.innerHTML);
        
        button.addEventListener('click', function(e) {
            if (button.hasAttribute('data-confirm')) {
                const confirmed = confirm(button.getAttribute('data-confirm'));
                if (!confirmed) {
                    e.preventDefault();
                    return false;
                }
            }
            
            if (button.hasAttribute('data-loading-text')) {
                setButtonLoading(button, true);
            }
        });
    });
});

// Gestion des onglets dans le stockage local
document.addEventListener('DOMContentLoaded', function() {
    // Restaurer l'onglet actif
    const tabElms = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabElms.forEach(tabEl => {
        tabEl.addEventListener('shown.bs.tab', function (e) {
            const target = e.target.getAttribute('data-bs-target');
            if (target) {
                localStorage.setItem('lastActiveTab', target);
            }
        });
    });

    // Activer le dernier onglet utilisé
    const lastActiveTab = localStorage.getItem('lastActiveTab');
    if (lastActiveTab) {
        const tabElement = document.querySelector(`[data-bs-target="${lastActiveTab}"]`);
        if (tabElement && bootstrap && bootstrap.Tab) {
            try {
                const tab = new bootstrap.Tab(tabElement);
                if (tab && typeof tab.show === 'function') {
                    tab.show();
                }
            } catch (error) {
                console.error('Erreur lors de l\'initialisation de l\'onglet:', error);
            }
        } else if (tabElement) {
            // Fallback pour les cas où Bootstrap n'est pas encore chargé
            const tab = new bootstrap.Tab(tabElement);
            if (tab && typeof tab.show === 'function') {
                tab.show();
            }
        } else {
            console.warn('Élément d\'onglet non trouvé pour:', lastActiveTab);
        }
    }
});

// Fonction pour initialiser les sélecteurs de date
function initDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.valueAsDate = new Date();
        }
    });
}

// Initialiser les sélecteurs de date au chargement
document.addEventListener('DOMContentLoaded', initDatePickers);

// Fonction pour gérer les formulaires avec validation
function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}

// Initialiser la validation des formulaires
document.addEventListener('DOMContentLoaded', initFormValidation);

// Fonction pour copier du texte dans le presse-papier
function copyToClipboard(text, element = null) {
    navigator.clipboard.writeText(text).then(() => {
        if (element) {
            const originalText = element.innerHTML;
            element.innerHTML = '<i class="ph ph-check"></i> Copié !';
            setTimeout(() => {
                element.innerHTML = originalText;
            }, 2000);
        }
        showNotification('Texte copié dans le presse-papier', 'success');
    }).catch(err => {
        console.error('Erreur lors de la copie : ', err);
        showNotification('Erreur lors de la copie', 'error');
    });
}

// Initialiser les boutons de copie
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-copy]').forEach(button => {
        button.addEventListener('click', function() {
            const textToCopy = this.getAttribute('data-copy');
            copyToClipboard(textToCopy, this);
        });
    });
});

// Fonction pour formater la date en français
function formatDateFr(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('fr-FR', options);
}

// Fonction pour formater la durée
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${remainingSeconds}s`);
    
    return parts.join(' ');
}

// Fonction pour générer un ID unique
function generateId(prefix = '') {
    return prefix + Math.random().toString(36).substr(2, 9);
}

// Fonction pour trier un tableau d'objets par propriété
function sortByProperty(property, order = 'asc') {
    return function(a, b) {
        let result = 0;
        if (a[property] < b[property]) result = -1;
        if (a[property] > b[property]) result = 1;
        return order === 'asc' ? result : -result;
    };
}

// Fonction pour filtrer un tableau d'objets
function filterArray(array, filters) {
    return array.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (value === undefined || value === null || value === '') return true;
            if (typeof value === 'function') return value(item[key]);
            if (Array.isArray(value)) return value.includes(item[key]);
            return item[key] == value;
        });
    });
}

// Fonction pour paginer un tableau
function paginate(array, page = 1, perPage = 10) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedItems = array.slice(start, end);
    
    return {
        items: paginatedItems,
        currentPage: page,
        perPage,
        total: array.length,
        totalPages: Math.ceil(array.length / perPage)
    };
}

// Fonction pour générer un dégradé de couleurs
function generateGradient(color1, color2, steps) {
    const parseColor = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    };

    const c1 = parseColor(color1);
    const c2 = parseColor(color2);
    const gradient = [];

    for (let i = 0; i < steps; i++) {
        const r = Math.round(c1.r + (c2.r - c1.r) * (i / (steps - 1)));
        const g = Math.round(c1.g + (c2.g - c1.g) * (i / (steps - 1)));
        const b = Math.round(c1.b + (c2.b - c1.b) * (i / (steps - 1)));
        gradient.push(`rgb(${r}, ${g}, ${b})`);
    }

    return gradient;
}

// Fonction pour calculer la différence entre deux dates
function dateDiff(date1, date2) {
    const diff = Math.abs(new Date(date1) - new Date(date2));
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    return { days, hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60 };
}

// Fonction pour formater la différence de temps
function formatTimeAgo(date) {
    const now = new Date();
    const diff = dateDiff(now, date);
    
    if (diff.days > 30) {
        return `il y a plus d'un mois`;
    } else if (diff.days > 0) {
        return `il y a ${diff.days} jour${diff.days > 1 ? 's' : ''}`;
    } else if (diff.hours > 0) {
        return `il y a ${diff.hours} heure${diff.hours > 1 ? 's' : ''}`;
    } else if (diff.minutes > 0) {
        return `il y a ${diff.minutes} minute${diff.minutes > 1 ? 's' : ''}`;
    } else {
        return 'à l\'instant';
    }
}

// Fonction pour initialiser les compteurs animés
function initAnimatedCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-target');
                const duration = 2000; // 2 secondes
                const step = target / (duration / 16); // 60fps
                let current = 0;
                
                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        entry.target.textContent = Math.ceil(current).toLocaleString();
                        requestAnimationFrame(updateCounter);
                    } else {
                        entry.target.textContent = target.toLocaleString();
                    }
                };
                
                updateCounter();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// Initialiser les compteurs animés
document.addEventListener('DOMContentLoaded', initAnimatedCounters);

// Fonction pour générer un mot de passe sécurisé
function generatePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
    let password = '';
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    
    for (let i = 0; i < length; i++) {
        password += charset[values[i] % charset.length];
    }
    
    return password;
}

// Fonction pour vérifier la force d'un mot de passe
function checkPasswordStrength(password) {
    let strength = 0;
    
    // Longueur minimale
    if (password.length >= 8) strength++;
    
    // Contient des minuscules
    if (/[a-z]/.test(password)) strength++;
    
    // Contient des majuscules
    if (/[A-Z]/.test(password)) strength++;
    
    // Contient des chiffres
    if (/[0-9]/.test(password)) strength++;
    
    // Contient des caractères spéciaux
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return {
        score: strength,
        strength: strength <= 2 ? 'Faible' : strength <= 4 ? 'Moyen' : 'Fort'
    };
}

// Fonction pour formater les nombres avec séparateurs de milliers
function formatNumber(number, decimals = 0) {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number);
}

// Fonction pour mettre en surbrillance le texte recherché
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Fonction pour initialiser les tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Fonction pour initialiser les popovers
document.addEventListener('DOMContentLoaded', function() {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});

// Fonction pour initialiser les toasts
document.addEventListener('DOMContentLoaded', function() {
    const toastElList = [].slice.call(document.querySelectorAll('.toast'));
    toastElList.map(function (toastEl) {
        return new bootstrap.Toast(toastEl, { autohide: true });
    });
});

// Fonction pour initialiser les modales
document.addEventListener('DOMContentLoaded', function() {
    const modalElList = [].slice.call(document.querySelectorAll('.modal'));
    modalElList.map(function (modalEl) {
        return new bootstrap.Modal(modalEl);
    });
});

// Fonction pour initialiser les onglets
function initializeTabs() {
    try {
        // Vérifier que Bootstrap est disponible
        if (typeof bootstrap === 'undefined' || !bootstrap.Tab) {
            console.warn('Bootstrap Tab n\'est pas disponible');
            return;
        }

        // Sélectionner tous les boutons d'onglets
        const tabElements = document.querySelectorAll('button[data-bs-toggle="tab"], a[data-bs-toggle="tab"]');
        
        // Ajouter les écouteurs d'événements
        tabElements.forEach(tabEl => {
            try {
                // Vérifier si l'élément existe et a un attribut data-bs-target
                if (!tabEl || !tabEl.getAttribute('data-bs-target')) {
                    return;
                }
                
                // Ajouter l'écouteur d'événement pour sauvegarder l'onglet actif
                tabEl.addEventListener('shown.bs.tab', function(event) {
                    try {
                        const target = event.target.getAttribute('data-bs-target');
                        if (target) {
                            localStorage.setItem('lastActiveTab', target);
                        }
                    } catch (e) {
                        console.error('Erreur lors de la sauvegarde de l\'onglet actif:', e);
                    }
                });
                
                // Activer l'onglet sauvegardé si c'est le bon
                const lastActiveTab = localStorage.getItem('lastActiveTab');
                if (lastActiveTab && tabEl.getAttribute('data-bs-target') === lastActiveTab) {
                    try {
                        const tab = new bootstrap.Tab(tabEl);
                        if (typeof tab.show === 'function') {
                            tab.show();
                        }
                    } catch (e) {
                        console.error('Erreur lors de l\'activation de l\'onglet:', e);
                    }
                }
            } catch (e) {
                console.error('Erreur lors de l\'initialisation d\'un onglet:', e);
            }
        });
    } catch (e) {
        console.error('Erreur critique dans l\'initialisation des onglets:', e);
    }
}

// Appeler la fonction d'initialisation lorsque le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTabs);
} else {
    // Le DOM est déjà chargé
    setTimeout(initializeTabs, 0);
}

// Fonction pour initialiser les collapse
document.addEventListener('DOMContentLoaded', function() {
    const collapseElementList = [].slice.call(document.querySelectorAll('.collapse'));
    collapseElementList.map(function (collapseEl) {
        return new bootstrap.Collapse(collapseEl, {
            toggle: false
        });
    });
});

// Fonction pour initialiser les dropdowns
document.addEventListener('DOMContentLoaded', function() {
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
    });
});

// Fonction pour initialiser les carousels
document.addEventListener('DOMContentLoaded', function() {
    const carouselElementList = [].slice.call(document.querySelectorAll('.carousel'));
    carouselElementList.map(function (carouselEl) {
        return new bootstrap.Carousel(carouselEl, {
            interval: 5000,
            touch: true
        });
    });
});

// Fonction pour initialiser les offcanvas
document.addEventListener('DOMContentLoaded', function() {
    const offcanvasElementList = [].slice.call(document.querySelectorAll('.offcanvas'));
    offcanvasElementList.map(function (offcanvasEl) {
        return new bootstrap.Offcanvas(offcanvasEl);
    });
});

// Fonction pour initialiser les tooltips avec options avancées
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover focus', // Afficher au survol et au focus
            placement: 'top', // Position par défaut
            delay: { show: 500, hide: 100 }, // Délais d'affichage/masquage
            html: true, // Permettre le HTML dans le contenu
            container: 'body' // Pour éviter les problèmes de débordement
        });
    });
});

// Fonction pour initialiser les popovers avec options avancées
document.addEventListener('DOMContentLoaded', function() {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl, {
            trigger: 'focus', // Afficher au focus
            placement: 'right', // Position par défaut
            html: true, // Permettre le HTML dans le contenu
            container: 'body' // Pour éviter les problèmes de débordement
        });
    });
});

// Fonction pour initialiser les toasts avec options avancées
document.addEventListener('DOMContentLoaded', function() {
    const toastElList = [].slice.call(document.querySelectorAll('.toast'));
    toastElList.map(function (toastEl) {
        return new bootstrap.Toast(toastEl, {
            animation: true,
            autohide: true,
            delay: 5000
        });
    });
});

// Fonction pour initialiser les modales avec options avancées
document.addEventListener('DOMContentLoaded', function() {
    const modalElList = [].slice.call(document.querySelectorAll('.modal'));
    modalElList.map(function (modalEl) {
        return new bootstrap.Modal(modalEl, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
    });
});

// Fonction pour initialiser les collapse avec options avancées
document.addEventListener('DOMContentLoaded', function() {
    const collapseElementList = [].slice.call(document.querySelectorAll('.collapse'));
    collapseElementList.map(function (collapseEl) {
        return new bootstrap.Collapse(collapseEl, {
            toggle: false,
            parent: null
        });
    });
});

// Fonction pour initialiser les dropdowns avec options avancées
document.addEventListener('DOMContentLoaded', function() {
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl, {
            offset: [0, 2],
            flip: true,
            boundary: 'scrollParent',
            reference: 'toggle',
            display: 'dynamic'
        });
    });
});

// Fonction pour initialiser les carousels avec options avancées
document.addEventListener('DOMContentLoaded', function() {
    const carouselElementList = [].slice.call(document.querySelectorAll('.carousel'));
    carouselElementList.map(function (carouselEl) {
        return new bootstrap.Carousel(carouselEl, {
            interval: 5000,
            keyboard: true,
            pause: 'hover',
            ride: 'carousel',
            wrap: true,
            touch: true
        });
    });
});

// Fonction pour initialiser les offcanvas avec options avancées
document.addEventListener('DOMContentLoaded', function() {
    const offcanvasElementList = [].slice.call(document.querySelectorAll('.offcanvas'));
    offcanvasElementList.map(function (offcanvasEl) {
        return new bootstrap.Offcanvas(offcanvasEl, {
            backdrop: true,
            keyboard: true,
            scroll: false
        });
    });
});
