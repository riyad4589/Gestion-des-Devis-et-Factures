/**
 * Sidebar - Composant de navigation latérale uniforme
 * Génère le même sidebar pour toutes les pages
 */

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
});

/**
 * Initialise le sidebar
 */
async function initSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = generateSidebar();
        highlightCurrentPage();
        setupLogout();
        // Charger le nom de l'entreprise depuis l'API
        await loadEntrepriseName();
    }
}

/**
 * Charge le nom de l'entreprise depuis l'API et met à jour le sidebar
 */
async function loadEntrepriseName() {
    try {
        // Utiliser l'API si disponible
        if (window.API && window.API.Entreprise) {
            const entreprise = await window.API.Entreprise.get();
            if (entreprise && entreprise.nom) {
                // Sauvegarder dans localStorage pour les prochaines fois
                localStorage.setItem('entrepriseNom', entreprise.nom);
                updateSidebarEntrepriseName(entreprise.nom);
            }
            // Mettre à jour le logo si présent
            if (entreprise && entreprise.logo) {
                localStorage.setItem('entrepriseLogo', entreprise.logo);
                updateSidebarLogo(entreprise.logo);
            }
        }
    } catch (error) {
        console.log('Entreprise non configurée, utilisation du nom par défaut');
        // Utiliser le localStorage si disponible
        const cachedName = localStorage.getItem('entrepriseNom');
        if (cachedName) {
            updateSidebarEntrepriseName(cachedName);
        }
        const cachedLogo = localStorage.getItem('entrepriseLogo');
        if (cachedLogo) {
            updateSidebarLogo(cachedLogo);
        }
    }
}

/**
 * Met à jour le nom de l'entreprise dans le sidebar
 */
function updateSidebarEntrepriseName(name) {
    const entrepriseNameElement = document.getElementById('sidebar-entreprise-name');
    if (entrepriseNameElement && name) {
        entrepriseNameElement.textContent = name;
    }
}

/**
 * Met à jour le logo de l'entreprise dans le sidebar
 */
function updateSidebarLogo(logoBase64) {
    const logoContainer = document.getElementById('sidebar-logo-container');
    if (logoContainer && logoBase64) {
        logoContainer.innerHTML = `<img src="${logoBase64}" alt="Logo" class="w-8 h-8 rounded-lg object-cover">`;
    }
}

/**
 * Génère le HTML du sidebar
 */
function generateSidebar() {
    const userName = localStorage.getItem('userName') || 'Utilisateur';
    const userEmail = localStorage.getItem('userEmail') || '';
    // Utiliser le nom en cache ou le nom par défaut
    const entrepriseName = localStorage.getItem('entrepriseNom') || 'GestFacture';
    // Utiliser le logo en cache s'il existe
    const entrepriseLogo = localStorage.getItem('entrepriseLogo');
    
    // Générer le contenu du logo
    const logoContent = entrepriseLogo 
        ? `<img src="${entrepriseLogo}" alt="Logo" class="w-8 h-8 rounded-lg object-cover">`
        : `<span class="material-symbols-outlined text-2xl">business_center</span>`;
    
    return `
        <aside class="flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-background-dark h-screen fixed left-0 top-0">
            <div class="flex flex-col h-full p-4">
                <!-- Logo et nom entreprise -->
                <div class="flex items-center gap-3 px-3 py-2 mb-6">
                    <div id="sidebar-logo-container" class="flex items-center justify-center rounded-lg bg-primary/20 p-2 text-primary overflow-hidden">
                        ${logoContent}
                    </div>
                    <div class="flex flex-col">
                        <h1 id="sidebar-entreprise-name" class="text-base font-bold text-gray-900 dark:text-white">${entrepriseName}</h1>
                    </div>
                </div>

                <!-- Navigation principale -->
                <nav class="flex flex-col gap-1 flex-1">
                    <a href="dashboard.html" data-page="dashboard" class="sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors">
                        <span class="material-symbols-outlined">home</span>
                        <p class="text-sm font-medium">Accueil</p>
                    </a>
                    <a href="écran_clients_(liste).html" data-page="clients" class="sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors">
                        <span class="material-symbols-outlined">group</span>
                        <p class="text-sm font-medium">Clients</p>
                    </a>
                    <a href="écran_produits_(liste).html" data-page="produits" class="sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors">
                        <span class="material-symbols-outlined">inventory_2</span>
                        <p class="text-sm font-medium">Produits</p>
                    </a>
                    <a href="écran_liste_des_devis.html" data-page="devis" class="sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors">
                        <span class="material-symbols-outlined">request_quote</span>
                        <p class="text-sm font-medium">Devis</p>
                    </a>
                    <a href="écran_factures_(liste).html" data-page="factures" class="sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors">
                        <span class="material-symbols-outlined">receipt_long</span>
                        <p class="text-sm font-medium">Factures</p>
                    </a>
                    <a href="écran_statistiques.html" data-page="statistiques" class="sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors">
                        <span class="material-symbols-outlined">bar_chart</span>
                        <p class="text-sm font-medium">Statistiques</p>
                    </a>
                </nav>

                <!-- Section du bas -->
                <div class="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
                    <!-- Paramètres -->
                    <a href="écran_paramètres.html" data-page="parametres" class="sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors mb-2">
                        <span class="material-symbols-outlined">settings</span>
                        <p class="text-sm font-medium">Paramètres</p>
                    </a>
                    
                    <!-- Profil utilisateur -->
                    <div class="flex items-center gap-3 px-3 py-2 mb-3">
                        <div class="flex items-center justify-center w-9 h-9 rounded-full bg-primary/20 text-primary">
                            <span class="material-symbols-outlined text-lg">person</span>
                        </div>
                        <div class="flex flex-col flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">${userName}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${userEmail}</p>
                        </div>
                    </div>

                    <!-- Bouton Déconnexion -->
                    <button id="logout-btn" class="flex items-center justify-center gap-2 w-full rounded-lg px-3 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors">
                        <span class="material-symbols-outlined text-xl">logout</span>
                        <p class="text-sm font-semibold">Déconnexion</p>
                    </button>
                </div>
            </div>
        </aside>
    `;
}

/**
 * Met en surbrillance la page actuelle dans le sidebar
 */
function highlightCurrentPage() {
    const currentPath = window.location.pathname.toLowerCase();
    const links = document.querySelectorAll('.sidebar-link');
    
    links.forEach(link => {
        const page = link.getAttribute('data-page');
        let isActive = false;
        
        // Déterminer si le lien est actif
        if (page === 'dashboard' && (currentPath.includes('dashboard') || currentPath.endsWith('/'))) {
            isActive = true;
        } else if (page === 'clients' && (currentPath.includes('client') || currentPath.includes('historique'))) {
            isActive = true;
        } else if (page === 'produits' && currentPath.includes('produit')) {
            isActive = true;
        } else if (page === 'devis' && currentPath.includes('devis')) {
            isActive = true;
        } else if (page === 'factures' && currentPath.includes('facture')) {
            isActive = true;
        } else if (page === 'statistiques' && currentPath.includes('statistique')) {
            isActive = true;
        } else if (page === 'parametres' && currentPath.includes('param')) {
            isActive = true;
        }
        
        if (isActive) {
            link.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-white/10');
            link.classList.add('bg-primary/10', 'text-primary', 'dark:bg-primary/20');
            const icon = link.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.style.fontVariationSettings = "'FILL' 1";
            }
        }
    });
}

/**
 * Configure le bouton de déconnexion
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showLogoutConfirmation();
        });
    }
}

/**
 * Affiche une modal de confirmation de déconnexion stylisée
 */
function showLogoutConfirmation() {
    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.id = 'logout-modal-overlay';
    overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
    overlay.style.animation = 'fadeIn 0.2s ease-out';
    
    // Créer la modal
    overlay.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 transform" style="animation: slideIn 0.2s ease-out">
            <div class="flex flex-col items-center text-center">
                <!-- Icône -->
                <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-red-500 text-3xl">logout</span>
                </div>
                
                <!-- Titre -->
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Déconnexion</h3>
                
                <!-- Message -->
                <p class="text-gray-500 dark:text-gray-400 mb-6">Êtes-vous sûr de vouloir vous déconnecter de votre compte ?</p>
                
                <!-- Boutons -->
                <div class="flex gap-3 w-full">
                    <button id="logout-cancel-btn" class="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Annuler
                    </button>
                    <button id="logout-confirm-btn" class="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-lg">logout</span>
                        Déconnexion
                    </button>
                </div>
            </div>
        </div>
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
        </style>
    `;
    
    document.body.appendChild(overlay);
    
    // Gestionnaires d'événements
    const cancelBtn = document.getElementById('logout-cancel-btn');
    const confirmBtn = document.getElementById('logout-confirm-btn');
    
    // Fermer la modal
    const closeModal = () => {
        overlay.style.animation = 'fadeIn 0.2s ease-out reverse';
        setTimeout(() => overlay.remove(), 150);
    };
    
    // Annuler
    cancelBtn.addEventListener('click', closeModal);
    
    // Cliquer sur l'overlay pour fermer
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    
    // Confirmer la déconnexion
    confirmBtn.addEventListener('click', () => {
        // Supprimer les données de session
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
        
        // Rediriger vers la page de connexion
        window.location.href = 'écran_connexion.html';
    });
    
    // Fermer avec Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Exposer les fonctions globalement
window.initSidebar = initSidebar;
window.updateSidebarEntrepriseName = updateSidebarEntrepriseName;
