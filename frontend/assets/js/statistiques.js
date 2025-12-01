/**
 * Statistiques - Page de statistiques et tableaux de bord
 * Affiche les graphiques et KPIs de l'application
 */

let revenueChart = null;
let statusChart = null;

document.addEventListener('DOMContentLoaded', () => {
    loadStatistiques();
    setupEventListeners();
});

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Filtre de période (select)
    const periodSelect = document.getElementById('period-filter');
    if (periodSelect) {
        periodSelect.addEventListener('change', (e) => {
            loadStatistiques(e.target.value);
        });
    }

    // Filtres de période (boutons)
    document.querySelectorAll('[data-period], .period-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            const period = btn.dataset.period;
            loadStatistiques(period);
            
            // Mettre à jour le style actif
            document.querySelectorAll('[data-period], .period-filter').forEach(b => {
                b.classList.remove('bg-primary', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-700');
            });
            btn.classList.remove('bg-gray-100', 'text-gray-700');
            btn.classList.add('bg-primary', 'text-white');
        });
    });
}

/**
 * Charge les statistiques
 */
async function loadStatistiques(period = 'month') {
    try {
        // Charger les données des stats
        const stats = await API.Statistiques.getAll();
        
        // Charger les données détaillées en parallèle
        const [clients, devis, factures, produits] = await Promise.all([
            API.Clients.getAll(),
            API.Devis.getAll(),
            API.Factures.getAll(),
            API.Produits.getAll()
        ]);

        // Calculer les statistiques
        const calculatedStats = calculateStats(clients, devis, factures, produits, period);

        // Afficher les KPIs
        displayKPIs(stats, calculatedStats);

        // Afficher les graphiques
        displayCharts(calculatedStats);

        // Afficher les tableaux
        displayTables(calculatedStats);

    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        Utils.showToast('Erreur lors du chargement des statistiques', 'error');
    }
}

/**
 * Calcule les statistiques
 */
function calculateStats(clients, devis, factures, produits, period) {
    const now = new Date();
    const startOfPeriod = getStartOfPeriod(now, period);

    // Filtrer par période
    const devisPeriod = devis.filter(d => new Date(d.dateCreation) >= startOfPeriod);
    const facturesPeriod = factures.filter(f => new Date(f.dateCreation) >= startOfPeriod);

    // Statistiques de base
    const stats = {
        // Clients
        totalClients: clients.length,
        clientsActifs: clients.filter(c => c.actif).length,
        nouveauxClients: clients.filter(c => new Date(c.dateCreation) >= startOfPeriod).length,

        // Devis
        totalDevis: devis.length,
        devisPeriod: devisPeriod.length,
        devisBrouillon: devis.filter(d => d.statut === 'BROUILLON').length,
        devisEnvoye: devis.filter(d => d.statut === 'ENVOYE').length,
        devisAccepte: devis.filter(d => d.statut === 'ACCEPTE').length,
        devisRefuse: devis.filter(d => d.statut === 'REFUSE').length,
        devisConverti: devis.filter(d => d.statut === 'CONVERTI').length,
        montantDevis: devis.reduce((sum, d) => sum + (d.montantTTC || 0), 0),
        montantDevisPeriod: devisPeriod.reduce((sum, d) => sum + (d.montantTTC || 0), 0),

        // Factures
        totalFactures: factures.length,
        facturesPeriod: facturesPeriod.length,
        facturesPayees: factures.filter(f => f.statut === 'PAYEE').length,
        facturesEnAttente: factures.filter(f => f.statut === 'ENVOYEE').length,
        facturesEnRetard: factures.filter(f => f.statut === 'EN_RETARD').length,
        chiffreAffaires: factures.filter(f => f.statut === 'PAYEE').reduce((sum, f) => sum + (f.montantTTC || 0), 0),
        chiffreAffairesPeriod: facturesPeriod.filter(f => f.statut === 'PAYEE').reduce((sum, f) => sum + (f.montantTTC || 0), 0),
        montantEnAttente: factures.filter(f => f.statut === 'ENVOYEE' || f.statut === 'EN_RETARD').reduce((sum, f) => sum + (f.montantTTC || 0), 0),

        // Produits
        totalProduits: produits.length,
        produitsActifs: produits.filter(p => p.actif).length,
        produitsEnRupture: produits.filter(p => p.stock !== null && p.stock === 0).length,
        produitsFaibleStock: produits.filter(p => p.stock !== null && p.stock > 0 && p.stock <= 10).length,

        // Taux de conversion
        tauxConversion: devis.length > 0 
            ? Math.round((devis.filter(d => d.statut === 'CONVERTI').length / devis.length) * 100) 
            : 0,

        // Evolution mensuelle
        evolutionMensuelle: calculateMonthlyEvolution(factures),

        // Top clients
        topClients: calculateTopClients(clients, factures),

        // Top produits
        topProduits: calculateTopProduits(produits, factures)
    };

    return stats;
}

/**
 * Obtient le début de la période
 */
function getStartOfPeriod(date, period) {
    const start = new Date(date);
    
    switch (period) {
        case 'week':
            start.setDate(start.getDate() - 7);
            break;
        case 'month':
            start.setMonth(start.getMonth() - 1);
            break;
        case 'quarter':
            start.setMonth(start.getMonth() - 3);
            break;
        case 'year':
            start.setFullYear(start.getFullYear() - 1);
            break;
        default:
            start.setMonth(start.getMonth() - 1);
    }
    
    return start;
}

/**
 * Calcule l'évolution mensuelle
 */
function calculateMonthlyEvolution(factures) {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const facturesMois = factures.filter(f => {
            const d = new Date(f.dateCreation);
            return d.getMonth() === month && d.getFullYear() === year;
        });
        
        months.push({
            label: date.toLocaleDateString('fr-FR', { month: 'short' }),
            count: facturesMois.length,
            montant: facturesMois.reduce((sum, f) => sum + (f.montantTTC || 0), 0)
        });
    }
    
    return months;
}

/**
 * Calcule les top clients
 */
function calculateTopClients(clients, factures) {
    const clientStats = {};
    
    factures.forEach(f => {
        if (f.client) {
            const clientId = f.client.id;
            if (!clientStats[clientId]) {
                clientStats[clientId] = {
                    client: f.client,
                    count: 0,
                    montant: 0
                };
            }
            clientStats[clientId].count++;
            clientStats[clientId].montant += f.montantTTC || 0;
        }
    });
    
    return Object.values(clientStats)
        .sort((a, b) => b.montant - a.montant)
        .slice(0, 5);
}

/**
 * Calcule les top produits
 */
function calculateTopProduits(produits, factures) {
    const produitStats = {};
    
    factures.forEach(f => {
        if (f.lignes) {
            f.lignes.forEach(l => {
                if (l.produit) {
                    const produitId = l.produit.id;
                    if (!produitStats[produitId]) {
                        produitStats[produitId] = {
                            produit: l.produit,
                            quantite: 0,
                            montant: 0
                        };
                    }
                    produitStats[produitId].quantite += l.quantite || 0;
                    produitStats[produitId].montant += (l.quantite || 0) * (l.prixUnitaireHT || 0);
                }
            });
        }
    });
    
    return Object.values(produitStats)
        .sort((a, b) => b.montant - a.montant)
        .slice(0, 5);
}

/**
 * Affiche les KPIs
 */
function displayKPIs(apiStats, calculatedStats) {
    // Mettre à jour les éléments par ID
    const statCA = document.getElementById('stat-ca');
    if (statCA) statCA.textContent = Utils.formatCurrency(calculatedStats.chiffreAffaires);
    
    const statCATrend = document.getElementById('stat-ca-trend');
    if (statCATrend) statCATrend.textContent = '+' + calculatedStats.tauxConversion + '% ce mois';
    
    const statFacturesPayees = document.getElementById('stat-factures-payees');
    if (statFacturesPayees) statFacturesPayees.textContent = calculatedStats.facturesPayees;
    
    const statFacturesTotal = document.getElementById('stat-factures-total');
    if (statFacturesTotal) statFacturesTotal.textContent = 'sur ' + calculatedStats.totalFactures + ' factures';
    
    const statDevisAcceptes = document.getElementById('stat-devis-acceptes');
    if (statDevisAcceptes) statDevisAcceptes.textContent = calculatedStats.devisAccepte;
    
    const statDevisTotal = document.getElementById('stat-devis-total');
    if (statDevisTotal) statDevisTotal.textContent = 'sur ' + calculatedStats.totalDevis + ' devis';
    
    const statNouveauxClients = document.getElementById('stat-nouveaux-clients');
    if (statNouveauxClients) statNouveauxClients.textContent = calculatedStats.nouveauxClients;
    
    const statClientsTotal = document.getElementById('stat-clients-total');
    if (statClientsTotal) statClientsTotal.textContent = calculatedStats.totalClients + ' clients au total';
}

/**
 * Affiche les graphiques
 */
function displayCharts(stats) {
    // Graphique évolution du chiffre d'affaires avec Chart.js
    displayRevenueChart(stats.evolutionMensuelle);
    
    // Graphique répartition des statuts avec Chart.js
    displayStatusChart(stats);
}

/**
 * Affiche le graphique d'évolution du chiffre d'affaires
 */
function displayRevenueChart(data) {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas) return;

    // Détruire le graphique existant si présent
    if (revenueChart) {
        revenueChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                label: 'Chiffre d\'affaires (DH)',
                data: data.map(d => d.montant),
                backgroundColor: 'rgba(17, 82, 212, 0.7)',
                borderColor: 'rgba(17, 82, 212, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('fr-MA') + ' DH';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Affiche le graphique de répartition des statuts
 */
function displayStatusChart(stats) {
    const canvas = document.getElementById('status-chart');
    if (!canvas) return;

    // Détruire le graphique existant si présent
    if (statusChart) {
        statusChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Devis acceptés', 'Devis en attente', 'Factures payées', 'Factures en attente'],
            datasets: [{
                data: [
                    stats.devisAccepte,
                    stats.devisEnvoye + stats.devisBrouillon,
                    stats.facturesPayees,
                    stats.facturesEnAttente + stats.facturesEnRetard
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                    'rgba(17, 82, 212, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(234, 179, 8, 1)',
                    'rgba(17, 82, 212, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Affiche les tableaux
 */
function displayTables(stats) {
    // Top clients
    displayTopClients(stats.topClients);
    
    // Top produits
    displayTopProduits(stats.topProduits);
}

/**
 * Affiche le top clients
 */
function displayTopClients(topClients) {
    const container = document.getElementById('top-clients');
    if (!container) return;

    if (!topClients || topClients.length === 0) {
        container.innerHTML = '<p class="text-center py-4 text-gray-500">Aucune donnée disponible</p>';
        return;
    }

    container.innerHTML = topClients.map((item, index) => `
        <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-bold">${index + 1}</span>
                <span class="font-medium text-gray-900 dark:text-white">${escapeHtml(item.client?.nom || 'Inconnu')}</span>
            </div>
            <span class="font-bold text-primary">${Utils.formatCurrency(item.montant)}</span>
        </div>
    `).join('');
}

/**
 * Affiche le top produits
 */
function displayTopProduits(topProduits) {
    const container = document.getElementById('top-products');
    if (!container) return;

    if (!topProduits || topProduits.length === 0) {
        container.innerHTML = '<p class="text-center py-4 text-gray-500">Aucune donnée disponible</p>';
        return;
    }

    container.innerHTML = topProduits.map((item, index) => `
        <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-bold">${index + 1}</span>
                <div>
                    <span class="font-medium text-gray-900 dark:text-white">${escapeHtml(item.produit?.nom || 'Inconnu')}</span>
                    <span class="text-sm text-gray-500 ml-2">(${item.quantite} vendus)</span>
                </div>
            </div>
            <span class="font-bold text-primary">${Utils.formatCurrency(item.montant)}</span>
        </div>
    `).join('');
}

/**
 * Définit la valeur d'un élément
 */
function setElementValue(selector, value) {
    document.querySelectorAll(selector).forEach(el => {
        el.textContent = value;
    });
}

/**
 * Échappe les caractères HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export pour utilisation globale
window.StatsPage = {
    loadStatistiques
};
