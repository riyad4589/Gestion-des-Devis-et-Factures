/**
 * Navigation et configuration globale du sidebar
 * Ce fichier gère la navigation entre les pages et la mise en surbrillance de l'élément actif
 */

// Configuration des routes de navigation
const ROUTES = {
    dashboard: 'dashboard.html',
    clients: 'écran_clients_(liste).html',
    clientAdd: 'modification_client.html',
    clientEdit: 'modification_client.html',
    clientHistory: 'écran_historique_client.html',
    produits: 'écran_produits_(liste).html',
    produitEdit: 'modification_produit.html',
    devis: 'écran_liste_des_devis.html',
    devisCreate: 'écran_création_d\'un_devis.html',
    devisDetail: 'écran_détail_d\'un_devis.html',
    factures: 'écran_factures_(liste).html',
    factureCreate: 'écran_création_facture.html',
    factureDetail: 'écran_détail_facture.html',
    statistiques: 'écran_statistiques.html',
    parametres: 'écran_paramètres.html',
    connexion: 'écran_connexion.html'
};

// Fonction pour obtenir le nom de la page actuelle
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'dashboard.html';
    return decodeURIComponent(filename);
}

// Fonction pour naviguer vers une page
function navigateTo(routeKey, params = {}) {
    let url = ROUTES[routeKey];
    if (params.id) {
        url += `?id=${params.id}`;
    }
    window.location.href = url;
}

// Fonction pour initialiser la navigation du sidebar
function initNavigation() {
    const currentPage = getCurrentPage();
    
    // Définir les correspondances page -> élément de navigation
    const pageNavMapping = {
        'dashboard.html': 'nav-dashboard',
        'écran_clients_(liste).html': 'nav-clients',
        'modification_client.html': 'nav-clients',
        'écran_historique_client.html': 'nav-clients',
        'écran_produits_(liste).html': 'nav-produits',
        'modification_produit.html': 'nav-produits',
        'écran_liste_des_devis.html': 'nav-devis',
        'écran_création_d\'un_devis.html': 'nav-devis',
        'écran_détail_d\'un_devis.html': 'nav-devis',
        'écran_factures_(liste).html': 'nav-factures',
        'écran_création_facture.html': 'nav-factures',
        'écran_détail_facture.html': 'nav-factures',
        'écran_statistiques.html': 'nav-stats',
        'écran_paramètres.html': 'nav-parametres'
    };
    
    // Mettre à jour les liens de navigation
    updateNavLinks();
    
    // Mettre en surbrillance l'élément actif
    const activeNavId = pageNavMapping[currentPage];
    if (activeNavId) {
        highlightActiveNav(activeNavId);
    }
}

// Fonction pour mettre à jour tous les liens de navigation
function updateNavLinks() {
    // Liens du dashboard/accueil
    document.querySelectorAll('a[href="#"]').forEach(link => {
        const text = link.textContent.toLowerCase().trim();
        const icon = link.querySelector('.material-symbols-outlined')?.textContent || '';
        
        if (text.includes('accueil') || text.includes('dashboard') || icon === 'home' || icon === 'dashboard') {
            link.href = ROUTES.dashboard;
            link.id = 'nav-dashboard';
        } else if (text.includes('client') || icon === 'group' || icon === 'groups') {
            link.href = ROUTES.clients;
            link.id = 'nav-clients';
        } else if (text.includes('produit') || icon === 'inventory_2') {
            link.href = ROUTES.produits;
            link.id = 'nav-produits';
        } else if (text.includes('devis') || icon === 'request_quote' || icon === 'description') {
            link.href = ROUTES.devis;
            link.id = 'nav-devis';
        } else if (text.includes('factur') || icon === 'receipt_long') {
            link.href = ROUTES.factures;
            link.id = 'nav-factures';
        } else if (text.includes('statistique') || text.includes('rapport') || icon === 'bar_chart') {
            link.href = ROUTES.statistiques;
            link.id = 'nav-stats';
        } else if (text.includes('paramètre') || text.includes('settings') || icon === 'settings') {
            link.href = ROUTES.parametres;
            link.id = 'nav-parametres';
        }
    });
}

// Fonction pour mettre en surbrillance l'élément de navigation actif
function highlightActiveNav(activeId) {
    // Supprimer les classes actives existantes
    document.querySelectorAll('nav a, aside a, .sidebar a').forEach(link => {
        link.classList.remove('bg-primary/10', 'bg-primary/20', 'text-primary');
        link.classList.add('text-gray-700', 'dark:text-gray-300');
        
        // Gérer l'icône filled
        const icon = link.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.style.fontVariationSettings = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
        }
    });
    
    // Ajouter les classes actives à l'élément sélectionné
    const activeLink = document.getElementById(activeId);
    if (activeLink) {
        activeLink.classList.remove('text-gray-700', 'dark:text-gray-300');
        activeLink.classList.add('bg-primary/10', 'dark:bg-primary/20', 'text-primary');
        
        // Remplir l'icône
        const icon = activeLink.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.style.fontVariationSettings = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
        }
    }
}

// Fonction pour récupérer un paramètre de l'URL
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Fonction pour retourner à la page précédente
function goBack() {
    window.history.back();
}

// Fonction pour initialiser le thème sombre/clair
function initTheme() {
    // Vérifier les préférences du système
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

// Fonction pour basculer le thème
function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
}

// Fonction pour naviguer directement vers une URL
function goTo(url) {
    window.location.href = url;
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
});

// Export global
window.Navigation = {
    ROUTES,
    navigateTo,
    goTo,
    getCurrentPage,
    getUrlParam,
    goBack,
    toggleTheme
};
