/**
 * Gestion de l'interface utilisateur pour l'historique des activités
 */

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si nous sommes sur la page des paramètres
    if (!document.getElementById('historyTable')) {
        return;
    }

    // Éléments du DOM
    const historyTableBody = document.getElementById('historyTableBody');
    const filterType = document.getElementById('filterType');
    const filterEntity = document.getElementById('filterEntity');
    const searchInput = document.getElementById('searchInput');
    const exportBtn = document.getElementById('exportBtn');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const paginationInfo = document.getElementById('paginationInfo');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    // État de la pagination
    let currentPage = 1;
    const itemsPerPage = 10;
    
    // Initialisation
    function init() {
        // Ajouter les écouteurs d'événements
        filterType?.addEventListener('change', handleFilterChange);
        filterEntity?.addEventListener('change', handleFilterChange);
        searchInput?.addEventListener('input', debounce(handleFilterChange, 300));
        exportBtn?.addEventListener('click', handleExport);
        prevPageBtn?.addEventListener('click', goToPreviousPage);
        nextPageBtn?.addEventListener('click', goToNextPage);
        clearHistoryBtn?.addEventListener('click', handleClearHistory);
        
        // Charger l'historique initial
        loadHistory();
    }
    
    // Charger l'historique avec les filtres actuels
    function loadHistory() {
        if (!historiqueManager) {
            console.error('Le gestionnaire d\'historique n\'est pas disponible');
            return;
        }
        
        const filters = getCurrentFilters();
        const { resultats, total, pages } = historiqueManager.getHistorique(filters);
        
        // Mettre à jour le tableau
        updateHistoryTable(resultats);
        
        // Mettre à jour la pagination
        updatePagination(total, pages);
    }
    
    // Mettre à jour le tableau d'historique
    function updateHistoryTable(entries) {
        if (!historyTableBody) return;
        
        historyTableBody.innerHTML = '';
        
        if (!entries || entries.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" class="text-center py-4">Aucune entrée d\'historique trouvée</td>';
            historyTableBody.appendChild(row);
            return;
        }
        
        entries.forEach(entry => {
            const row = document.createElement('tr');
            const date = new Date(entry.timestamp).toLocaleString('fr-FR');
            
            // Formater les données pour l'affichage
            const details = entry.donnees ? Object.entries(entry.donnees)
                .map(([key, value]) => {
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'object') {
                        return `<strong>${key}:</strong> ${JSON.stringify(value, null, 2)}`;
                    }
                    return `<strong>${key}:</strong> ${value}`;
                })
                .filter(Boolean)
                .join('<br>') : 'Aucun détail disponible';
            
            row.innerHTML = `
                <td>${date}</td>
                <td><span class="badge bg-${getBadgeColor(entry.type)}">${formatType(entry.type)}</span></td>
                <td>${formatEntity(entry.entite)}</td>
                <td>${entry.utilisateur || 'Système'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" 
                            data-bs-toggle="tooltip" 
                            data-bs-html="true"
                            data-bs-placement="left"
                            data-bs-title="${details.replace(/"/g, '&quot;')}">
                        <i class="bi bi-info-circle"></i> Détails
                    </button>
                </td>
            `;
            
            historyTableBody.appendChild(row);
        });
        
        // Initialiser les tooltips Bootstrap
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
    
    // Obtenir les filtres actuels
    function getCurrentFilters() {
        return {
            type: filterType?.value || undefined,
            entite: filterEntity?.value || undefined,
            recherche: searchInput?.value || undefined,
            page: currentPage,
            limit: itemsPerPage,
            triPar: 'timestamp',
            ordreTri: 'desc'
        };
    }
    
    // Mettre à jour la pagination
    function updatePagination(total, pages) {
        if (!paginationInfo || !prevPageBtn || !nextPageBtn) return;
        
        paginationInfo.textContent = `Affichage de ${((currentPage - 1) * itemsPerPage) + 1} à ${Math.min(currentPage * itemsPerPage, total)} sur ${total} entrées`;
        
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= pages;
    }
    
    // Gestionnaires d'événements
    function handleFilterChange() {
        currentPage = 1;
        loadHistory();
    }
    
    function handleExport() {
        if (!historiqueManager) return;
        
        const filters = getCurrentFilters();
        // Retirer la pagination pour l'export
        delete filters.page;
        delete filters.limit;
        
        historiqueManager.telechargerFichier('csv', 'historique_activites', filters);
    }
    
    function goToPreviousPage() {
        if (currentPage > 1) {
            currentPage--;
            loadHistory();
        }
    }
    
    function goToNextPage() {
        currentPage++;
        loadHistory();
    }
    
    function handleClearHistory() {
        if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ? Cette action est irréversible.')) {
            historiqueManager.viderHistorique();
            loadHistory();
            showToast('Historique effacé avec succès', 'success');
        }
    }
    
    // Fonctions utilitaires
    function formatType(type) {
        const types = {
            'creation': 'Création',
            'modification': 'Modification',
            'suppression': 'Suppression',
            'validation': 'Validation',
            'annulation': 'Annulation'
        };
        return types[type] || type;
    }
    
    function formatEntity(entity) {
        const entities = {
            'recette': 'Recette',
            'depense': 'Dépense',
            'utilisateur': 'Utilisateur',
            'bus': 'Bus',
            'categorie': 'Catégorie',
            'chauffeur': 'Chauffeur'
        };
        return entities[entity] || entity;
    }
    
    function getBadgeColor(type) {
        const colors = {
            'creation': 'success',
            'modification': 'primary',
            'suppression': 'danger',
            'validation': 'info',
            'annulation': 'warning'
        };
        return colors[type] || 'secondary';
    }
    
    function showToast(message, type = 'info') {
        // Implémentation basique de notification
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${type} border-0 show`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fermer"></button>
            </div>
        `;
        
        const toastContainer = document.createElement('div');
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1100';
        toastContainer.appendChild(toast);
        
        document.body.appendChild(toastContainer);
        
        // Supprimer la notification après 5 secondes
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toastContainer);
            }, 300);
        }, 5000);
    }
    
    // Fonction de debounce pour limiter les appels lors de la saisie
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Démarrer l'application
    init();
});
