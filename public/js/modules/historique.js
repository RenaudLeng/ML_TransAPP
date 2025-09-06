/**
 * Gestion de l'historique complet de l'application
 * Enregistre toutes les actions majeures effectuées dans l'application
 * 
 * Fonctionnalités :
 * - Enregistrement de tous les types d'actions (création, modification, suppression, connexion, etc.)
 * - Organisation par modules (Finance, Utilisateurs, Véhicules, Maintenance, etc.)
 * - Filtrage avancé par type, module, entité, date, utilisateur
 * - Recherche plein texte
 * - Exportation des données (JSON, CSV, Excel)
 * - Gestion des doublons et des entrées obsolètes
 */

// Vérifier si le module historique est déjà chargé
if (!window.ML_HISTORIQUE) {
    // Créer un espace de noms pour le module historique
    window.ML_HISTORIQUE = (function() {
        'use strict';
        
        // Vérifier si le code est exécuté dans un navigateur
        const isBrowser = typeof window !== 'undefined';

        // Constantes pour les modules de l'application
        if (!window.ML_HISTORIQUE_MODULES) {
        window.ML_HISTORIQUE_MODULES = {
            FINANCE: 'finance',
            UTILISATEURS: 'utilisateurs',
            VEHICULES: 'vehicules',
            MAINTENANCE: 'maintenance',
            PLANNING: 'planning',
            PARAMETRES: 'parametres'
        };
        }
        const MODULES = window.ML_HISTORIQUE_MODULES;

        // Types d'actions possibles
        if (!window.ML_HISTORIQUE_ACTIONS) {
        window.ML_HISTORIQUE_ACTIONS = {
            CREATION: 'creation',
            MODIFICATION: 'modification',
            SUPPRESSION: 'suppression',
            CONNEXION: 'connexion',
            DECONNEXION: 'deconnexion',
            VALIDATION: 'validation',
            ANNULATION: 'annulation',
            IMPORT: 'import',
            EXPORT: 'export',
            AUTRE: 'autre'
        };
        }
        const ACTIONS = window.ML_HISTORIQUE_ACTIONS;

        // Types d'entités
        if (!window.ML_HISTORIQUE_ENTITES) {
        window.ML_HISTORIQUE_ENTITES = {
            // Finance
            RECETTE: 'recette',
            DEPENSE: 'depense',
            // Utilisateurs
            UTILISATEUR: 'utilisateur',
            ROLE: 'role',
            // Véhicules
            VEHICULE: 'vehicule',
            MARQUE: 'marque',
            MODELE: 'modele',
    // Maintenance
    INTERVENTION: 'intervention',
    PIECE: 'piece',
    // Planning
    TRAJET: 'trajet',
    CHAUFFEUR: 'chauffeur',
    // Paramètres
    PARAMETRE: 'parametre',
    // Autres
    FICHIER: 'fichier',
    NOTIFICATION: 'notification'
};
}
const ENTITES = window.ML_HISTORIQUE_ENTITES;

class HistoriqueManager {
    constructor() {
        this.historique = this._chargerHistorique();
        this.maxEntries = 5000; // Augmentation du nombre maximum d'entrées
        this.cleanupInterval = 24 * 60 * 60 * 1000; // Nettoyage quotidien (24h)
        
        // Nettoyage automatique au démarrage
        this._nettoyerAnciennesEntrees();
        
        // Planifier le nettoyage périodique (uniquement dans un navigateur)
        if (typeof window !== 'undefined') {
            setInterval(() => this._nettoyerAnciennesEntrees(), this.cleanupInterval);
        }
    }

    /**
     * Charge l'historique depuis le localStorage avec vérification d'intégrité
     * @private
     */
    _chargerHistorique() {
        try {
            if (typeof localStorage !== 'undefined') {
                const historique = JSON.parse(localStorage.getItem('historiqueApp')) || [];
                // Vérifier que chaque entrée a les champs obligatoires
                return historique.filter(entree => {
                    return entree && entree.id && entree.type && entree.timestamp;
                });
            } else if (typeof module !== 'undefined' && module.exports) {
                // En environnement Node.js, on retourne un tableau vide
                return [];
            }
            return [];
        } catch (e) {
            console.error('Erreur lors du chargement de l\'historique:', e);
            return [];
        }
    }

    /**
     * Enregistre une nouvelle entrée dans l'historique
     * @param {string|object} options - Type d'action ou objet de configuration
     * @param {string} [options.type] - Type d'action (voir ACTIONS)
     * @param {string} [options.module] - Module concerné (voir MODULES)
     * @param {string} [options.entite] - Entité concernée (voir ENTITES)
     * @param {object} [options.donnees] - Données de l'entité
     * @param {string} [options.utilisateur] - Utilisateur effectuant l'action
     * @param {string} [options.commentaire] - Commentaire optionnel
     * @param {string} [options.idReference] - ID de référence pour regrouper les actions liées
     * @param {string} [entite] - Entité concernée (pour rétrocompatibilité)
     * @param {object} [donnees] - Données (pour rétrocompatibilité)
     * @param {string} [utilisateur] - Utilisateur (pour rétrocompatibilité)
     * @param {string} [commentaire] - Commentaire (pour rétrocompatibilité)
     * @param {string} [idReference] - ID de référence (pour rétrocompatibilité)
     * @returns {string} ID de l'entrée créée
     */
    enregistrerAction(options, entite, donnees, utilisateur = 'system', commentaire = '', idReference) {
        try {
            // Gestion de la compatibilité avec l'ancienne signature
            let type, module, entiteFinale, donneesFinales, utilisateurFinal, commentaireFinal, idReferenceFinal;
            
            if (typeof options === 'string') {
                // Ancienne signature : enregistrerAction(type, entite, donnees, utilisateur, commentaire, idReference)
                type = options;
                entiteFinale = entite;
                donneesFinales = donnees;
                utilisateurFinal = utilisateur || 'system';
                commentaireFinal = commentaire || '';
                idReferenceFinal = idReference;
                module = this._determinerModuleDepuisEntite(entite);
            } else if (typeof options === 'object') {
                // Nouvelle signature : enregistrerAction({type, module, entite, ...})
                type = options.type;
                module = options.module || this._determinerModuleDepuisEntite(options.entite);
                entiteFinale = options.entite;
                donneesFinales = options.donnees || {};
                utilisateurFinal = options.utilisateur || 'system';
                commentaireFinal = options.commentaire || '';
                idReferenceFinal = options.idReference;
            } else {
                throw new Error('Format des paramètres invalide');
            }

            if (!type || !entiteFinale) {
                throw new Error('Le type et l\'entité sont obligatoires');
            }

            // Création de l'entrée d'historique
            const entree = {
                id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                idReference: idReferenceFinal || `ref_${Date.now()}`,
                type,
                module,
                entite: entiteFinale,
                timestamp: new Date().toISOString(),
                utilisateur: utilisateurFinal,
                commentaire: commentaireFinal,
                donnees: this._nettoyerDonnees(donneesFinales),
                ip: this._getClientIP(), // Méthode à implémenter pour récupérer l'IP
                // Métadonnées supplémentaires
                navigateur: this._getBrowserInfo(),
                resolution: this._getScreenResolution(),
                userAgent: navigator.userAgent
            };

            this.historique.unshift(entree); // Ajout au début du tableau

            // Limiter la taille de l'historique
            if (this.historique.length > this.maxEntries) {
                this.historique = this.historique.slice(0, this.maxEntries);
            }

            // Sauvegarder dans le stockage local
            this._sauvegarder();
            
            // Déclencher un événement personnalisé pour les abonnés
            this._declencherEvenement('nouvelleEntree', entree);
            
            return entree.id;
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement dans l\'historique:', error);
            return null;
        }
    }

    /**
     * Nettoie les données sensibles avant enregistrement
     * @private
     */
    /**
     * Détermine le module à partir du type d'entité
     * @private
     */
    _determinerModuleDepuisEntite(entite) {
        const entiteUpper = entite.toUpperCase();
        
        // Mapping des entités vers leurs modules respectifs
        const mapping = {
            // Finance
            'RECETTE': MODULES.FINANCE,
            'DEPENSE': MODULES.FINANCE,
            // Utilisateurs
            'UTILISATEUR': MODULES.UTILISATEURS,
            'ROLE': MODULES.UTILISATEURS,
            // Véhicules
            'VEHICULE': MODULES.VEHICULES,
            'MARQUE': MODULES.VEHICULES,
            'MODELE': MODULES.VEHICULES,
            // Maintenance
            'INTERVENTION': MODULES.MAINTENANCE,
            'PIECE': MODULES.MAINTENANCE,
            // Planning
            'TRAJET': MODULES.PLANNING,
            'CHAUFFEUR': MODULES.PLANNING,
            // Par défaut
            'DEFAULT': MODULES.PARAMETRES
        };
        
        return mapping[entiteUpper] || mapping['DEFAULT'];
    }
    
    /**
     * Récupère l'adresse IP du client (à implémenter côté serveur)
     * @private
     */
    _getClientIP() {
        // À implémenter côté serveur pour une réelle efficacité
        return '127.0.0.1';
    }
    
    /**
     * Récupère des informations sur le navigateur
     * @private
     */
    _getBrowserInfo() {
        if (typeof window === 'undefined') return {};
        
        const ua = navigator.userAgent;
        let tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return { name: 'IE', version: (tem[1] || '') };
        }
        
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) {
                return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
            }
        }
        
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        
        return {
            name: M[0],
            version: M[1]
        };
    }
    
    /**
     * Récupère la résolution d'écran
     * @private
     */
    _getScreenResolution() {
        if (typeof window === 'undefined') return {};
        
        return {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth
        };
    }
    
    /**
     * Déclenche un événement personnalisé
     * @private
     */
    _declencherEvenement(nomEvenement, donnees) {
        if (typeof CustomEvent === 'function') {
            const event = new CustomEvent(`historique:${nomEvenement}`, { 
                detail: donnees 
            });
            window.dispatchEvent(event);
        }
    }
    
    /**
     * Nettoie les données sensibles avant enregistrement
     * @private
     */
    /**
     * Filtre l'historique selon différents critères
     * @param {Object} filtres - Critères de filtrage
     * @param {string} [filtres.module] - Module à filtrer
     * @param {string} [filtres.type] - Type d'action à filtrer
     * @param {string} [filtres.entite] - Type d'entité à filtrer
     * @param {string} [filtres.utilisateur] - Utilisateur à filtrer
     * @param {Date} [filtres.dateDebut] - Date de début
     * @param {Date} [filtres.dateFin] - Date de fin
     * @param {string} [filtres.recherche] - Terme de recherche plein texte
     * @returns {Array} Entrées d'historique filtrées
     */
    filtrer(filtres = {}) {
        return this.historique.filter(entree => {
            // Filtrage par module
            if (filtres.module && entree.module !== filtres.module) {
                return false;
            }
            
            // Filtrage par type d'action
            if (filtres.type && entree.type !== filtres.type) {
                return false;
            }
            
            // Filtrage par type d'entité
            if (filtres.entite && entree.entite !== filtres.entite) {
                return false;
            }
            
            // Filtrage par utilisateur
            if (filtres.utilisateur && entree.utilisateur !== filtres.utilisateur) {
                return false;
            }
            
            // Filtrage par plage de dates
            const dateEntree = new Date(entree.timestamp);
            if (filtres.dateDebut && dateEntree < new Date(filtres.dateDebut)) {
                return false;
            }
            if (filtres.dateFin) {
                const dateFin = new Date(filtres.dateFin);
                dateFin.setHours(23, 59, 59, 999); // Fin de la journée
                if (dateEntree > dateFin) {
                    return false;
                }
            }
            
            // Recherche plein texte
            if (filtres.recherche) {
                const terme = filtres.recherche.toLowerCase();
                const texteRecherche = [
                    entree.type,
                    entree.entite,
                    entree.utilisateur,
                    entree.commentaire,
                    JSON.stringify(entree.donnees)
                ].join(' ').toLowerCase();
                
                if (!texteRecherche.includes(terme)) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    /**
     * Exporte l'historique au format spécifié
     * @param {string} format - Format d'export (json, csv)
     * @param {Object} options - Options de filtrage (voir méthode filtrer)
     * @returns {string} Données exportées
     */
    exporter(format = 'json', options = {}) {
        const donnees = options ? this.filtrer(options) : [...this.historique];
        
        switch (format.toLowerCase()) {
            case 'csv':
                return this._exporterCSV(donnees);
            case 'json':
            default:
                return JSON.stringify(donnees, null, 2);
        }
    }
    
    /**
     * Exporte les données au format CSV
     * @private
     */
    _exporterCSV(donnees) {
        if (!donnees.length) return '';
        
        // En-têtes des colonnes
        const entete = Object.keys(donnees[0]).join(';');
        
        // Lignes de données
        const lignes = donnees.map(entree => {
            return Object.values(entree)
                .map(v => {
                    if (v === null || v === undefined) return '';
                    const str = typeof v === 'object' ? JSON.stringify(v) : String(v);
                    return `"${str.replace(/"/g, '""')}"`;
                })
                .join(';');
        });
        
        return [entete, ...lignes].join('\n');
    }
    
    /**
     * Télécharge un fichier avec les données fournies
     * @param {string} nomFichier - Nom du fichier
     * @param {string} contenu - Contenu du fichier
     * @param {string} typeMime - Type MIME du fichier
     */
    telechargerFichier(nomFichier, contenu, typeMime = 'text/plain') {
        const blob = new Blob([contenu], { type: `${typeMime};charset=utf-8;` });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        document.body.appendChild(a);
        a.click();
        
        // Nettoyage
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
    
    /**
     * Nettoie les données sensibles avant enregistrement
     * @private
     */
    /**
     * Récupère une page de l'historique avec pagination
     * @param {number} page - Numéro de page (commence à 1)
     * @param {number} taillePage - Nombre d'entrées par page
     * @param {Object} filtres - Filtres optionnels (voir méthode filtrer)
     * @returns {Object} { donnees, total, pages }
     */
    getPage(page = 1, taillePage = 20, filtres = {}) {
        const donneesFiltrees = this.filtrer(filtres);
        const total = donneesFiltrees.length;
        const pages = Math.ceil(total / taillePage);
        
        // Ajuster le numéro de page si nécessaire
        page = Math.max(1, Math.min(page, pages));
        
        // Calculer l'index de début et de fin
        const debut = (page - 1) * taillePage;
        const fin = debut + taillePage;
        
        // Récupérer les données de la page
        const donnees = donneesFiltrees.slice(debut, fin);
        
        return {
            donnees,
            total,
            page,
            pages,
            taillePage,
            debut: debut + 1,
            fin: Math.min(fin, total)
        };
    }
    
    /**
     * Récupère les statistiques d'utilisation
     * @returns {Object} Statistiques d'utilisation
     */
    getStatistiques() {
        const maintenant = new Date();
        const ilYa30Jours = new Date();
        ilYa30Jours.setDate(ilYa30Jours.getDate() - 30);
        
        // Filtrer les 30 derniers jours
        const recentes = this.filtrer({
            dateDebut: ilYa30Jours.toISOString()
        });
        
        // Compter les actions par type
        const actionsParType = recentes.reduce((acc, entree) => {
            acc[entree.type] = (acc[entree.type] || 0) + 1;
            return acc;
        }, {});
        
        // Compter les actions par module
        const actionsParModule = recentes.reduce((acc, entree) => {
            acc[entree.module] = (acc[entree.module] || 0) + 1;
            return acc;
        }, {});
        
        // Compter les actions par utilisateur
        const actionsParUtilisateur = recentes.reduce((acc, entree) => {
            acc[entree.utilisateur] = (acc[entree.utilisateur] || 0) + 1;
            return acc;
        }, {});
        
        // Actions par jour (30 derniers jours)
        const actionsParJour = {};
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            actionsParJour[dateStr] = 0;
        }
        
        recentes.forEach(entree => {
            const dateStr = entree.timestamp.split('T')[0];
            if (actionsParJour[dateStr] !== undefined) {
                actionsParJour[dateStr]++;
            }
        });
        
        return {
            total: this.historique.length,
            total30Jours: recentes.length,
            actionsParType,
            actionsParModule,
            actionsParUtilisateur,
            actionsParJour
        };
    }
    
    /**
     * Nettoie les données sensibles avant enregistrement
     * @private
     */
    _nettoyerDonnees(donnees) {
        if (!donnees) return {};
        
        try {
            // Créer une copie profonde des données
            const donneesCopie = JSON.parse(JSON.stringify(donnees));
            
            // Liste des champs sensibles à nettoyer
            const champsSensibles = [
                'motDePasse', 'password', 'token', 'apiKey', 'secret',
                'carteCredit', 'cvv', 'numeroCarte', 'dateExpiration'
            ];
            
            // Fonction récursive pour nettoyer les objets
            const nettoyerObjet = (objet) => {
                if (!objet || typeof objet !== 'object') return;
                
                Object.keys(objet).forEach(cle => {
                    // Supprimer ou masquer les champs sensibles
                    if (champsSensibles.some(motCle => 
                        cle.toLowerCase().includes(motCle.toLowerCase())
                    )) {
                        objet[cle] = '*** MASQUÉ ***';
                    }
                    
                    // Nettoyer récursivement les objets imbriqués
                    if (objet[cle] && typeof objet[cle] === 'object') {
                        nettoyerObjet(objet[cle]);
                    }
                });
            };
            
            nettoyerObjet(donneesCopie);
            return donneesCopie;
            
        } catch (e) {
            console.error('Erreur lors du nettoyage des données:', e);
            return { erreur: 'Données non disponibles' };
        }
    }

    /**
     * Récupère l'historique avec des filtres avancés
     * @param {Object} filtres - Filtres à appliquer
     * @param {string} [filtres.type] - Type d'action (creation, modification, suppression, etc.)
     * @param {string} [filtres.entite] - Type d'entité (recette, depense, etc.)
     * @param {string} [filtres.utilisateur] - Nom d'utilisateur
     * @param {Date} [filtres.dateDebut] - Date de début pour le filtrage
     * @param {Date} [filtres.dateFin] - Date de fin pour le filtrage
     * @param {string} [filtres.recherche] - Terme de recherche plein texte
     * @param {number} [filtres.limit=50] - Nombre maximum de résultats à retourner
     * @param {number} [filtres.page=1] - Numéro de page pour la pagination
     * @param {string} [filtres.triPar='timestamp'] - Champ de tri
     * @param {string} [filtres.ordreTri='desc'] - Ordre de tri (asc ou desc)
     * @returns {Object} { resultats: Array, total: number, pages: number }
     */
    getHistorique({
        type,
        entite,
        utilisateur,
        dateDebut,
        dateFin,
        recherche,
        limit = 50,
        page = 1,
        triPar = 'timestamp',
        ordreTri = 'desc'
    } = {}) {
        // Validation des paramètres
        page = Math.max(1, parseInt(page));
        limit = Math.min(100, Math.max(1, parseInt(limit))); // Limite à 100 résultats par page
        const offset = (page - 1) * limit;
        
        // Filtrer les entrées
        let resultats = this.historique.filter(entree => {
            // Filtre par type
            if (type && entree.type !== type) return false;
            
            // Filtre par entité
            if (entite && entree.entite !== entite) return false;
            
            // Filtre par utilisateur
            if (utilisateur && !entree.utilisateur.toLowerCase().includes(utilisateur.toLowerCase())) {
                return false;
            }
            
            // Filtre par date
            const dateEntree = new Date(entree.timestamp);
            if (dateDebut && dateEntree < new Date(dateDebut)) return false;
            if (dateFin) {
                const fin = new Date(dateFin);
                fin.setHours(23, 59, 59, 999); // Fin de la journée
                if (dateEntree > fin) return false;
            }
            
            // Recherche plein texte
            if (recherche) {
                const terme = recherche.toLowerCase();
                const texteRecherche = [
                    entree.type,
                    entree.entite,
                    entree.utilisateur,
                    entree.commentaire,
                    JSON.stringify(entree.donnees)
                ].join(' ').toLowerCase();
                
                if (!texteRecherche.includes(terme)) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Trier les résultats
        resultats.sort((a, b) => {
            let comparaison = 0;
            
            // Trier par le champ spécifié
            if (a[triPar] < b[triPar]) comparaison = -1;
            else if (a[triPar] > b[triPar]) comparaison = 1;
            
            // Inverser l'ordre si nécessaire
            return ordreTri === 'desc' ? -comparaison : comparaison;
        });
        
        // Pagination
        const total = resultats.length;
        const pages = Math.ceil(total / limit);
        resultats = resultats.slice(offset, offset + limit);
        
        return {
            resultats,
            total,
            pages,
            page,
            limit
        };
    }
    
    /**
     * Récupère une entrée par son ID
     * @param {string} id - ID de l'entrée à récupérer
     * @returns {Object|null} L'entrée trouvée ou null si non trouvée
     */
    getEntreeParId(id) {
        return this.historique.find(entree => entree.id === id) || null;
    }
    
    /**
     * Récupère toutes les entrées liées à une référence
     * @param {string} idReference - ID de référence
     * @returns {Array} Tableau des entrées liées
     */
    getHistoriqueParReference(idReference) {
        return this.historique
            .filter(entree => entree.idReference === idReference)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
    
    /**
     * Exporte l'historique au format CSV
     * @param {Object} options - Options d'export
     * @returns {string} Données au format CSV
     */
    exporterCSV(options = {}) {
        const {
            separateur = ';',
            encodage = 'UTF-8',
            inclureEntete = true
        } = options;
        
        // Récupérer les données avec les filtres fournis
        const { resultats } = this.getHistorique(options);
        
        if (resultats.length === 0) {
            return '';
        }
        
        // Créer les lignes CSV
        const lignes = [];
        
        // En-tête
        if (inclureEntete) {
            const entete = [
                'ID',
                'Date/Heure',
                'Type',
                'Entité',
                'Utilisateur',
                'Commentaire',
                'Données (JSON)'
            ];
            lignes.push(entete.join(separateur));
        }
        
        // Données
        resultats.forEach(entree => {
            const ligne = [
                `"${entree.id}"`,
                `"${entree.timestamp}"`,
                `"${entree.type}"`,
                `"${entree.entite}"`,
                `"${entree.utilisateur}"`,
                `"${entree.commentaire.replace(/"/g, '""')}"`,
                `"${JSON.stringify(entree.donnees).replace(/"/g, '""')}"`
            ];
            lignes.push(ligne.join(separateur));
        });
        
        // Retourner le contenu CSV
        return lignes.join('\n');
    }
    
    /**
     * Exporte l'historique au format JSON
     * @param {Object} options - Options d'export
     * @returns {string} Données au format JSON
     */
    exporterJSON(options = {}) {
        const { resultats } = this.getHistorique(options);
        return JSON.stringify({
            meta: {
                dateExport: new Date().toISOString(),
                total: resultats.length,
                options
            },
            donnees: resultats
        }, null, 2);
    }
    
    /**
     * Télécharge l'historique dans un fichier
     * @param {string} format - Format d'export (csv ou json)
     * @param {string} nomFichier - Nom du fichier (sans extension)
     * @param {Object} options - Options d'export
     */
    telechargerFichier(format = 'csv', nomFichier = 'historique', options = {}) {
        let contenu, typeMime, extension;
        
        switch (format.toLowerCase()) {
            case 'json':
                contenu = this.exporterJSON(options);
                typeMime = 'application/json';
                extension = 'json';
                break;
                
            case 'csv':
            default:
                contenu = this.exporterCSV(options);
                typeMime = 'text/csv;charset=utf-8;';
                extension = 'csv';
        }
        
        // Créer un objet Blob avec le contenu
        const blob = new Blob([contenu], { type: typeMime });
        
        // Créer un lien de téléchargement
        const url = URL.createObjectURL(blob);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = `${nomFichier}_${new Date().toISOString().split('T')[0]}.${extension}`;
        
        // Déclencher le téléchargement
        document.body.appendChild(lien);
        lien.click();
        
        // Nettoyer
        setTimeout(() => {
            document.body.removeChild(lien);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    /**
     * Nettoie les entrées anciennes ou obsolètes
     * @private
     */
    _nettoyerAnciennesEntrees() {
        const maintenant = new Date();
        const ageMaxJours = 365; // Conserver les entrées jusqu'à 1 an
        const dateLimite = new Date(maintenant);
        dateLimite.setDate(dateLimite.getDate() - ageMaxJours);
        
        const ancienneTaille = this.historique.length;
        this.historique = this.historique.filter(
            entree => new Date(entree.timestamp) >= dateLimite
        );
        
        // Si des entrées ont été supprimées, sauvegarder
        if (this.historique.length < ancienneTaille) {
            this._sauvegarder();
        }
    }
    
    /**
     * Déclenche un événement personnalisé
     * @private
     */
    _declencherEvenement(nom, detail = {}) {
        if (typeof window !== 'undefined' && window.CustomEvent) {
            // Environnement navigateur
            const evenement = new CustomEvent(`historique:${nom}`, { detail });
            window.dispatchEvent(evenement);
        } else if (typeof process !== 'undefined' && process.emit) {
            // Environnement Node.js
            process.emit(`historique:${nom}`, detail);
        }
        // Si aucun des deux n'est disponible, on ne fait rien
    }

    /**
     * Sauvegarde l'historique dans le stockage local
     * @private
     */
    _sauvegarder() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('historiqueApp', JSON.stringify(this.historique));
            } else if (typeof module !== 'undefined' && module.exports) {
                // En environnement Node.js, on ne fait rien pour l'instant
                // On pourrait implémenter une sauvegarde dans un fichier si nécessaire
            }
        } catch (e) {
            console.error('Erreur lors de la sauvegarde de l\'historique:', e);
            
            // Si le stockage est plein, essayer de supprimer les entrées les plus anciennes
            if (e.name === 'QuotaExceededError') {
                console.warn('Espace de stockage insuffisant, suppression des entrées les plus anciennes...');
                this.historique = this.historique.slice(0, Math.floor(this.historique.length * 0.7)); // Supprimer 30% des entrées
                this._sauvegarder(); // Réessayer avec moins de données
            }
        }
    }
    
    /**
     * Vide l'historique
     */
    viderHistorique() {
        this.historique = [];
        this._sauvegarder();
    }
    
    /**
     * Formate une entrée d'historique pour l'affichage
     * @param {Object} entree - Entrée d'historique à formater
     * @returns {string} Texte formaté
     */
    formaterEntree(entree) {
        const date = new Date(entree.timestamp).toLocaleString();
        const utilisateur = entree.utilisateur || 'Système';
        const module = entree.module ? `[${entree.module}]` : '';
        const details = entree.commentaire || '';
        
        return `${date} - ${utilisateur} ${module} ${entree.type} ${entree.entite}: ${details}`;
    }
    
    /**
     * Récupère les types d'actions uniques dans l'historique
     * @returns {Array} Tableau des types d'actions uniques
     */
    getTypesActionsUniques() {
        const types = new Set();
        this.historique.forEach(entree => types.add(entree.type));
        return Array.from(types).sort();
    }
    
    /**
     * Récupère les entités uniques dans l'historique
     * @returns {Array} Tableau des entités uniques
     */
    getEntitesUniques() {
        const entites = new Set();
        this.historique.forEach(entree => entites.add(entree.entite));
        return Array.from(entites).sort();
    }
    
    /**
     * Récupère les modules uniques dans l'historique
     * @returns {Array} Tableau des modules uniques
     */
    getModulesUniques() {
        const modules = new Set();
        this.historique.forEach(entree => entree.module && modules.add(entree.module));
        return Array.from(modules).sort();
    }
    
    /**
     * Récupère les utilisateurs uniques dans l'historique
     * @returns {Array} Tableau des utilisateurs uniques
     */
    getUtilisateursUniques() {
        const utilisateurs = new Set();
        this.historique.forEach(entree => entree.utilisateur && utilisateurs.add(entree.utilisateur));
        return Array.from(utilisateurs).sort();
    }
}

        // Créer une instance globale
        const historiqueManager = new HistoriqueManager();

        // Préparer l'API publique
        const api = {
            MODULES: MODULES,
            ACTIONS: ACTIONS,
            ENTITES: ENTITES,
            HistoriqueManager: HistoriqueManager,
            historiqueManager: historiqueManager
        };

        // Pour la rétrocompatibilité (à supprimer progressivement)
        if (isBrowser) {
            window.HistoriqueManager = HistoriqueManager;
            window.historiqueManager = historiqueManager;
            window.ACTIONS = ACTIONS;
            window.MODULES = MODULES;
            window.ENTITES = ENTITES;
        }

        // Exporter pour une utilisation dans d'autres fichiers (Node.js)
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = api;
        }

        return api;
    })(); // Fin de l'IIFE
} // Fin du if (!window.ML_HISTORIQUE)
