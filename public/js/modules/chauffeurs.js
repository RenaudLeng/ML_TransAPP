// Gestionnaire d'erreurs global
window.onerror = function(message, source, lineno, colno, error) {
  console.error('ERREUR GLOBALE:', {
    message: message,
    source: source,
    line: lineno,
    column: colno,
    error: error
  });
  return true; // Empêche le gestionnaire d'erreurs par défaut
};

// Message de débogage pour vérifier le chargement du fichier
console.log('=== CHARGEMENT DE CHAUFFEURS.JS ===');

// Données des chauffeurs
let chauffeurs = [];
let editId = null;
let photoBase64 = '';

// Références aux éléments du DOM
let chauffeurTable;
let chauffeurForm;
let searchInput;
let totalChauffeurs;
let chauffeursActifs;
let chauffeursConges;

// Initialiser les références aux éléments du DOM
function initDOMReferences() {
  console.log('=== DÉBUT INITIALISATION DES RÉFÉRENCES DOM ===');
  
  // Réinitialiser toutes les références
  chauffeurTable = null;
  chauffeurForm = null;
  searchInput = null;
  totalChauffeurs = null;
  chauffeursActifs = null;
  chauffeursConges = null;
  
  // Récupérer les éléments un par un avec gestion des erreurs
  try {
    console.log('Recherche de l\'élément chauffeurTable...');
    chauffeurTable = document.getElementById('chauffeurTable');
    console.log('chauffeurTable:', chauffeurTable ? 'Trouvé' : 'NON TROUVÉ');
    
    console.log('Recherche de l\'élément chauffeurForm...');
    chauffeurForm = document.getElementById('chauffeurForm');
    console.log('chauffeurForm:', chauffeurForm ? 'Trouvé' : 'NON TROUVÉ');
    
    console.log('Recherche de l\'élément searchInput...');
    searchInput = document.getElementById('searchInput');
    console.log('searchInput:', searchInput ? 'Trouvé' : 'NON TROUVÉ');
    
    // Récupérer les éléments des compteurs
    console.log('Recherche des éléments des compteurs...');
    totalChauffeurs = document.getElementById('totalChauffeurs');
    console.log('totalChauffeurs:', totalChauffeurs ? 'Trouvé' : 'NON TROUVÉ', 
               'ID:', totalChauffeurs ? totalChauffeurs.id : 'N/A',
               'Valeur actuelle:', totalChauffeurs ? totalChauffeurs.textContent : 'N/A');
    
    chauffeursActifs = document.getElementById('chauffeursActifs');
    console.log('chauffeursActifs:', chauffeursActifs ? 'Trouvé' : 'NON TROUVÉ',
               'ID:', chauffeursActifs ? chauffeursActifs.id : 'N/A',
               'Valeur actuelle:', chauffeursActifs ? chauffeursActifs.textContent : 'N/A');
    
    chauffeursConges = document.getElementById('chauffeursConges');
    console.log('chauffeursConges:', chauffeursConges ? 'Trouvé' : 'NON TROUVÉ',
               'ID:', chauffeursConges ? chauffeursConges.id : 'N/A',
               'Valeur actuelle:', chauffeursConges ? chauffeursConges.textContent : 'N/A');
    
    // Vérifier si les éléments critiques existent
    if (!chauffeurTable) console.error('ERREUR: Élément chauffeurTable non trouvé');
    if (!chauffeurForm) console.error('ERREUR: Formulaire de chauffeur non trouvé');
    
    // Vérifier les éléments des compteurs
    if (!totalChauffeurs) console.error('ERREUR: Élément totalChauffeurs non trouvé');
    if (!chauffeursActifs) console.error('ERREUR: Élément chauffeursActifs non trouvé');
    if (!chauffeursConges) console.error('ERREUR: Élément chauffeursConges non trouvé');
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des références DOM:', error);
  }
  
  console.log('=== FIN INITIALISATION DES RÉFÉRENCES DOM ===');
  
  // Retourner true si tous les éléments critiques sont trouvés
  return chauffeurTable !== null && chauffeurForm !== null && 
         totalChauffeurs !== null && chauffeursActifs !== null && 
         chauffeursConges !== null;
}

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log('=== DÉMARRAGE DE L\'APPLICATION ===');
  console.log('=== VÉRIFICATION DU LOCALSTORAGE ===');
  console.log('localStorage disponible:', typeof localStorage !== 'undefined');
  if (typeof localStorage !== 'undefined') {
    console.log('Clés dans le localStorage:', Object.keys(localStorage));
  }
  
  // Initialiser les références aux éléments du DOM
  console.log('Initialisation des références DOM...');
  initDOMReferences();
  
  // Vérifier les éléments DOM des compteurs
  console.log('=== VÉRIFICATION DES ÉLÉMENTS DOM DES COMPTEURS ===');
  console.log('totalChauffeurs:', document.getElementById('totalChauffeurs') ? 'Trouvé' : 'Non trouvé');
  console.log('chauffeursActifs:', document.getElementById('chauffeursActifs') ? 'Trouvé' : 'Non trouvé');
  console.log('chauffeursConges:', document.getElementById('chauffeursConges') ? 'Trouvé' : 'Non trouvé');
  // Vérifier que les éléments critiques existent
  if (!chauffeurTable) console.error('ERREUR: Élément chauffeurTable non trouvé');
  if (!chauffeurForm) console.error('ERREUR: Formulaire de chauffeur non trouvé');
  
  // Initialiser les écouteurs d'événements
  console.log('Configuration des écouteurs d\'événements...');
  setupEventListeners();
  
  // Charger les données
  console.log('Chargement des données...');
  loadChauffeurs();
  loadVehicules();
  
  // Ajouter le bouton de réinitialisation
  console.log('Ajout du bouton de réinitialisation...');
  addResetButton();
  
  // Générer un matricule par défaut
  console.log('Génération d\'un matricule par défaut...');
  generateMatricule();
  
  console.log('=== INITIALISATION TERMINÉE ===');
  
  // Initialiser le format du numéro de téléphone
  const telephoneInput = document.getElementById('telephone');
  if (telephoneInput) {
    telephoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 0) {
        value = value.match(/(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})/);
        value = !value[2] ? value[1] : 
                value[1] + ' ' + value[2] + (value[3] ? ' ' + value[3] : '') + 
                (value[4] ? ' ' + value[4] : '') + (value[5] ? ' ' + value[5] : '');
      }
      e.target.value = value;
    });
  }
  
  // Gestion du téléchargement de la photo
  const photoInput = document.getElementById('photo');
  if (photoInput) {
    photoInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const photoPreview = document.getElementById('photoPreview');
          if (photoPreview) {
            photoPreview.innerHTML = `<img src="${event.target.result}" class="img-fluid rounded" style="max-height: 200px;">`;
          }
          photoBase64 = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

// Afficher une notification
function showNotification(message, type = 'info') {
  // Créer l'élément de notification s'il n'existe pas
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  // Définir les classes CSS en fonction du type de notification
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Afficher la notification
  notification.style.display = 'block';
  notification.style.opacity = '1';
  
  // Masquer la notification après 3 secondes
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 500);
  }, 3000);
}

// Charger la liste des véhicules disponibles
function loadVehicules() {
  const vehiculesSelect = document.getElementById('vehiculesAssignes');
  if (!vehiculesSelect) return;
  
  try {
    // Charger les véhicules depuis le stockage local
    const vehicules = JSON.parse(localStorage.getItem('vehicules') || '[]');
    
    // Vider et recréer les options
    vehiculesSelect.innerHTML = '';
    
    // Ajouter chaque véhicule comme une option
    vehicules.forEach(vehicule => {
      if (vehicule && vehicule.id) { // Vérifier que le véhicule et son ID existent
        const vehiculeId = vehicule.id;
        const marque = vehicule.marque || 'Marque inconnue';
        const modele = vehicule.modele || '';
        const immatriculation = vehicule.immatriculation || 'N/A';
        const vehiculeText = `${marque} ${modele} (${immatriculation})`.trim();
        
        const option = document.createElement('option');
        option.value = vehiculeId;
        option.textContent = vehiculeText;
        vehiculesSelect.appendChild(option);
      }
    });
    
    // Initialiser les sélecteurs multiples avec du JavaScript natif
    if (vehiculesSelect) {
      // Ajouter une classe pour le style si nécessaire
      vehiculesSelect.classList.add('form-select');
      vehiculesSelect.multiple = true;
      
      // Ajouter un placeholder si nécessaire
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.disabled = true;
      placeholder.selected = true;
      placeholder.hidden = true;
      placeholder.textContent = 'Sélectionnez les véhicules';
      vehiculesSelect.insertBefore(placeholder, vehiculesSelect.firstChild);
    }
    
  } catch (error) {
    // Erreur silencieuse lors du chargement des véhicules
  }
}

// Sauvegarder les chauffeurs dans le localStorage
function saveChauffeurs() {
  console.log('=== DÉBUT saveChauffeurs ===');
  console.log('Contenu actuel de chauffeurs:', JSON.stringify(chauffeurs, null, 2));
  try {
    // Vérifier que la variable chauffeurs est un tableau
    if (!Array.isArray(chauffeurs)) {
      console.error('ERREUR: chauffeurs n\'est pas un tableau');
      console.error('Type de chauffeurs:', typeof chauffeurs);
      console.error('Valeur de chauffeurs:', chauffeurs);
      return false;
    }
    
    // Vérifier que le localStorage est disponible
    if (typeof localStorage === 'undefined') {
      console.error('ERREUR: localStorage n\'est pas disponible');
      return false;
    }
    console.log('Nombre de chauffeurs à sauvegarder:', chauffeurs.length);
    console.log('Données des chauffeurs:', JSON.stringify(chauffeurs, null, 2));
    
    // Créer une copie des données à sauvegarder
    const dataToSave = chauffeurs.map(chauffeur => {
      const { id, nom, prenom, email, telephone, permis, dateNaissance, dateEmbauche, 
              statut, adresse, commentaires, vehiculeAssigne, vehicules, dateCreation, dateModification, photo } = chauffeur;
      
      return {
        id: id || `chauffeur-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nom: nom || '',
        prenom: prenom || '',
        email: email || '',
        telephone: telephone || '',
        permis: permis || '',
        dateNaissance: dateNaissance || '',
        dateEmbauche: dateEmbauche || new Date().toISOString().split('T')[0],
        statut: statut || 'actif',
        adresse: adresse || '',
        commentaires: commentaires || '',
        vehiculeAssigne: vehiculeAssigne || '',
        vehicules: Array.isArray(vehicules) ? vehicules : [],
        dateCreation: dateCreation || new Date().toISOString(),
        dateModification: dateModification || new Date().toISOString(),
        photo: photo || ''
      };
    });
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('chauffeurs', JSON.stringify(dataToSave));
    return true;
    
  } catch (error) {
    // Erreur lors de la sauvegarde
    showNotification('Erreur lors de la sauvegarde des données des chauffeurs', 'error');
    return false;
  }
}

// Mettre à jour les compteurs
function updateCounters() {
  console.log('=== DÉBUT updateCounters ===');
  
  // Vérifier que les références aux éléments existent
  if (!totalChauffeurs || !chauffeursActifs || !chauffeursConges) {
    console.error('ERREUR: Références aux éléments de compteurs manquantes');
    console.log('totalChauffeurs:', totalChauffeurs ? 'OK' : 'Manquant');
    console.log('chauffeursActifs:', chauffeursActifs ? 'OK' : 'Manquant');
    console.log('chauffeursConges:', chauffeursConges ? 'OK' : 'Manquant');
    return;
  }
  
  try {
    // Mettre à jour le nombre total de chauffeurs
    const total = Array.isArray(chauffeurs) ? chauffeurs.length : 0;
    console.log('Nombre total de chauffeurs:', total);
    totalChauffeurs.textContent = total;
    
    // Mettre à jour le nombre de chauffeurs actifs
    const activeCount = Array.isArray(chauffeurs) ? 
      chauffeurs.filter(c => c && c.statut === 'actif').length : 0;
    console.log('Nombre de chauffeurs actifs:', activeCount);
    chauffeursActifs.textContent = activeCount;
    
    // Mettre à jour le nombre de chauffeurs en congé
    const congesCount = Array.isArray(chauffeurs) ? 
      chauffeurs.filter(c => c && c.statut === 'conge').length : 0;
    console.log('Nombre de chauffeurs en congé:', congesCount);
    chauffeursConges.textContent = congesCount;
    
  } catch (error) {
    console.error('ERREUR dans updateCounters:', error);
  }
  
  console.log('=== FIN updateCounters ===');
}

// Afficher les chauffeurs dans le tableau
function renderChauffeurs(filter = '') {
  console.log('=== DÉBUT renderChauffeurs ===');
  console.log('Filtre reçu:', filter);
  console.log('Nombre de chauffeurs à afficher:', chauffeurs ? chauffeurs.length : 0);
  
  // Vérifier que le tableau existe
  const tbody = document.querySelector('#chauffeurTable tbody');
  if (!tbody) {
    console.error('ERREUR: Élément tbody non trouvé dans le tableau des chauffeurs');
    console.log('Tentative de sélection avec document.querySelector(\'#chauffeurTable tbody\') a échoué');
    console.log('Contenu de document.body:', document.body ? 'Body existe' : 'Body est null/undefined');
    return;
  }
  
  console.log('Élément tbody trouvé avec succès');
  
  // Si pas de données, afficher le message par défaut
  if (!chauffeurs || !Array.isArray(chauffeurs) || chauffeurs.length === 0) {
    console.log('Aucun chauffeur à afficher');
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5">
          <div class="d-flex flex-column align-items-center">
            <i class="ph ph-users text-muted" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
            <h5 class="mb-2">Aucun chauffeur enregistré</h5>
            <p class="text-muted mb-0">Commencez par ajouter votre premier chauffeur</p>
            <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#chauffeurModal">
              <i class="ph ph-plus me-2"></i>Ajouter un chauffeur
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  // Filtrer les résultats si un filtre est appliqué
  let chauffeursFiltres = [...chauffeurs];
  
  if (filter) {
    const filtreMinuscule = filter.toLowerCase();
    chauffeursFiltres = chauffeurs.filter(c => 
      (c.nom && c.nom.toLowerCase().includes(filtreMinuscule)) ||
      (c.prenom && c.prenom.toLowerCase().includes(filtreMinuscule)) ||
      (c.telephone && c.telephone.includes(filter))
    );
  }
  
  // Si aucun résultat après filtrage
  if (chauffeursFiltres.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <i class="ph ph-magnifying-glass" style="font-size: 2rem; color: #6c757d;"></i>
          <p class="mt-2 mb-0">Aucun résultat trouvé</p>
          <button class="btn btn-sm btn-outline-primary mt-2" onclick="document.getElementById('searchInput').value='';renderChauffeurs();">
            Réinitialiser la recherche
          </button>
        </td>
      </tr>
    `;
    return;
  }

  // Afficher les résultats
  let html = '';
  
  chauffeursFiltres.forEach(chauffeur => {
    // Gérer les valeurs par défaut pour les champs manquants
    const prenom = chauffeur.prenom || '';
    const nom = chauffeur.nom || '';
    const nomComplet = (prenom + ' ' + nom).trim() || 'Chauffeur inconnu';
    const email = chauffeur.email || '';
    const telephone = chauffeur.telephone || '-';
    const permis = chauffeur.permis || '-';
    const vehiculeAssigne = chauffeur.vehiculeAssigne || 'Aucun véhicule assigné';
    
    // Gérer le statut
    const statusClass = {
      'actif': 'status-active',
      'inactif': 'status-inactive',
      'conge': 'status-warning',
      'maladie': 'status-danger'
    }[chauffeur.statut] || 'status-inactive';
    
    const statusText = {
      'actif': 'Actif',
      'inactif': 'Inactif',
      'conge': 'En congé',
      'maladie': 'Maladie'
    }[chauffeur.statut] || (chauffeur.statut || 'Inconnu');
    
    // Formatage de la date d'embauche (non utilisé pour le moment)
    // const dateEmbaucheFormatted = chauffeur.dateEmbauche ? 
    //   new Date(chauffeur.dateEmbauche).toLocaleDateString('fr-FR') : '-';
    
    html += `
      <tr>
        <td>
          <div class="avatar">
            <i class="ph ph-user"></i>
          </div>
        </td>
        <td>
          <div class="fw-semibold">${nomComplet}</div>
          ${email ? `<div class="text-muted small">${email}</div>` : ''}
        </td>
        <td>${telephone}</td>
        <td>${permis}</td>
        <td>${chauffeur.vehiculeAssigne || 'Aucun véhicule assigné'}</td>
        <td>
          <span class="status-badge ${statusClass}">
            ${statusText}
          </span>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary btn-action me-1" onclick="editChauffeur('${chauffeur.id}')" title="Modifier">
            <i class="ph ph-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteChauffeur('${chauffeur.id}')" title="Supprimer">
            <i class="ph ph-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
  // Recherche
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderChauffeurs(e.target.value);
    });
  }

  // Soumission du formulaire
  if (chauffeurForm) {
    chauffeurForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(chauffeurForm);
      const chauffeurData = {
        id: editId || Date.now().toString(),
        nom: formData.get('nom') || '',
        telephone: formData.get('telephone') || '',
        email: formData.get('email') || '',
        permis: formData.get('permis') || '',
        dateNaissance: formData.get('dateNaissance') || '',
        dateEmbauche: formData.get('dateEmbauche') || new Date().toISOString().split('T')[0],
        vehiculeAssigne: formData.get('vehiculeAssigne') || '',
        statut: formData.get('statut') || 'actif',
        adresse: formData.get('adresse') || '',
        commentaires: formData.get('commentaires') || '',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      };

      // Gérer la photo si elle est ajoutée
      const photoInput = document.getElementById('photo');
      if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          chauffeurData.photo = e.target.result;
          saveChauffeurData(chauffeurData);
        };
        reader.readAsDataURL(photoInput.files[0]);
      } else {
        saveChauffeurData(chauffeurData);
      }
    });
  }
}

// Sauvegarder les données du chauffeur
function saveChauffeurData(chauffeurData) {
  console.log('=== DÉBUT saveChauffeurData ===');
  console.log('Données reçues:', JSON.stringify(chauffeurData, null, 2));
  // Récupérer les véhicules sélectionnés
  const vehiculesSelect = document.getElementById('vehiculesAssignes');
  const selectedVehicles = Array.from(vehiculesSelect.selectedOptions).map(option => ({
    id: option.value,
    libelle: option.text
  }));
  
  // Préparer les données du chauffeur
  const chauffeurToSave = {
    ...chauffeurData,
    vehicules: selectedVehicles
  };

  // Si on est en mode édition
  if (editId !== null) {
    const index = chauffeurs.findIndex(c => c.id === editId);
    if (index !== -1) {
      console.log('Mise à jour du chauffeur existant:', editId, chauffeurToSave);
      chauffeurs[index] = { ...chauffeurs[index], ...chauffeurToSave };
      console.log('Chauffeur mis à jour avec succès. Nouvelle valeur:', chauffeurs[index]);
    } else {
      console.error('Erreur: Aucun chauffeur trouvé avec l\'ID', editId);
    }
  } else {
    // Ajout d'un nouveau chauffeur
    chauffeurToSave.id = 'chauffeur-' + Date.now();
    console.log('=== AJOUT D\'UN NOUVEAU CHAUFFEUR ===');
    console.log('Données du nouveau chauffeur:', chauffeurToSave);
    
    // Vérifier que chauffeurs est bien un tableau
    if (!Array.isArray(chauffeurs)) {
      console.error('ERREUR: chauffeurs n\'est pas un tableau. Type:', typeof chauffeurs);
      chauffeurs = [];
    }
    
    // Ajouter le nouveau chauffeur
    chauffeurs.push(chauffeurToSave);
    console.log('=== LISTE DES CHAUFFEURS APRÈS AJOUT ===');
    console.log('Nombre de chauffeurs:', chauffeurs.length);
    console.log('Contenu du tableau:', JSON.stringify(chauffeurs, null, 2));
  }
  
  saveChauffeurs();
  renderChauffeurs();
  
  // Fermer la modale
  const modal = bootstrap.Modal.getInstance(document.getElementById('chauffeurModal'));
  if (modal) modal.hide();
  
  // Afficher une notification
  showNotification(`Chauffeur ${editId ? 'mis à jour' : 'ajouté'} avec succès`, 'success');
  
  // Réinitialiser le formulaire
  resetForm();
}

// Générer un matricule unique pour un nouveau chauffeur
function generateMatricule(nom = '', prenom = '') {
  // Récupérer l'année en cours (2 derniers chiffres)
  const annee = new Date().getFullYear().toString().slice(-2);
  
  // Récupérer la première lettre du nom et du prénom (en majuscules)
  const initialeNom = (nom && nom.length > 0) ? nom.charAt(0).toUpperCase() : 'X';
  const initialePrenom = (prenom && prenom.length > 0) ? prenom.charAt(0).toUpperCase() : 'X';
  
  // Compter le nombre de chauffeurs existants pour l'incrément
  const count = (chauffeurs && Array.isArray(chauffeurs)) ? chauffeurs.length + 1 : 1;
  
  // Formater le numéro séquentiel avec 3 chiffres (001, 002, etc.)
  const numero = count.toString().padStart(3, '0');
  
  // Créer le matricule au format ML-AB24-001
  const matricule = `ML-${initialeNom}${initialePrenom}${annee}-${numero}`;
  
  // Mettre à jour le champ matricule dans le formulaire s'il existe
  const matriculeInput = document.getElementById('matricule');
  if (matriculeInput) {
    matriculeInput.value = matricule;
  }
  
  return matricule;
}

// Réinitialiser le formulaire
function resetForm() {
  if (chauffeurForm) {
    chauffeurForm.reset();
    editId = null;
    
    // Réinitialiser les champs spécifiques si nécessaire
    const matriculeInput = document.getElementById('matricule');
    if (matriculeInput) {
      matriculeInput.value = '';
    }
    
    // Réinitialiser les sélecteurs multiples
    const vehiculesSelect = document.getElementById('vehiculesAssignes');
    if (vehiculesSelect) {
      Array.from(vehiculesSelect.options).forEach(option => {
        option.selected = false;
      });
    }
    
    // Mettre à jour le bouton de soumission
    const submitBtn = document.querySelector('#chauffeurForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Ajouter le chauffeur';
    }
  }
  const form = document.getElementById('chauffeurForm');
  if (form) form.reset();
  
  // Réinitialiser les variables d'état
  editId = null;
  photoBase64 = '';
  
  // Réinitialiser l'aperçu de la photo
  const photoPreview = document.getElementById('photoPreview');
  if (photoPreview) {
    photoPreview.innerHTML = '<i class="ph ph-user text-muted" style="font-size: 2rem;"></i>';
  }
  
  // Réinitialiser la sélection des véhicules
  const vehiculesSelect = document.getElementById('vehiculesAssignes');
  if (vehiculesSelect) {
    Array.from(vehiculesSelect.options).forEach(option => {
      option.selected = false;
    });
  }
  
  // Fermer la modale si elle est ouverte
  const modalElement = document.getElementById('chauffeurModal');
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
      // Nettoyer le backdrop
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      // Réactiver le défilement de la page
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0';
    }
  }
  
  // Régénérer un nouveau matricule
  generateMatricule();
  
  // Remettre à jour le titre de la modale
  const modalTitle = document.getElementById('modalTitle');
  if (modalTitle) modalTitle.textContent = 'Ajouter un chauffeur';
}

// Éditer un chauffeur (fonction appelée directement depuis l'interface)
// eslint-disable-next-line no-unused-vars
function editChauffeur(id) {
  const chauffeur = chauffeurs.find(c => c.id === id);
  if (!chauffeur) return;
  
  // Mettre à jour le titre de la modale
  const modalTitle = document.getElementById('modalTitle');
  if (modalTitle) modalTitle.textContent = 'Modifier le chauffeur';
  
  // Remplir le formulaire avec les données du chauffeur
  Object.keys(chauffeur).forEach(key => {
    // Ne pas traiter les objets imbriqués ici
    if (key === 'vehicules' || key === 'photo') return;
    
    const input = document.getElementById(key);
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = chauffeur[key];
      } else if (input.type === 'date') {
        // Formater correctement les dates
        if (chauffeur[key]) {
          const date = new Date(chauffeur[key]);
          if (!isNaN(date.getTime())) {
            input.value = date.toISOString().split('T')[0];
          }
        }
      } else {
        input.value = chauffeur[key] || '';
      }
    }
  });
  
  // Gérer la photo
  if (chauffeur.photo) {
    photoBase64 = chauffeur.photo;
    const photoPreview = document.getElementById('photoPreview');
    if (photoPreview) {
      photoPreview.innerHTML = `<img src="${photoBase64}" alt="Photo du chauffeur" class="img-fluid rounded-circle" style="width: 100%; height: 100%; object-fit: cover;">`;
    }
  } else {
    // Réinitialiser l'aperçu de la photo s'il n'y en a pas
    const photoPreview = document.getElementById('photoPreview');
    if (photoPreview) {
      photoPreview.innerHTML = '<i class="ph ph-user text-muted" style="font-size: 2rem;"></i>';
    }
  }
  
  // Gérer les véhicules assignés
  if (chauffeur.vehicules && Array.isArray(chauffeur.vehicules)) {
    const vehiculesIds = chauffeur.vehicules.map(v => v.id);
    const vehiculesSelect = document.getElementById('vehiculesAssignes');
    
    if (vehiculesSelect) {
      // Sélectionner les options correspondant aux IDs des véhicules
      Array.from(vehiculesSelect.options).forEach(option => {
        option.selected = vehiculesIds.includes(option.value);
      });
    }
  }
  
  // Enregistrer l'ID en cours d'édition
  editId = id;
  
  // Afficher la modale
  const modalElement = document.getElementById('chauffeurModal');
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement, {
      backdrop: true,
      keyboard: true,
      focus: true
    });
    modal.show();
    
    // Afficher une notification
    showNotification('Modification en cours', 'info');
  }
}

// Charger les chauffeurs depuis le localStorage
function loadChauffeurs() {
  console.log('=== DÉBUT loadChauffeurs ===');
  console.log('=== ÉTAT INITIAL ===');
  console.log('Type de chauffeurs:', typeof chauffeurs);
  console.log('chauffeurs est un tableau?', Array.isArray(chauffeurs));
  console.log('Nombre de chauffeurs dans le tableau:', chauffeurs ? chauffeurs.length : 0);
  
  // Vérifier que le localStorage est disponible
  if (typeof localStorage === 'undefined') {
    console.error('ERREUR: localStorage n\'est pas disponible');
    showNotification('Le stockage local n\'est pas disponible', 'error');
    return;
  }
  
  try {
    // Afficher toutes les clés du localStorage pour le débogage
    console.log('=== LOCALSTORAGE ===');
    const allKeys = Object.keys(localStorage);
    console.log('Clés dans le localStorage:', allKeys);
    
    // Vérifier si la clé 'chauffeurs' existe
    let savedChauffeurs = localStorage.getItem('chauffeurs');
    console.log('Données brutes du localStorage (chauffeurs):', savedChauffeurs);
    
    // Si pas de données, initialiser avec des données de test
    if (!savedChauffeurs) {
      console.log('Aucune donnée trouvée, création des données de test');
      const sampleData = [
        {
          id: 'chauffeur-1',
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@example.com',
          telephone: '06 12 34 56 78',
          permis: 'B, D',
          statut: 'actif',
          vehiculeAssigne: 'AB-123-CD',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          id: 'chauffeur-2',
          nom: 'Martin',
          prenom: 'Sophie',
          email: 'sophie.martin@example.com',
          telephone: '06 23 45 67 89',
          permis: 'D, FIMO',
          statut: 'actif',
          vehiculeAssigne: 'EF-456-GH',
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        }
      ];
      
      console.log('Données de test créées:', sampleData);
      try {
        localStorage.setItem('chauffeurs', JSON.stringify(sampleData));
        savedChauffeurs = JSON.stringify(sampleData);
        console.log('Données de test enregistrées dans le localStorage');
      } catch (e) {
        console.error('Erreur lors de l\'enregistrement des données de test:', e);
        showNotification('Erreur lors de l\'initialisation des données', 'error');
        return;
      }
    }
    
    // Parser les données du localStorage
    console.log('Tentative de parsing des données...');
    let parsedData;
    try {
      parsedData = JSON.parse(savedChauffeurs);
      console.log('Données parsées avec succès. Type:', typeof parsedData);
      console.log('Est un tableau?', Array.isArray(parsedData));
      if (Array.isArray(parsedData)) {
        console.log('Nombre de chauffeurs dans les données:', parsedData.length);
      }
    } catch (e) {
      console.error('Erreur lors du parsing des données:', e);
      showNotification('Erreur lors de la lecture des données', 'error');
      return;
    }
    
    // Vérifier que c'est bien un tableau
    if (!Array.isArray(parsedData)) {
      console.error('Les données ne sont pas un tableau:', parsedData);
      chauffeurs = [];
      renderChauffeurs('');
      showNotification('Format de données invalide', 'error');
      return;
    }

    // Traiter chaque chauffeur
    chauffeurs = parsedData.map(chauffeur => {
      // Créer un nouvel objet avec des valeurs par défaut
      const processed = {
        id: chauffeur.id || `chauffeur-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nom: chauffeur.nom || '',
        prenom: chauffeur.prenom || '',
        email: chauffeur.email || '',
        telephone: chauffeur.telephone || '',
        permis: chauffeur.permis || chauffeur.numeroPermis || '',
        dateNaissance: chauffeur.dateNaissance || '',
        dateEmbauche: chauffeur.dateEmbauche || new Date().toISOString().split('T')[0],
        statut: chauffeur.statut || 'actif',
        adresse: chauffeur.adresse || '',
        commentaires: chauffeur.commentaires || '',
        vehiculeAssigne: chauffeur.vehiculeAssigne || '',
        vehicules: Array.isArray(chauffeur.vehicules) ? chauffeur.vehicules : [],
        dateCreation: chauffeur.dateCreation || new Date().toISOString(),
        dateModification: chauffeur.dateModification || new Date().toISOString(),
        photo: chauffeur.photo || ''
      };
      
      console.log('Chauffeur traité:', processed.id, processed.nom, processed.prenom);
      return processed;
    });
    
    // Sauvegarder les données mises à jour
    console.log('=== AVANT SAUVEGARDE ===');
    console.log('Nombre de chauffeurs:', chauffeurs.length);
    
    // Appel à saveChauffeurs pour s'assurer que les données sont bien sauvegardées
    console.log('Appel à saveChauffeurs()...');
    const saveResult = saveChauffeurs();
    console.log('Résultat de saveChauffeurs:', saveResult);
    
    // Vérifier que les données sont bien dans le localStorage
    const savedData = localStorage.getItem('chauffeurs');
    console.log('Données dans le localStorage après sauvegarde:', savedData ? 'Présentes' : 'Absentes');
    
    // Mettre à jour les compteurs
    updateCounters();
    
    // Afficher les données
    console.log('Appel à renderChauffeurs()...');
    renderChauffeurs('');
    
  } catch (error) {
    // Erreur lors du chargement
    console.error('Erreur dans loadChauffeurs:', error);
    showNotification('Erreur lors du chargement des données des chauffeurs', 'error');
    
    // En cas d'erreur, initialiser avec un tableau vide
    chauffeurs = [];
    renderChauffeurs('');
  }
}

// Fonction pour obtenir les véhicules assignés
function getVehiculesAssignes(vehiculesIds) {
  // Charger les véhicules complets depuis le stockage
  const allVehicules = JSON.parse(localStorage.getItem('vehicules') || '[]');
  
  // Filtrer les véhicules sélectionnés
  return allVehicules
    .filter(v => v && v.id && vehiculesIds.includes(v.id))
    .map(v => ({
      id: v.id,
      libelle: `${v.marque || ''} ${v.modele || ''} (${v.immatriculation || ''})`.trim()
    }));
}

// Fonction utilitaire pour réinitialiser les données de test
function resetSampleData() {
  if (confirm('Voulez-vous vraiment réinitialiser les données des chauffeurs avec des exemples ?')) {
    const sampleChauffeurs = [
      {
        id: 'chauffeur-1',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        telephone: '06 12 34 56 78',
        permis: '1234567890',
        dateNaissance: '1985-05-15',
        dateEmbauche: '2020-01-15',
        statut: 'actif',
        adresse: '1 rue des Champs-Élysées, 75008 Paris',
        commentaires: 'Chauffeur principal',
        vehiculeAssigne: 'AB-123-CD',
        vehicules: ['vehicule-1'],
        dateCreation: '2024-01-01T00:00:00.000Z',
        dateModification: '2024-01-01T00:00:00.000Z',
        photo: ''
      },
      {
        id: 'chauffeur-2',
        nom: 'Martin',
        prenom: 'Sophie',
        email: 'sophie.martin@example.com',
        telephone: '06 98 76 54 32',
        permis: '0987654321',
        dateNaissance: '1990-08-22',
        dateEmbauche: '2021-03-10',
        statut: 'conge',
        adresse: '15 avenue de la République, 75011 Paris',
        commentaires: 'En congé maladie',
        vehiculeAssigne: 'EF-456-GH',
        vehicules: ['vehicule-2'],
        dateCreation: '2024-01-01T00:00:00.000Z',
        dateModification: '2024-01-01T00:00:00.000Z',
        photo: ''
      }
    ];
    
    chauffeurs = sampleChauffeurs;
    saveChauffeurs();
    loadChauffeurs();
    showNotification('Données de test chargées avec succès', 'success');
  }
}

// Ajouter un bouton de réinitialisation dans l'interface
function addResetButton() {
  const header = document.querySelector('.container.mt-4 .d-flex.justify-content-between');
  if (header) {
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-sm btn-outline-warning';
    resetBtn.innerHTML = '<i class="ph ph-arrow-counter-clock me-1"></i> Données de test';
    resetBtn.onclick = resetSampleData;
    header.appendChild(resetBtn);
  }
}

// Fonction pour sauvegarder un chauffeur (non utilisée actuellement)
// eslint-disable-next-line no-unused-vars
function saveChauffeur(chauffeurData, isEdit = false) {
  const vehiculesSelect = document.getElementById('vehiculesAssignes');
  const vehiculesIds = vehiculesSelect ? 
    Array.from(vehiculesSelect.selectedOptions).map(option => option.value) : [];
  
  // Préparer les données du chauffeur
  const chauffeurToSave = {
    ...chauffeurData,
    vehicules: getVehiculesAssignes(vehiculesIds),
    dateModification: new Date().toISOString()
  };

  if (isEdit && editId) {
    // Mise à jour d'un chauffeur existant
    const index = chauffeurs.findIndex(c => c.id === editId);
    if (index !== -1) {
      chauffeurToSave.dateCreation = chauffeurs[index].dateCreation || new Date().toISOString();
      chauffeurs[index] = { ...chauffeurs[index], ...chauffeurToSave };
      return true;
    }
    return false;
  } else {
    // Ajout d'un nouveau chauffeur
    chauffeurToSave.id = 'chauffeur-' + Date.now();
    chauffeurToSave.dateCreation = new Date().toISOString();
    chauffeurs.push(chauffeurToSave);
    return true;
  }
}

// Gérer la soumission du formulaire
function handleSubmit(e) {
  e.preventDefault();
  
  // Récupérer les valeurs du formulaire
  const formData = new FormData(chauffeurForm);
  const chauffeurData = Object.fromEntries(formData.entries());
  
  // Validation des champs obligatoires
  if (!chauffeurData.nom || !chauffeurData.prenom || !chauffeurData.email) {
    showNotification('Veuillez remplir tous les champs obligatoires', 'error');
    return;
  }
  
  // Si c'est une modification
  if (editId) {
    updateChauffeur(editId, chauffeurData);
  } else {
    // Générer le matricule pour un nouveau chauffeur
    chauffeurData.matricule = generateMatricule(chauffeurData.nom, chauffeurData.prenom);
    chauffeurData.id = 'chauffeur-' + Date.now();
    chauffeurData.dateCreation = new Date().toISOString();
    addChauffeur(chauffeurData);
  }
}

// Ajouter l'écouteur d'événement si le formulaire existe
if (chauffeurForm) {
  chauffeurForm.addEventListener('submit', handleSubmit);
}

// Mettre à jour un chauffeur existant
function updateChauffeur(id, data) {
  const index = chauffeurs.findIndex(c => c.id === id);
  if (index !== -1) {
    // Conserver les données existantes non modifiées
    const existingData = chauffeurs[index];
    chauffeurs[index] = { ...existingData, ...data, dateModification: new Date().toISOString() };
    
    // Sauvegarder et rafraîchir l'affichage
    saveChauffeurs();
    renderChauffeurs(searchInput ? searchInput.value : '');
    
    // Fermer le modal et réinitialiser le formulaire
    const modal = bootstrap.Modal.getInstance(document.getElementById('chauffeurModal'));
    if (modal) modal.hide();
    resetForm();
    
    showNotification('Chauffeur mis à jour avec succès', 'success');
    return true;
  }
  return false;
}

// Ajouter un nouveau chauffeur
function addChauffeur(chauffeur) {
  console.log('=== DÉBUT addChauffeur ===');
  console.log('Données du chauffeur reçues:', JSON.stringify(chauffeur, null, 2));
  
  // Vérifier que chauffeurs est bien un tableau
  if (!Array.isArray(chauffeurs)) {
    console.error('ERREUR: La variable chauffeurs n\'est pas un tableau');
    console.error('Type de chauffeurs:', typeof chauffeurs);
    console.error('Valeur de chauffeurs:', chauffeurs);
    chauffeurs = [];
  }
  
  // Vérifier que le chauffeur a un ID
  if (!chauffeur.id) {
    console.log('Aucun ID fourni, génération d\'un nouvel ID');
    chauffeur.id = 'chauffeur-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  
  // Vérifier les données obligatoires
  if (!chauffeur.nom || !chauffeur.prenom) {
    console.error('ERREUR: Données obligatoires manquantes (nom et/ou prénom)');
    return false;
  }
  
  console.log('Ajout du chauffeur avec l\'ID:', chauffeur.id);
  
  // Ajouter le chauffeur au tableau
  chauffeurs.push(chauffeur);
  console.log('Chauffeur ajouté au tableau. Nouvelle taille:', chauffeurs.length);
  
  // Sauvegarder les données
  console.log('Appel à saveChauffeurs()...');
  const saveResult = saveChauffeurs();
  console.log('Résultat de saveChauffeurs():', saveResult);
  
  // Vérifier que les données ont bien été sauvegardées
  const savedData = localStorage.getItem('chauffeurs');
  console.log('Données dans le localStorage après sauvegarde:', savedData);
  console.log('Avant renderChauffeurs dans addChauffeur');
  renderChauffeurs(searchInput ? searchInput.value : '');
  
  // Fermer le modal et réinitialiser le formulaire
  console.log('Fermeture de la modale');
  const modal = bootstrap.Modal.getInstance(document.getElementById('chauffeurModal'));
  if (modal) {
    modal.hide();
    console.log('Modale fermée');
  } else {
    console.warn('Impossible de trouver la modale à fermer');
  }
  
  console.log('Réinitialisation du formulaire');
  resetForm();
  
  showNotification('Chauffeur ajouté avec succès', 'success');
  console.log('=== FIN addChauffeur ===');
  return chauffeur;
}

// Supprimer un chauffeur
window.deleteChauffeur = (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
    const index = chauffeurs.findIndex(c => c.id === id);
    if (index !== -1) {
      chauffeurs.splice(index, 1);
      saveChauffeurs();
      renderChauffeurs(searchInput ? searchInput.value : '');
    }
  }
};

// La fonction showNotification est déjà définie au début du fichier
