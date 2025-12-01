/**
 * App Loader - Chargeur automatique des scripts
 * Ce fichier doit être inclus dans toutes les pages HTML
 * Il charge automatiquement les scripts nécessaires selon la page
 */

(function() {
    'use strict';

    // Configuration des scripts par page
    const PAGE_SCRIPTS = {
        'dashboard': ['api.js', 'navigation.js', 'auth.js', 'dashboard.js'],
        'connexion': ['api.js', 'auth.js'],
        'clients_(liste)': ['api.js', 'navigation.js', 'auth.js', 'clients.js'],
        'modification_client': ['api.js', 'navigation.js', 'auth.js', 'client-form.js'],
        'historique_client': ['api.js', 'navigation.js', 'auth.js', 'client-history.js'],
        'produits_(liste)': ['api.js', 'navigation.js', 'auth.js', 'produits.js'],
        'modification_produit': ['api.js', 'navigation.js', 'auth.js', 'produit-form.js'],
        'liste_des_devis': ['api.js', 'navigation.js', 'auth.js', 'devis.js'],
        'création_d\'un_devis': ['api.js', 'navigation.js', 'auth.js', 'devis-form.js'],
        'détail_d\'un_devis': ['api.js', 'navigation.js', 'auth.js', 'devis-detail.js'],
        'factures_(liste)': ['api.js', 'navigation.js', 'auth.js', 'factures.js'],
        'création_facture': ['api.js', 'navigation.js', 'auth.js', 'facture-form.js'],
        'détail_facture': ['api.js', 'navigation.js', 'auth.js', 'facture-detail.js'],
        'statistiques': ['api.js', 'navigation.js', 'auth.js', 'statistiques.js'],
        'paramètres': ['api.js', 'navigation.js', 'auth.js', 'parametres.js']
    };

    // Scripts de base à charger sur toutes les pages
    const BASE_SCRIPTS = ['api.js', 'navigation.js'];

    /**
     * Détecte la page actuelle
     */
    function detectCurrentPage() {
        const pathname = window.location.pathname.toLowerCase();
        const filename = pathname.split('/').pop().replace('.html', '');
        
        // Normaliser le nom de fichier
        const normalized = decodeURIComponent(filename)
            .replace(/écran_/g, '')
            .replace(/_/g, '_')
            .toLowerCase();

        return normalized;
    }

    /**
     * Charge un script de manière asynchrone
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Vérifier si le script est déjà chargé
            const existingScript = document.querySelector(`script[src*="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `assets/js/${src}`;
            script.async = false; // Garder l'ordre de chargement
            
            script.onload = () => {
                console.log(`✓ Script chargé: ${src}`);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`✗ Erreur de chargement: ${src}`);
                reject(new Error(`Failed to load ${src}`));
            };

            document.body.appendChild(script);
        });
    }

    /**
     * Charge tous les scripts nécessaires pour la page
     */
    async function loadPageScripts() {
        const currentPage = detectCurrentPage();
        console.log(`📄 Page détectée: ${currentPage}`);

        // Trouver les scripts pour cette page
        let scriptsToLoad = [];
        
        for (const [pageKey, scripts] of Object.entries(PAGE_SCRIPTS)) {
            if (currentPage.includes(pageKey) || pageKey.includes(currentPage)) {
                scriptsToLoad = scripts;
                break;
            }
        }

        // Si aucune correspondance, charger les scripts de base
        if (scriptsToLoad.length === 0) {
            scriptsToLoad = BASE_SCRIPTS;
        }

        console.log(`📦 Scripts à charger: ${scriptsToLoad.join(', ')}`);

        // Charger les scripts dans l'ordre
        for (const script of scriptsToLoad) {
            try {
                await loadScript(script);
            } catch (error) {
                console.error(`Erreur de chargement du script ${script}:`, error);
            }
        }

        // Déclencher un événement personnalisé quand tous les scripts sont chargés
        window.dispatchEvent(new CustomEvent('scriptsLoaded'));
    }

    /**
     * Initialise l'application
     */
    function initApp() {
        // Appliquer le thème
        applyStoredTheme();

        // Charger les scripts
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadPageScripts);
        } else {
            loadPageScripts();
        }
    }

    /**
     * Applique le thème stocké
     */
    function applyStoredTheme() {
        try {
            const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
            const theme = settings.display?.theme || 'system';

            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else if (theme === 'light') {
                document.documentElement.classList.remove('dark');
            } else {
                // Système
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                }
            }
        } catch (e) {
            console.error('Erreur lors de l\'application du thème:', e);
        }
    }

    // Démarrer l'initialisation
    initApp();

    // Export pour debug
    window.AppLoader = {
        detectCurrentPage,
        loadScript,
        PAGE_SCRIPTS
    };

})();
