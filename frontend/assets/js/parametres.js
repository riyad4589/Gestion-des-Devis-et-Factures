/**
 * Paramètres - Page de configuration de l'application
 * Gère les paramètres utilisateur et entreprise
 */

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
});

/**
 * Charge les paramètres enregistrés
 */
function loadSettings() {
    // Charger les paramètres depuis le localStorage
    const settings = getSettings();

    // Informations entreprise
    setInputValue('[name="entreprise_nom"], #entreprise-nom', settings.entreprise?.nom);
    setInputValue('[name="entreprise_siret"], #entreprise-siret', settings.entreprise?.siret);
    setInputValue('[name="entreprise_adresse"], #entreprise-adresse', settings.entreprise?.adresse);
    setInputValue('[name="entreprise_email"], #entreprise-email', settings.entreprise?.email);
    setInputValue('[name="entreprise_telephone"], #entreprise-telephone', settings.entreprise?.telephone);
    setInputValue('[name="entreprise_tva"], #entreprise-tva', settings.entreprise?.tvaIntracom);

    // Paramètres de facturation
    setInputValue('[name="tva_defaut"], #tva-defaut', settings.facturation?.tvaDefaut || '20');
    setInputValue('[name="delai_paiement"], #delai-paiement', settings.facturation?.delaiPaiement || '30');
    setInputValue('[name="prefixe_devis"], #prefixe-devis', settings.facturation?.prefixeDevis || 'DEV-');
    setInputValue('[name="prefixe_facture"], #prefixe-facture', settings.facturation?.prefixeFacture || 'FAC-');
    setInputValue('[name="mentions_legales"], #mentions-legales', settings.facturation?.mentionsLegales);
    setInputValue('[name="conditions_paiement"], #conditions-paiement', settings.facturation?.conditionsPaiement);

    // Paramètres d'affichage
    const theme = settings.display?.theme || 'system';
    document.querySelectorAll('[name="theme"], [data-theme]').forEach(el => {
        if (el.value === theme || el.dataset.theme === theme) {
            if (el.type === 'radio') {
                el.checked = true;
            } else if (el.tagName === 'SELECT') {
                el.value = theme;
            }
        }
    });

    const langue = settings.display?.langue || 'fr';
    setInputValue('[name="langue"], #langue', langue);

    // Notifications
    setCheckboxValue('[name="notif_email"], #notif-email', settings.notifications?.email);
    setCheckboxValue('[name="notif_devis"], #notif-devis', settings.notifications?.devisExpire);
    setCheckboxValue('[name="notif_facture"], #notif-facture', settings.notifications?.factureRetard);
}

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Formulaire entreprise
    const entrepriseForm = document.querySelector('#form-entreprise, form:first-of-type');
    if (entrepriseForm) {
        entrepriseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveEntrepriseSettings();
        });
    }

    // Formulaire facturation
    const facturationForm = document.querySelector('#form-facturation');
    if (facturationForm) {
        facturationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveFacturationSettings();
        });
    }

    // Changement de thème
    document.querySelectorAll('[name="theme"], [data-theme]').forEach(el => {
        el.addEventListener('change', (e) => {
            const theme = e.target.value || e.target.dataset.theme;
            applyTheme(theme);
            saveSettings({ display: { theme } });
        });
    });

    // Boutons de sauvegarde
    document.querySelectorAll('button').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('enregistrer') || text.includes('sauvegarder')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                saveAllSettings();
            });
        }
    });

    // Onglets
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // Upload de logo
    const logoInput = document.querySelector('[name="logo"], #logo-upload');
    if (logoInput) {
        logoInput.addEventListener('change', handleLogoUpload);
    }
}

/**
 * Change d'onglet
 */
function switchTab(tabName) {
    // Mettre à jour les onglets actifs
    document.querySelectorAll('[data-tab]').forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('border-primary', 'text-primary', 'bg-primary/5');
            tab.classList.remove('border-transparent', 'text-gray-500');
        } else {
            tab.classList.remove('border-primary', 'text-primary', 'bg-primary/5');
            tab.classList.add('border-transparent', 'text-gray-500');
        }
    });

    // Afficher le contenu de l'onglet
    document.querySelectorAll('[data-tab-content]').forEach(content => {
        if (content.dataset.tabContent === tabName) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
}

/**
 * Sauvegarde les paramètres de l'entreprise
 */
function saveEntrepriseSettings() {
    const settings = getSettings();
    
    settings.entreprise = {
        nom: getInputValue('[name="entreprise_nom"], #entreprise-nom'),
        siret: getInputValue('[name="entreprise_siret"], #entreprise-siret'),
        adresse: getInputValue('[name="entreprise_adresse"], #entreprise-adresse'),
        email: getInputValue('[name="entreprise_email"], #entreprise-email'),
        telephone: getInputValue('[name="entreprise_telephone"], #entreprise-telephone'),
        tvaIntracom: getInputValue('[name="entreprise_tva"], #entreprise-tva')
    };

    saveSettings(settings);
    showToast('Paramètres entreprise enregistrés', 'success');
}

/**
 * Sauvegarde les paramètres de facturation
 */
function saveFacturationSettings() {
    const settings = getSettings();
    
    settings.facturation = {
        tvaDefaut: getInputValue('[name="tva_defaut"], #tva-defaut') || '20',
        delaiPaiement: getInputValue('[name="delai_paiement"], #delai-paiement') || '30',
        prefixeDevis: getInputValue('[name="prefixe_devis"], #prefixe-devis') || 'DEV-',
        prefixeFacture: getInputValue('[name="prefixe_facture"], #prefixe-facture') || 'FAC-',
        mentionsLegales: getInputValue('[name="mentions_legales"], #mentions-legales'),
        conditionsPaiement: getInputValue('[name="conditions_paiement"], #conditions-paiement')
    };

    saveSettings(settings);
    showToast('Paramètres de facturation enregistrés', 'success');
}

/**
 * Sauvegarde tous les paramètres
 */
function saveAllSettings() {
    const settings = {
        entreprise: {
            nom: getInputValue('[name="entreprise_nom"], #entreprise-nom'),
            siret: getInputValue('[name="entreprise_siret"], #entreprise-siret'),
            adresse: getInputValue('[name="entreprise_adresse"], #entreprise-adresse'),
            email: getInputValue('[name="entreprise_email"], #entreprise-email'),
            telephone: getInputValue('[name="entreprise_telephone"], #entreprise-telephone'),
            tvaIntracom: getInputValue('[name="entreprise_tva"], #entreprise-tva')
        },
        facturation: {
            tvaDefaut: getInputValue('[name="tva_defaut"], #tva-defaut') || '20',
            delaiPaiement: getInputValue('[name="delai_paiement"], #delai-paiement') || '30',
            prefixeDevis: getInputValue('[name="prefixe_devis"], #prefixe-devis') || 'DEV-',
            prefixeFacture: getInputValue('[name="prefixe_facture"], #prefixe-facture') || 'FAC-',
            mentionsLegales: getInputValue('[name="mentions_legales"], #mentions-legales'),
            conditionsPaiement: getInputValue('[name="conditions_paiement"], #conditions-paiement')
        },
        display: {
            theme: getSelectedValue('[name="theme"], [data-theme]:checked, #theme') || 'system',
            langue: getInputValue('[name="langue"], #langue') || 'fr'
        },
        notifications: {
            email: getCheckboxValue('[name="notif_email"], #notif-email'),
            devisExpire: getCheckboxValue('[name="notif_devis"], #notif-devis'),
            factureRetard: getCheckboxValue('[name="notif_facture"], #notif-facture')
        }
    };

    saveSettings(settings);
    showToast('Tous les paramètres ont été enregistrés', 'success');
}

/**
 * Gère l'upload du logo
 */
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
        showToast('Veuillez sélectionner une image', 'error');
        return;
    }

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('L\'image ne doit pas dépasser 2MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const logoBase64 = event.target.result;
        
        // Sauvegarder le logo
        const settings = getSettings();
        settings.entreprise = settings.entreprise || {};
        settings.entreprise.logo = logoBase64;
        saveSettings(settings);

        // Mettre à jour l'affichage
        const logoPreview = document.querySelector('#logo-preview, .logo-preview');
        if (logoPreview) {
            logoPreview.src = logoBase64;
            logoPreview.classList.remove('hidden');
        }

        showToast('Logo mis à jour', 'success');
    };
    reader.readAsDataURL(file);
}

/**
 * Applique le thème
 */
function applyTheme(theme) {
    const html = document.documentElement;
    
    if (theme === 'dark') {
        html.classList.add('dark');
    } else if (theme === 'light') {
        html.classList.remove('dark');
    } else {
        // Système
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }
}

/**
 * Récupère les paramètres
 */
function getSettings() {
    try {
        return JSON.parse(localStorage.getItem('appSettings') || '{}');
    } catch {
        return {};
    }
}

/**
 * Sauvegarde les paramètres
 */
function saveSettings(settings) {
    const currentSettings = getSettings();
    const mergedSettings = { ...currentSettings, ...settings };
    localStorage.setItem('appSettings', JSON.stringify(mergedSettings));
}

/**
 * Utilitaires pour les formulaires
 */
function setInputValue(selector, value) {
    document.querySelectorAll(selector).forEach(el => {
        if (value !== undefined && value !== null) {
            el.value = value;
        }
    });
}

function getInputValue(selector) {
    const el = document.querySelector(selector);
    return el ? el.value.trim() : '';
}

function setCheckboxValue(selector, value) {
    document.querySelectorAll(selector).forEach(el => {
        el.checked = !!value;
    });
}

function getCheckboxValue(selector) {
    const el = document.querySelector(selector);
    return el ? el.checked : false;
}

function getSelectedValue(selector) {
    const el = document.querySelector(selector);
    if (!el) return '';
    if (el.type === 'radio' || el.type === 'checkbox') {
        return el.checked ? el.value : '';
    }
    return el.value;
}

/**
 * Affiche un toast (utilise Utils si disponible)
 */
function showToast(message, type = 'info') {
    if (window.Utils && window.Utils.showToast) {
        window.Utils.showToast(message, type);
        return;
    }

    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Export pour utilisation globale
window.SettingsPage = {
    loadSettings,
    saveAllSettings,
    saveEntrepriseSettings,
    saveFacturationSettings,
    getSettings,
    applyTheme
};
