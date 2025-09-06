// Fonction pour afficher l'aperçu de l'image sélectionnée
function previewImage(input) {
    const preview = document.getElementById('photoPreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Photo du véhicule" class="img-fluid" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Initialisation de l'application lorsque le DOM est chargé
console.log('Début du chargement du script vehicules.js');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM entièrement chargé et analysé');
    
    // Initialisation des variables
    let vehicules = JSON.parse(localStorage.getItem('vehicules')) || [];
    let currentVehiculeId = null;
    
    console.log('Véhicules chargés depuis le localStorage:', vehicules.length);
    
    // Initialisation des modales Bootstrap
    let vehiculeModal = null;
    let deleteModal = null;
    
    // Récupération des éléments du DOM
    console.log('Récupération des éléments du DOM...');
    const vehiculeForm = document.getElementById('vehiculeForm');
    console.log('Formulaire trouvé:', !!vehiculeForm);
    
    const vehiculeTable = document.getElementById('vehiculeTable')?.getElementsByTagName('tbody')[0];
    console.log('Tableau des véhicules trouvé:', !!vehiculeTable);
    const searchInput = document.getElementById('searchVehicule');
    const filterStatus = document.getElementById('filterStatus');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    
    // Éléments des statistiques
    const totalVehiculesEl = document.getElementById('totalVehicules');
    const vehiculesActifsEl = document.getElementById('vehiculesActifs');
    const vehiculesInactifsEl = document.getElementById('vehiculesInactifs');
    const vehiculesMaintenanceEl = document.getElementById('vehiculesMaintenance');
    
    // Initialisation de Select2 pour les champs de sélection
    $(document).ready(function() {
        $('.select2').select2({
            theme: 'bootstrap-5',
            width: '100%',
            placeholder: 'Sélectionner...',
            allowClear: true
        });
    });
    
    // Gestion de la prévisualisation de l'image
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    let photoBase64 = '';
    
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoBase64 = e.target.result;
                photoPreview.innerHTML = `<img src="${photoBase64}" alt="Prévisualisation">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Fonction pour afficher une notification toast
    function showToast(message, type = 'success') {
        // Créer le conteneur de notifications s'il n'existe pas
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.style.position = 'fixed';
            toastContainer.style.top = '20px';
            toastContainer.style.right = '20px';
            toastContainer.style.zIndex = '1100';
            document.body.appendChild(toastContainer);
        }
        
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
        toast.role = 'alert';
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Supprimer la notification après 5 secondes
        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                toastElement.remove();
            }
        }, 5000);
    }
    
    // Fonction pour générer un ID unique
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Fonction pour formater la date au format français
    function formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    }
    
    // Fonction pour afficher le tableau des véhicules
    function renderVehiculeTable(vehiculesToRender = vehicules) {
        vehiculeTable.innerHTML = '';
        
        if (vehiculesToRender.length === 0) {
            vehiculeTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="text-muted">
                            <i class="ph ph-truck" style="font-size: 2rem;"></i>
                            <p class="mt-2 mb-0">Aucun véhicule trouvé</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        vehiculesToRender.forEach(vehicule => {
            const row = document.createElement('tr');
            row.className = 'vehicule-row';
            row.setAttribute('data-id', vehicule.id);
            
            // Déterminer la classe de statut
            let statusClass = '';
            let statusText = '';
            let statusIcon = '';
            
            switch(vehicule.statut) {
                case 'actif':
                    statusClass = 'status-active';
                    statusText = 'Actif';
                    statusIcon = 'ph-check-circle';
                    break;
                case 'inactif':
                    statusClass = 'status-inactive';
                    statusText = 'Inactif';
                    statusIcon = 'ph-x-circle';
                    break;
                case 'maintenance':
                    statusClass = 'status-maintenance';
                    statusText = 'Maintenance';
                    statusIcon = 'ph-wrench';
                    break;
            }
            
            row.innerHTML = `
                <td>
                    <div class="vehicule-photo">
                        ${vehicule.photo ? 
                            `<img src="${vehicule.photo}" alt="${vehicule.marque} ${vehicule.modele}">` : 
                            `<i class="ph ph-truck"></i>`}
                    </div>
                </td>
                <td>${vehicule.matricule}</td>
                <td>${vehicule.marque} ${vehicule.modele}</td>
                <td>${vehicule.typeVehicule || '-'}</td>
                <td>${vehicule.chauffeur || '-'}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        <i class="ph ${statusIcon}"></i> ${statusText}
                    </span>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-primary btn-action edit-vehicule" data-id="${vehicule.id}" title="Modifier">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action delete-vehicule" data-id="${vehicule.id}" title="Supprimer">
                        <i class="ph ph-trash-simple"></i>
                    </button>
                </td>
            `;
            
            vehiculeTable.appendChild(row);
        });
        
        // Ajouter les écouteurs d'événements pour les boutons d'édition et de suppression
        document.querySelectorAll('.edit-vehicule').forEach(btn => {
            btn.addEventListener('click', () => editVehicule(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-vehicule').forEach(btn => {
            btn.addEventListener('click', () => showDeleteModal(btn.dataset.id));
        });
    }
    
    // Fonction pour mettre à jour les statistiques
    function updateStats() {
        const total = vehicules.length;
        const actifs = vehicules.filter(v => v.statut === 'actif').length;
        const inactifs = vehicules.filter(v => v.statut === 'inactif').length;
        const maintenance = vehicules.filter(v => v.statut === 'maintenance').length;
        
        totalVehiculesEl.textContent = total;
        vehiculesActifsEl.textContent = actifs;
        vehiculesInactifsEl.textContent = inactifs;
        vehiculesMaintenanceEl.textContent = maintenance;
    }
    
    // Fonction pour filtrer les véhicules
    function filterVehicules() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = filterStatus.value;
        
        let filtered = [...vehicules];
        
        // Filtre par recherche
        if (searchTerm) {
            filtered = filtered.filter(vehicule => 
                vehicule.matricule.toLowerCase().includes(searchTerm) ||
                vehicule.marque.toLowerCase().includes(searchTerm) ||
                (vehicule.modele && vehicule.modele.toLowerCase().includes(searchTerm)) ||
                (vehicule.chauffeur && vehicule.chauffeur.toLowerCase().includes(searchTerm))
            );
        }
        
        // Filtre par statut
        if (statusFilter) {
            filtered = filtered.filter(vehicule => vehicule.statut === statusFilter);
        }
        
        renderVehiculeTable(filtered);
    }
    
    // Fonction pour réinitialiser les filtres
    function resetFilters() {
        searchInput.value = '';
        filterStatus.value = '';
        renderVehiculeTable(vehicules);
    }
    
    // Fonction pour afficher le formulaire d'édition
    function editVehicule(id) {
        const vehicule = vehicules.find(v => v.id === id);
        if (!vehicule) return;
        
        currentVehiculeId = id;
        
        // Mettre à jour le titre du modal
        document.getElementById('modalTitle').textContent = 'Modifier le véhicule';
        
        // Remplir le formulaire avec les données du véhicule
        document.getElementById('vehiculeId').value = vehicule.id;
        document.getElementById('matricule').value = vehicule.matricule || '';
        document.getElementById('marque').value = vehicule.marque || '';
        document.getElementById('modele').value = vehicule.modele || '';
        document.getElementById('typeVehicule').value = vehicule.typeVehicule || '';
        document.getElementById('annee').value = vehicule.annee || '';
        document.getElementById('couleur').value = vehicule.couleur || '';
        document.getElementById('nombrePlaces').value = vehicule.nombrePlaces || '';
        document.getElementById('numeroChassis').value = vehicule.numeroChassis || '';
        document.getElementById('statut').value = vehicule.statut || 'actif';
        document.getElementById('kilometrage').value = vehicule.kilometrage || '';
        document.getElementById('dateDernierControle').value = vehicule.dateDernierControle || '';
        document.getElementById('notes').value = vehicule.notes || '';
        
        // Mettre à jour la prévisualisation de la photo
        if (vehicule.photo) {
            photoBase64 = vehicule.photo;
            photoPreview.innerHTML = `<img src="${vehicule.photo}" alt="Prévisualisation">`;
        } else {
            photoBase64 = '';
            photoPreview.innerHTML = '<i class="ph ph-truck"></i>';
        }
        
        // Afficher le modal
        if (vehiculeModal) {
            vehiculeModal.show();
        }
    }
    
    // Fonction pour afficher la modal de confirmation de suppression
    function showDeleteModal(id) {
        currentVehiculeId = id;
        if (deleteModal) {
            deleteModal.show();
        }
    }
    
    // Fonction pour confirmer la suppression
    function confirmDelete() {
        if (!currentVehiculeId) return;
        
        vehicules = vehicules.filter(vehicule => vehicule.id !== currentVehiculeId);
        localStorage.setItem('vehicules', JSON.stringify(vehicules));
        
        renderVehiculeTable();
        updateStats();
        
        deleteModal.hide();
        showToast('Véhicule supprimé avec succès', 'success');
        
        currentVehiculeId = null;
    }
    
    // Gestion de la soumission du formulaire
    console.log('Ajout du gestionnaire d\'événements submit au formulaire');
    vehiculeForm.addEventListener('submit', function(e) {
        console.log('Soumission du formulaire détectée');
        e.preventDefault();
        
        const id = document.getElementById('vehiculeId').value || generateId();
        const matricule = document.getElementById('matricule').value.trim();
        const marque = document.getElementById('marque').value.trim();
        const modele = document.getElementById('modele').value.trim();
        
        // Validation des champs obligatoires
        if (!matricule || !marque || !modele) {
            showToast('Veuillez remplir tous les champs obligatoires', 'danger');
            return;
        }
        
        // Création ou mise à jour du véhicule
        // Fonction utilitaire pour obtenir la valeur d'un champ en toute sécurité
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };

        const vehiculeData = {
            id,
            photo: photoBase64,
            matricule,
            marque,
            modele,
            typeVehicule: getValue('typeVehicule'),
            annee: getValue('annee'),
            couleur: getValue('couleur'),
            nombrePlaces: getValue('nombrePlaces') || 0,
            numeroChassis: getValue('numeroChassis'),
            statut: getValue('statut') || 'actif',
            kilometrage: getValue('kilometrage') || 0,
            dateDernierControle: getValue('dateDernierControle'),
            chauffeur: getValue('chauffeurAssigné'),
            notes: getValue('notes'),
            dateMaj: new Date().toISOString()
        };
        
        console.log('Données du véhicule à enregistrer:', vehiculeData);
        
        // Vérifier si c'est une création ou une mise à jour
        const existingIndex = vehicules.findIndex(v => v.id === id);
        
        if (existingIndex >= 0) {
            // Mise à jour
            vehicules[existingIndex] = vehiculeData;
            showToast('Véhicule mis à jour avec succès', 'success');
        } else {
            // Nouveau véhicule
            vehicules.push(vehiculeData);
            showToast('Véhicule ajouté avec succès', 'success');
        }
        
        // Sauvegarder dans le localStorage
        localStorage.setItem('vehicules', JSON.stringify(vehicules));
        
        // Mettre à jour l'affichage
        renderVehiculeTable();
        updateStats();
        
        // Fermer le modal et réinitialiser le formulaire
        if (vehiculeModal) {
            vehiculeModal.hide();
        }
        vehiculeForm.reset();
        photoBase64 = '';
        photoPreview.innerHTML = '<i class="ph ph-truck"></i>';
        currentVehiculeId = null;
    });
    
    // Initialisation des modaux Bootstrap
    function initializeModals() {
        console.log('Initialisation des modaux...');
        
        // Initialisation de la modal de formulaire
        const modalElement = document.getElementById('vehiculeModal');
        console.log('Élément modal trouvé:', !!modalElement);
        
        if (modalElement) {
            vehiculeModal = new bootstrap.Modal(modalElement);
            console.log('Modal initialisée avec succès');
            
            // Gestion de la fermeture du modal
            modalElement.addEventListener('hidden.bs.modal', function () {
                console.log('Modal fermée, réinitialisation du formulaire');
                if (vehiculeForm) {
                    vehiculeForm.reset();
                    // Réinitialiser les champs spécifiques si nécessaire
                    document.getElementById('vehiculeId').value = '';
                    document.getElementById('photo').value = '';
                }
                photoBase64 = '';
                if (photoPreview) photoPreview.innerHTML = '<i class="ph ph-truck"></i>';
                currentVehiculeId = null;
                
                const modalTitle = document.getElementById('modalTitle');
                if (modalTitle) modalTitle.textContent = 'Ajouter un véhicule';
            });
            
            // Gestion de l'affichage du modal
            modalElement.addEventListener('show.bs.modal', function () {
                console.log('Affichage de la modal');
            });
        }
        
        const deleteModalElement = document.getElementById('deleteModal');
        if (deleteModalElement) {
            deleteModal = new bootstrap.Modal(deleteModalElement);
        }
    }
    
        // La gestion de l'ouverture de la modal est maintenant gérée directement par l'attribut data-bs-toggle
    
    // Initialisation des modaux après un court délai pour s'assurer que le DOM est prêt
    console.log('Démarrage du délai d\'initialisation des modaux');
    setTimeout(function() {
        console.log('Exécution de l\'initialisation des modaux après délai');
        initializeModals();
    }, 1000);
    
    // Rendre le tableau et mettre à jour les statistiques
    renderVehiculeTable();
    updateStats();
    
    // Le bouton utilise maintenant directement data-bs-toggle pour la modal
    
    console.log('Initialisation terminée');
});
