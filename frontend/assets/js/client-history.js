/**
 * Client History - Historique d'un client
 * Affiche les devis et factures associés à un client
 */

let clientId = null;
let clientData = null;

document.addEventListener('DOMContentLoaded', () => {
    // Récupérer l'ID du client depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    clientId = urlParams.get('id');

    if (!clientId) {
        Utils.showToast('Client non spécifié', 'error');
        setTimeout(() => {
            window.location.href = 'écran_clients_(liste).html';
        }, 2000);
        return;
    }

    loadClientHistory();
    setupEventListeners();
});

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Onglets si présents
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Bouton retour
    const backBtn = document.querySelector('button:has(.material-symbols-outlined)');
    if (backBtn) {
        const icon = backBtn.querySelector('.material-symbols-outlined');
        if (icon && icon.textContent === 'arrow_back') {
            backBtn.addEventListener('click', () => {
                window.location.href = 'écran_clients_(liste).html';
            });
        }
    }

    // Bouton modifier
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Modifier')) {
            btn.addEventListener('click', () => {
                window.location.href = `modification_client.html?id=${clientId}`;
            });
        }
    });
}

/**
 * Charge l'historique complet du client
 */
async function loadClientHistory() {
    try {
        // Charger les données du client
        clientData = await API.Clients.getById(clientId);
        displayClientInfo(clientData);

        // Charger les devis et factures du client
        const [devis, factures] = await Promise.all([
            API.Devis.getByClient(clientId),
            API.Factures.getByClient(clientId)
        ]);

        displayDevis(devis);
        displayFactures(factures);
        calculateStats(devis, factures);

    } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        Utils.showToast('Erreur lors du chargement des données', 'error');
    }
}

/**
 * Affiche les informations du client
 */
function displayClientInfo(client) {
    // Nom du client dans le fil d'ariane
    const breadcrumbName = document.getElementById('client-name');
    if (breadcrumbName) {
        breadcrumbName.textContent = client.nom;
    }

    // Nom du client dans la carte
    const nameDisplay = document.getElementById('client-name-display');
    if (nameDisplay) {
        nameDisplay.textContent = client.nom;
    }

    // Email
    const emailEl = document.getElementById('client-email');
    if (emailEl) {
        emailEl.textContent = client.email || '--';
    }

    // Téléphone
    const phoneEl = document.getElementById('client-phone');
    if (phoneEl) {
        phoneEl.textContent = client.telephone || 'Non renseigné';
    }
}

/**
 * Affiche la liste des devis
 */
function displayDevis(devis) {
    const tbody = document.getElementById('devis-table-body');
    if (!tbody) return;

    if (!devis || devis.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    Aucun devis pour ce client
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = devis.map(d => `
        <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${d.numeroDevis || 'DEV-' + String(d.id).padStart(4, '0')}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${Utils.formatDate(d.dateDevis)}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${Utils.formatCurrency(d.totalTTC)}</td>
            <td class="px-6 py-4">${Utils.getDevisStatutBadge ? Utils.getDevisStatutBadge(d.statut) : getDevisStatusBadge(d.statut)}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="viewDevis(${d.id})" class="p-2 rounded-lg hover:bg-primary/10 text-gray-600 hover:text-primary transition-colors">
                    <span class="material-symbols-outlined text-xl">visibility</span>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Affiche la liste des factures
 */
function displayFactures(factures) {
    const tbody = document.getElementById('factures-table-body');
    if (!tbody) return;

    if (!factures || factures.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    Aucune facture pour ce client
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = factures.map(f => `
        <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${f.numeroFacture || 'FAC-' + String(f.id).padStart(4, '0')}</td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${Utils.formatDate(f.dateFacture)}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${Utils.formatCurrency(f.montantTTC)}</td>
            <td class="px-6 py-4">${Utils.getFactureStatutBadge ? Utils.getFactureStatutBadge(f.statut) : getFactureStatusBadge(f.statut)}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="viewFacture(${f.id})" class="p-2 rounded-lg hover:bg-primary/10 text-gray-600 hover:text-primary transition-colors">
                    <span class="material-symbols-outlined text-xl">visibility</span>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Calcule et affiche les statistiques
 */
function calculateStats(devis, factures) {
    // Total des devis
    const totalDevis = devis ? devis.length : 0;
    const montantDevis = devis ? devis.reduce((sum, d) => sum + (d.totalTTC || 0), 0) : 0;

    // Total des factures
    const totalFactures = factures ? factures.length : 0;
    const montantFactures = factures ? factures.reduce((sum, f) => sum + (f.montantTTC || 0), 0) : 0;

    // Mettre à jour les stats dans l'interface par ID
    const statDevis = document.getElementById('stat-devis');
    if (statDevis) statDevis.textContent = totalDevis;

    const statFactures = document.getElementById('stat-factures');
    if (statFactures) statFactures.textContent = totalFactures;

    const statTotal = document.getElementById('stat-total');
    if (statTotal) statTotal.textContent = Utils.formatCurrency(montantFactures);
}

/**
 * Génère le badge de statut pour un devis
 */
function getDevisStatusBadge(statut) {
    const statusConfig = {
        'EN_COURS': { text: 'En cours', class: 'bg-yellow-100 text-yellow-800' },
        'VALIDE': { text: 'Validé', class: 'bg-green-100 text-green-800' },
        'TRANSFORME_EN_FACTURE': { text: 'Converti', class: 'bg-blue-100 text-blue-800' },
        'ANNULE': { text: 'Annulé', class: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[statut] || { text: statut, class: 'bg-gray-100 text-gray-800' };
    return `<span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.class}">${config.text}</span>`;
}

/**
 * Génère le badge de statut pour une facture
 */
function getFactureStatusBadge(statut) {
    const statusConfig = {
        'NON_PAYEE': { text: 'Non payée', class: 'bg-yellow-100 text-yellow-800' },
        'PARTIELLEMENT_PAYEE': { text: 'Partiellement payée', class: 'bg-orange-100 text-orange-800' },
        'PAYEE': { text: 'Payée', class: 'bg-green-100 text-green-800' },
        'ANNULEE': { text: 'Annulée', class: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[statut] || { text: statut, class: 'bg-gray-100 text-gray-800' };
    return `<span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.class}">${config.text}</span>`;
}

/**
 * Change d'onglet
 */
function switchTab(tabName) {
    // Mettre à jour les onglets actifs
    document.querySelectorAll('[data-tab]').forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('border-primary', 'text-primary');
            tab.classList.remove('border-transparent', 'text-gray-500');
        } else {
            tab.classList.remove('border-primary', 'text-primary');
            tab.classList.add('border-transparent', 'text-gray-500');
        }
    });

    // Afficher le contenu de l'onglet
    const devisContent = document.getElementById('tab-content-devis');
    const facturesContent = document.getElementById('tab-content-factures');
    
    if (tabName === 'devis') {
        if (devisContent) devisContent.classList.remove('hidden');
        if (facturesContent) facturesContent.classList.add('hidden');
    } else if (tabName === 'factures') {
        if (devisContent) devisContent.classList.add('hidden');
        if (facturesContent) facturesContent.classList.remove('hidden');
    }
}

/**
 * Voir le détail d'un devis
 */
function viewDevis(id) {
    window.location.href = `écran_détail_d'un_devis.html?id=${id}`;
}

/**
 * Voir le détail d'une facture
 */
function viewFacture(id) {
    window.location.href = `écran_détail_facture.html?id=${id}`;
}

/**
 * Retourne l'ID du client actuel (utilisé dans le HTML)
 */
function getClientId() {
    return clientId;
}

// Export pour utilisation globale
window.ClientHistory = {
    loadClientHistory,
    viewDevis,
    viewFacture,
    switchTab,
    getClientId
};

// Exposer getClientId globalement pour le HTML
window.getClientId = getClientId;
