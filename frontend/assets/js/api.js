/**
 * API Configuration et fonctions utilitaires
 * Ce fichier gère toutes les communications avec le backend Spring Boot
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Configuration des en-têtes par défaut
const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

/**
 * Fonction générique pour les requêtes API
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
    const config = {
        method: method,
        headers: defaultHeaders
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
        }

        // Pour les réponses 204 (No Content)
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`Erreur API [${method}] ${endpoint}:`, error);
        throw error;
    }
}

// ==================== API CLIENTS ====================

const ClientsAPI = {
    /**
     * Récupère tous les clients
     */
    getAll: () => apiRequest('/clients'),
    
    /**
     * Récupère les clients actifs
     */
    getAllActifs: () => apiRequest('/clients/actifs'),
    
    /**
     * Récupère un client par ID
     */
    getById: (id) => apiRequest(`/clients/${id}`),
    
    /**
     * Crée un nouveau client
     */
    create: (client) => apiRequest('/clients', 'POST', client),
    
    /**
     * Met à jour un client
     */
    update: (id, client) => apiRequest(`/clients/${id}`, 'PUT', client),
    
    /**
     * Supprime (désactive) un client
     */
    delete: (id) => apiRequest(`/clients/${id}`, 'DELETE'),
    
    /**
     * Recherche des clients
     */
    search: (query) => apiRequest(`/clients/search?q=${encodeURIComponent(query)}`)
};

// ==================== API PRODUITS ====================

const ProduitsAPI = {
    /**
     * Récupère tous les produits
     */
    getAll: () => apiRequest('/produits'),
    
    /**
     * Récupère les produits actifs
     */
    getAllActifs: () => apiRequest('/produits/actifs'),
    
    /**
     * Récupère un produit par ID
     */
    getById: (id) => apiRequest(`/produits/${id}`),
    
    /**
     * Crée un nouveau produit
     */
    create: (produit) => apiRequest('/produits', 'POST', produit),
    
    /**
     * Met à jour un produit
     */
    update: (id, produit) => apiRequest(`/produits/${id}`, 'PUT', produit),
    
    /**
     * Supprime un produit
     */
    delete: (id) => apiRequest(`/produits/${id}`, 'DELETE'),
    
    /**
     * Recherche des produits
     */
    search: (query) => apiRequest(`/produits/search?q=${encodeURIComponent(query)}`),
    
    /**
     * Récupère les produits par catégorie
     */
    getByCategorie: (categorie) => apiRequest(`/produits/categorie/${encodeURIComponent(categorie)}`)
};

// ==================== API DEVIS ====================

const DevisAPI = {
    /**
     * Récupère tous les devis
     */
    getAll: () => apiRequest('/devis'),
    
    /**
     * Récupère un devis par ID
     */
    getById: (id) => apiRequest(`/devis/${id}`),
    
    /**
     * Crée un nouveau devis
     */
    create: (devis) => apiRequest('/devis', 'POST', devis),
    
    /**
     * Met à jour un devis
     */
    update: (id, devis) => apiRequest(`/devis/${id}`, 'PUT', devis),
    
    /**
     * Supprime un devis
     */
    delete: (id) => apiRequest(`/devis/${id}`, 'DELETE'),
    
    /**
     * Récupère les devis par client
     */
    getByClient: (clientId) => apiRequest(`/devis/client/${clientId}`),
    
    /**
     * Récupère les devis par statut
     */
    getByStatut: (statut) => apiRequest(`/devis/statut/${statut}`),
    
    /**
     * Valide un devis
     */
    valider: (id) => apiRequest(`/devis/${id}/valider`, 'PUT'),
    
    /**
     * Refuse un devis
     */
    refuser: (id) => apiRequest(`/devis/${id}/refuser`, 'PUT'),
    
    /**
     * Annule un devis
     */
    annuler: (id) => apiRequest(`/devis/${id}/annuler`, 'PUT'),
    
    /**
     * Convertit un devis en facture
     */
    convertirEnFacture: (id) => apiRequest(`/devis/${id}/convertir-en-facture`, 'POST'),
    
    /**
     * Alias pour convertir (rétrocompatibilité)
     */
    convertir: (id) => apiRequest(`/devis/${id}/convertir-en-facture`, 'POST'),
    
    /**
     * Télécharge le PDF d'un devis
     */
    downloadPdf: async (id) => {
        const response = await fetch(`${API_BASE_URL}/devis/${id}/pdf`);
        if (!response.ok) throw new Error('Erreur lors du téléchargement du PDF');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devis-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
};

// ==================== API FACTURES ====================

const FacturesAPI = {
    /**
     * Récupère toutes les factures
     */
    getAll: () => apiRequest('/factures'),
    
    /**
     * Récupère une facture par ID
     */
    getById: (id) => apiRequest(`/factures/${id}`),
    
    /**
     * Crée une nouvelle facture
     */
    create: (facture) => apiRequest('/factures', 'POST', facture),
    
    /**
     * Met à jour une facture
     */
    update: (id, facture) => apiRequest(`/factures/${id}`, 'PUT', facture),
    
    /**
     * Supprime une facture
     */
    delete: (id) => apiRequest(`/factures/${id}`, 'DELETE'),
    
    /**
     * Récupère les factures par client
     */
    getByClient: (clientId) => apiRequest(`/factures/client/${clientId}`),
    
    /**
     * Récupère les factures par statut de paiement
     */
    getByStatut: (statut) => apiRequest(`/factures/statut/${statut}`),
    
    /**
     * Marque une facture comme payée
     */
    marquerPayee: (id) => apiRequest(`/factures/${id}/payer`, 'PUT'),
    
    /**
     * Télécharge le PDF d'une facture
     */
    downloadPdf: async (id) => {
        const response = await fetch(`${API_BASE_URL}/factures/${id}/pdf`);
        if (!response.ok) throw new Error('Erreur lors du téléchargement du PDF');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
};

// ==================== API STATISTIQUES ====================

const StatistiquesAPI = {
    /**
     * Récupère les statistiques globales
     */
    getAll: () => apiRequest('/statistiques'),
    
    /**
     * Récupère les statistiques du dashboard
     */
    getDashboard: () => apiRequest('/statistiques/dashboard'),
    
    /**
     * Récupère le chiffre d'affaires par mois
     */
    getCAParMois: (annee) => apiRequest(`/statistiques/ca-par-mois?annee=${annee}`),
    
    /**
     * Récupère les top clients
     */
    getTopClients: (limit = 5) => apiRequest(`/statistiques/top-clients?limit=${limit}`),
    
    /**
     * Récupère les statistiques des devis par statut
     */
    getDevisParStatut: () => apiRequest('/statistiques/devis-par-statut'),
    
    /**
     * Récupère les statistiques des factures par statut
     */
    getFacturesParStatut: () => apiRequest('/statistiques/factures-par-statut')
};

// ==================== API ENTREPRISE ====================

const EntrepriseAPI = {
    /**
     * Récupère les informations de l'entreprise
     */
    get: () => apiRequest('/entreprise'),
    
    /**
     * Sauvegarde les informations de l'entreprise
     */
    save: (data) => apiRequest('/entreprise', 'POST', data),
    
    /**
     * Met à jour les informations de l'entreprise
     */
    update: (data) => apiRequest('/entreprise', 'PUT', data)
};

// ==================== API UTILISATEURS ====================

const UsersAPI = {
    /**
     * Récupère un utilisateur par ID
     */
    getById: (id) => apiRequest(`/auth/users/${id}`),
    
    /**
     * Récupère un utilisateur par email
     */
    getByEmail: (email) => apiRequest(`/auth/users/email/${encodeURIComponent(email)}`),
    
    /**
     * Met à jour le profil d'un utilisateur
     */
    updateProfile: (id, data) => apiRequest(`/auth/users/${id}`, 'PUT', data),
    
    /**
     * Change le mot de passe d'un utilisateur
     */
    changePassword: (id, passwordData) => apiRequest(`/auth/users/${id}/password`, 'PUT', passwordData)
};

// ==================== FONCTIONS UTILITAIRES ====================

/**
 * Formate un nombre en devise DH (Dirham marocain)
 */
function formatCurrency(amount) {
    const formatted = new Intl.NumberFormat('fr-MA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
    return formatted + ' DH';
}

/**
 * Formate une date au format français
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

/**
 * Formate une date pour un input HTML
 */
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

/**
 * Affiche une notification toast
 */
function showToast(message, type = 'info') {
    // Créer le container s'il n'existe pas
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(container);
    }

    // Définir les couleurs selon le type
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    // Créer le toast
    const toast = document.createElement('div');
    toast.className = `${colors[type] || colors.info} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    toast.textContent = message;

    container.appendChild(toast);

    // Animation d'entrée
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);

    // Suppression automatique
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * Affiche un dialogue de confirmation
 */
function showConfirm(message, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    overlay.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirmation</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">${message}</p>
            <div class="flex justify-end gap-3">
                <button id="cancelBtn" class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Annuler</button>
                <button id="confirmBtn" class="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600">Confirmer</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('#cancelBtn').onclick = () => {
        document.body.removeChild(overlay);
        if (onCancel) onCancel();
    };
    
    overlay.querySelector('#confirmBtn').onclick = () => {
        document.body.removeChild(overlay);
        if (onConfirm) onConfirm();
    };
}

/**
 * Retourne le badge HTML pour un statut de devis
 */
function getDevisStatutBadge(statut) {
    const badges = {
        'EN_COURS': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">En cours</span>',
        'VALIDE': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Validé</span>',
        'TRANSFORME_EN_FACTURE': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">Converti</span>',
        'ANNULE': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Annulé</span>'
    };
    return badges[statut] || badges['EN_COURS'];
}

/**
 * Retourne le badge HTML pour un statut de facture
 */
function getFactureStatutBadge(statut) {
    const badges = {
        'NON_PAYEE': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Non payée</span>',
        'PARTIELLEMENT_PAYEE': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Partiellement payée</span>',
        'PAYEE': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Payée</span>',
        'ANNULEE': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Annulée</span>'
    };
    return badges[statut] || badges['NON_PAYEE'];
}

// Export pour utilisation dans les autres fichiers
window.API = {
    Clients: ClientsAPI,
    Produits: ProduitsAPI,
    Devis: DevisAPI,
    Factures: FacturesAPI,
    Statistiques: StatistiquesAPI,
    Entreprise: EntrepriseAPI,
    Users: UsersAPI
};

window.Utils = {
    formatCurrency,
    formatDate,
    formatDateForInput,
    showToast,
    showConfirm,
    getDevisStatutBadge,
    getDevisStatusBadge: getDevisStatutBadge, // Alias pour compatibilité
    getFactureStatutBadge,
    getFactureStatusBadge: getFactureStatutBadge // Alias pour compatibilité
};
