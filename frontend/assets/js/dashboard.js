/**
 * Dashboard - Page d'accueil
 * Gère l'affichage des statistiques et des dernières activités
 */

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
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

        // Mettre à jour les statistiques
        updateStats(clients, produits, devis, factures);
        
        // Charger les derniers éléments
        loadRecentDevis(devis);
        loadRecentFactures(factures);
        loadRecentClients(clients);
        
    } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
        Utils.showToast('Erreur lors du chargement des données', 'error');
    }
}

/**
 * Met à jour les cartes de statistiques
 */
function updateStats(clients, produits, devis, factures) {
    // Calculer les statistiques
    const nbClients = clients.length;
    const nbProduits = produits.filter(p => p.actif).length;
    const nbDevisEnCours = devis.filter(d => d.statut === 'EN_COURS' || d.statut === 'ENVOYE').length;
    const facturesNonPayees = factures.filter(f => f.statutPaiement === 'EN_ATTENTE' || f.statutPaiement === 'EN_RETARD');
    const nbFacturesNonPayees = facturesNonPayees.length;
    
    // Calculer le chiffre d'affaires du mois
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const caMonth = factures
        .filter(f => {
            const dateFacture = new Date(f.dateEmission);
            return dateFacture.getMonth() === currentMonth && 
                   dateFacture.getFullYear() === currentYear &&
                   f.statutPaiement === 'PAYEE';
        })
        .reduce((sum, f) => sum + (f.montantTTC || 0), 0);

    // Mettre à jour les éléments du DOM
    const statsElements = document.querySelectorAll('.text-2xl.font-bold');
    if (statsElements.length >= 5) {
        // Stats: Clients, Produits, Devis en cours, Factures non payées, CA du mois
        const statsData = [
            nbClients.toLocaleString('fr-FR'),
            nbProduits.toLocaleString('fr-FR'),
            nbDevisEnCours.toLocaleString('fr-FR'),
            nbFacturesNonPayees.toLocaleString('fr-FR'),
            Utils.formatCurrency(caMonth)
        ];
        
        statsElements.forEach((el, index) => {
            if (statsData[index]) {
                el.textContent = statsData[index];
            }
        });
    }

    // Alternative: chercher par texte du label
    updateStatByLabel('Nombre de clients', nbClients.toLocaleString('fr-FR'));
    updateStatByLabel('Nombre de produits', nbProduits.toLocaleString('fr-FR'));
    updateStatByLabel('Devis en cours', nbDevisEnCours.toLocaleString('fr-FR'));
    updateStatByLabel('Factures non payées', nbFacturesNonPayees.toLocaleString('fr-FR'));
    updateStatByLabel("Chiffre d'affaires", Utils.formatCurrency(caMonth));
}

/**
 * Met à jour une statistique par son label
 */
function updateStatByLabel(label, value) {
    const labels = document.querySelectorAll('p');
    labels.forEach(labelEl => {
        if (labelEl.textContent.toLowerCase().includes(label.toLowerCase())) {
            const parent = labelEl.closest('.flex.flex-col') || labelEl.parentElement;
            const valueEl = parent.querySelector('.text-2xl, .text-3xl, .font-bold');
            if (valueEl && valueEl !== labelEl) {
                valueEl.textContent = value;
            }
        }
    });
}

/**
 * Charge les derniers devis dans le tableau
 */
function loadRecentDevis(devis) {
    // Trier par date décroissante et prendre les 5 derniers
    const recentDevis = [...devis]
        .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
        .slice(0, 5);

    // Trouver le tableau des devis
    const tbody = findTableBody('devis');
    if (!tbody) return;

    // Générer le HTML
    tbody.innerHTML = recentDevis.map(d => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">${d.numero || 'DEV-' + d.id}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">${d.clientNom || 'Client'}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${Utils.formatCurrency(d.montantTTC)}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">${Utils.getDevisStatutBadge(d.statut)}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
                <a href="écran_détail_d'un_devis.html?id=${d.id}" class="text-primary hover:text-primary/80">Voir</a>
            </td>
        </tr>
    `).join('');
}

/**
 * Charge les dernières factures dans le tableau
 */
function loadRecentFactures(factures) {
    // Trier par date décroissante et prendre les 5 dernières
    const recentFactures = [...factures]
        .sort((a, b) => new Date(b.dateEmission) - new Date(a.dateEmission))
        .slice(0, 5);

    // Trouver le tableau des factures (deuxième tableau ou celui avec "facture" dans le header)
    const tbody = findTableBody('factures');
    if (!tbody) return;

    // Générer le HTML
    tbody.innerHTML = recentFactures.map(f => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">${f.numero || 'FAC-' + f.id}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">${f.clientNom || 'Client'}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${Utils.formatCurrency(f.montantTTC)}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">${Utils.getFactureStatutBadge(f.statutPaiement)}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
                <a href="écran_détail_facture.html?id=${f.id}" class="text-primary hover:text-primary/80">Voir</a>
            </td>
        </tr>
    `).join('');
}

/**
 * Charge les derniers clients ajoutés
 */
function loadRecentClients(clients) {
    // Trier par date de création décroissante
    const recentClients = [...clients]
        .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
        .slice(0, 5);

    // Trouver le tableau des clients
    const tbody = findTableBody('clients');
    if (!tbody) return;

    // Générer le HTML
    tbody.innerHTML = recentClients.map(c => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${c.nom}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${c.email}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${Utils.formatDate(c.dateCreation)}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
                <a href="écran_historique_client.html?id=${c.id}" class="text-primary hover:text-primary/80">Voir</a>
            </td>
        </tr>
    `).join('');
}

/**
 * Trouve le tbody d'un tableau par type
 */
function findTableBody(type) {
    const tables = document.querySelectorAll('table');
    
    for (const table of tables) {
        const thead = table.querySelector('thead');
        if (thead) {
            const headerText = thead.textContent.toLowerCase();
            
            if (type === 'devis' && (headerText.includes('devis') || headerText.includes('id devis'))) {
                return table.querySelector('tbody');
            }
            if (type === 'factures' && headerText.includes('facture')) {
                return table.querySelector('tbody');
            }
            if (type === 'clients' && headerText.includes('client') && !headerText.includes('devis')) {
                return table.querySelector('tbody');
            }
        }
    }
    
    // Fallback: retourner le premier tbody trouvé
    return tables[0]?.querySelector('tbody');
}

/**
 * Gère le clic sur les onglets du dashboard
 */
function setupTabs() {
    const tabs = document.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Supprimer l'état actif des autres onglets
            tabs.forEach(t => {
                t.classList.remove('border-b-primary', 'text-primary');
                t.classList.add('border-b-transparent', 'text-gray-500');
            });
            
            // Activer l'onglet cliqué
            tab.classList.remove('border-b-transparent', 'text-gray-500');
            tab.classList.add('border-b-primary', 'text-primary');
            
            // Charger les données correspondantes
            const tabType = tab.dataset.tab;
            if (tabType === 'devis') {
                loadRecentDevisTab();
            } else if (tabType === 'factures') {
                loadRecentFacturesTab();
            } else if (tabType === 'clients') {
                loadRecentClientsTab();
            }
        });
    });
}

// Initialiser les onglets
document.addEventListener('DOMContentLoaded', setupTabs);
