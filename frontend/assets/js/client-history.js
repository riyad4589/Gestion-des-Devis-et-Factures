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
    // Nom du client
    const nameElements = document.querySelectorAll('h1, h2, .client-name');
    nameElements.forEach(el => {
        if (el.textContent.includes('Client') || el.classList.contains('client-name')) {
            el.textContent = client.nom;
        }
    });

    // Email
    const emailEl = document.querySelector('[data-client-email], .client-email');
    if (emailEl) {
        emailEl.textContent = client.email;
    }

    // Téléphone
    const phoneEl = document.querySelector('[data-client-phone], .client-phone');
    if (phoneEl) {
        phoneEl.textContent = client.telephone || 'Non renseigné';
    }

    // Adresse
    const addressEl = document.querySelector('[data-client-address], .client-address');
    if (addressEl) {
        addressEl.textContent = client.adresse || 'Non renseignée';
    }

    // Date de création
    const dateEl = document.querySelector('[data-client-date], .client-date');
    if (dateEl) {
        dateEl.textContent = `Client depuis le ${Utils.formatDate(client.dateCreation)}`;
    }

    // Statut
    const statusEl = document.querySelector('[data-client-status], .client-status');
    if (statusEl) {
        if (client.actif) {
            statusEl.innerHTML = '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Actif</span>';
        } else {
            statusEl.innerHTML = '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span>Inactif</span>';
        }
    }

    // Remplir les informations dans les cartes d'info si présentes
    const infoCards = document.querySelectorAll('.info-card, .bg-white.rounded-xl');
    infoCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes('email')) {
            const valueEl = card.querySelector('p:last-child, .value');
            if (valueEl) valueEl.textContent = client.email;
        } else if (text.includes('téléphone')) {
            const valueEl = card.querySelector('p:last-child, .value');
            if (valueEl) valueEl.textContent = client.telephone || 'Non renseigné';
        }
    });
}

/**
 * Affiche la liste des devis
 */
function displayDevis(devis) {
    const tbody = document.querySelector('#devis-table tbody, [data-devis-list] tbody, table:first-of-type tbody');
    if (!tbody) return;

    if (devis.length === 0) {
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
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">DEV-${String(d.id).padStart(4, '0')}</td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${Utils.formatDate(d.dateCreation)}</td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${Utils.formatCurrency(d.montantTTC)}</td>
            <td class="px-4 py-3">${Utils.getDevisStatusBadge(d.statut)}</td>
            <td class="px-4 py-3">
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
    const tbody = document.querySelector('#factures-table tbody, [data-factures-list] tbody, table:last-of-type tbody');
    if (!tbody) return;

    if (factures.length === 0) {
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
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">FAC-${String(f.id).padStart(4, '0')}</td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${Utils.formatDate(f.dateCreation)}</td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${Utils.formatCurrency(f.montantTTC)}</td>
            <td class="px-4 py-3">${Utils.getFactureStatusBadge(f.statut)}</td>
            <td class="px-4 py-3">
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
    const totalDevis = devis.length;
    const montantDevis = devis.reduce((sum, d) => sum + (d.montantTTC || 0), 0);

    // Total des factures
    const totalFactures = factures.length;
    const montantFactures = factures.reduce((sum, f) => sum + (f.montantTTC || 0), 0);

    // Factures payées
    const facturesPayees = factures.filter(f => f.statut === 'PAYEE');
    const montantPaye = facturesPayees.reduce((sum, f) => sum + (f.montantTTC || 0), 0);

    // Mettre à jour les stats dans l'interface
    const statsElements = document.querySelectorAll('.stat-value, .stats-card h3, [data-stat]');
    statsElements.forEach(el => {
        const parent = el.closest('.stat-card, .bg-white, div');
        const text = parent ? parent.textContent.toLowerCase() : '';

        if (text.includes('devis')) {
            el.textContent = totalDevis.toString();
        } else if (text.includes('facture') && !text.includes('payé')) {
            el.textContent = totalFactures.toString();
        } else if (text.includes('chiffre') || text.includes('total')) {
            el.textContent = Utils.formatCurrency(montantFactures);
        } else if (text.includes('payé')) {
            el.textContent = Utils.formatCurrency(montantPaye);
        }
    });

    // Chercher les cartes de stats par leur structure
    const cards = document.querySelectorAll('.bg-white.rounded-xl, .stat-card');
    cards.forEach(card => {
        const label = card.querySelector('p, span, .label');
        const value = card.querySelector('h2, h3, .value, .text-2xl');
        
        if (label && value) {
            const labelText = label.textContent.toLowerCase();
            if (labelText.includes('devis')) {
                value.textContent = totalDevis;
            } else if (labelText.includes('facture')) {
                value.textContent = totalFactures;
            } else if (labelText.includes('total') || labelText.includes('chiffre')) {
                value.textContent = Utils.formatCurrency(montantFactures);
            }
        }
    });
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
    document.querySelectorAll('[data-tab-content]').forEach(content => {
        if (content.dataset.tabContent === tabName) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
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
