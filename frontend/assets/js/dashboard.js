/**
 * Dashboard - Page d'accueil
 * Gère l'affichage des statistiques et des dernières activités
 */

let dashboardData = {
    clients: [],
    produits: [],
    devis: [],
    factures: []
};

let currentTab = 'devis';

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    setupTabs();
});

/**
 * Charge toutes les données du dashboard
 */
async function loadDashboardData() {
    try {
        // Charger les statistiques en parallèle
        const [clients, produits, devis, factures] = await Promise.all([
            API.Clients.getAll(),
            API.Produits.getAll(),
            API.Devis.getAll(),
            API.Factures.getAll()
        ]);

        dashboardData = { clients, produits, devis, factures };

        // Mettre à jour les statistiques
        updateStats(clients, produits, devis, factures);
        
        // Afficher le tableau selon l'onglet actif
        showTabContent(currentTab);
        
    } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
        Utils.showToast('Erreur lors du chargement des données', 'error');
    }
}

/**
 * Met à jour les cartes de statistiques
 */
function updateStats(clients, produits, devis, factures) {
    // Calculer les statistiques (filtrer les éléments actifs)
    const nbClients = clients.filter(c => c.actif !== false).length;
    const nbProduits = produits.filter(p => p.actif !== false).length;
    const nbDevisEnCours = devis.filter(d => d.statut === 'EN_COURS').length;
    const facturesNonPayees = factures.filter(f => f.statut === 'NON_PAYEE' || f.statut === 'PARTIELLEMENT_PAYEE');
    const nbFacturesNonPayees = facturesNonPayees.length;
    
    // Calculer le chiffre d'affaires du mois
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const caMonth = factures
        .filter(f => {
            const dateFacture = new Date(f.dateFacture);
            return dateFacture.getMonth() === currentMonth && 
                   dateFacture.getFullYear() === currentYear &&
                   f.statut === 'PAYEE';
        })
        .reduce((sum, f) => sum + (f.montantTTC || 0), 0);

    // Mettre à jour les éléments du DOM par ID
    const statClients = document.getElementById('stat-clients');
    if (statClients) statClients.textContent = nbClients.toLocaleString('fr-FR');
    
    const statProduits = document.getElementById('stat-produits');
    if (statProduits) statProduits.textContent = nbProduits.toLocaleString('fr-FR');
    
    const statDevis = document.getElementById('stat-devis');
    if (statDevis) statDevis.textContent = nbDevisEnCours.toLocaleString('fr-FR');
    
    const statFactures = document.getElementById('stat-factures');
    if (statFactures) statFactures.textContent = nbFacturesNonPayees.toLocaleString('fr-FR');
    
    const statCA = document.getElementById('stat-ca');
    if (statCA) statCA.textContent = Utils.formatCurrency(caMonth);
}

/**
 * Configure les onglets
 */
function setupTabs() {
    const tabs = document.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            const tabType = tab.dataset.tab;
            currentTab = tabType;
            
            // Supprimer l'état actif des autres onglets
            tabs.forEach(t => {
                t.classList.remove('border-b-primary', 'text-primary');
                t.classList.add('border-b-transparent', 'text-gray-500');
            });
            
            // Activer l'onglet cliqué
            tab.classList.remove('border-b-transparent', 'text-gray-500');
            tab.classList.add('border-b-primary', 'text-primary');
            
            // Afficher le contenu correspondant
            showTabContent(tabType);
        });
    });
}

/**
 * Affiche le contenu de l'onglet
 */
function showTabContent(tabType) {
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');
    
    if (!tableHeader || !tableBody) return;
    
    if (tabType === 'devis') {
        tableHeader.innerHTML = `
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">N° Devis</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Montant</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Statut</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</th>
        `;
        renderDevisTable(tableBody);
    } else if (tabType === 'factures') {
        tableHeader.innerHTML = `
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">N° Facture</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Montant</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Statut</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</th>
        `;
        renderFacturesTable(tableBody);
    } else if (tabType === 'clients') {
        tableHeader.innerHTML = `
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Nom</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Téléphone</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date d'ajout</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</th>
        `;
        renderClientsTable(tableBody);
    }
}

/**
 * Affiche le tableau des devis
 */
function renderDevisTable(tbody) {
    const recentDevis = [...dashboardData.devis]
        .sort((a, b) => new Date(b.dateDevis || b.dateCreation) - new Date(a.dateDevis || a.dateCreation))
        .slice(0, 5);
    
    if (recentDevis.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Aucun devis</td></tr>`;
        return;
    }
    
    tbody.innerHTML = recentDevis.map(d => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${d.numeroDevis || 'DEV-' + String(d.id).padStart(4, '0')}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${d.clientNom || 'Client inconnu'}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${Utils.formatCurrency(d.totalTTC)}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">${Utils.getDevisStatutBadge(d.statut)}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">
                <a href="écran_détail_d'un_devis.html?id=${d.id}" class="text-primary hover:text-primary/80 font-medium">Voir</a>
            </td>
        </tr>
    `).join('');
}

/**
 * Affiche le tableau des factures
 */
function renderFacturesTable(tbody) {
    const recentFactures = [...dashboardData.factures]
        .sort((a, b) => new Date(b.dateFacture || b.dateCreation) - new Date(a.dateFacture || a.dateCreation))
        .slice(0, 5);
    
    if (recentFactures.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Aucune facture</td></tr>`;
        return;
    }
    
    tbody.innerHTML = recentFactures.map(f => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${f.numeroFacture || 'FAC-' + String(f.id).padStart(4, '0')}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${f.clientNom || 'Client inconnu'}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${Utils.formatCurrency(f.montantTTC)}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">${Utils.getFactureStatutBadge(f.statut)}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">
                <a href="écran_détail_facture.html?id=${f.id}" class="text-primary hover:text-primary/80 font-medium">Voir</a>
            </td>
        </tr>
    `).join('');
}

/**
 * Affiche le tableau des clients
 */
function renderClientsTable(tbody) {
    const recentClients = [...dashboardData.clients]
        .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
        .slice(0, 5);
    
    if (recentClients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Aucun client</td></tr>`;
        return;
    }
    
    tbody.innerHTML = recentClients.map(c => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${c.nom}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${c.email}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${c.telephone || '-'}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${Utils.formatDate(c.dateCreation)}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">
                <a href="écran_historique_client.html?id=${c.id}" class="text-primary hover:text-primary/80 font-medium">Voir</a>
            </td>
        </tr>
    `).join('');
}
