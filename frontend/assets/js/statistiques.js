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
        // Charger les données détaillées en parallèle
        const [clients, devis, factures, produits] = await Promise.all([
            API.Clients.getAll().catch(() => []),
            API.Devis.getAll().catch(() => []),
            API.Factures.getAll().catch(() => []),
            API.Produits.getAll().catch(() => [])
        ]);

        // Calculer les statistiques
        const calculatedStats = calculateStats(clients, devis, factures, produits, period);

        // Afficher les KPIs
        displayKPIs(null, calculatedStats);

        // Afficher les graphiques
        displayCharts(calculatedStats);

        // Afficher les tableaux
        displayTables(calculatedStats);

    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        // Afficher les données vides au lieu d'une erreur
        displayEmptyState();
    }
}

/**
 * Calcule les statistiques
 */
function calculateStats(clients, devis, factures, produits, period) {
    const now = new Date();
    const startOfPeriod = getStartOfPeriod(now, period);

    // Filtrer par période (utiliser dateFacture ou dateCreation)
    const devisPeriod = devis.filter(d => {
        const date = d.dateDevis || d.dateCreation;
        return date && new Date(date) >= startOfPeriod;
    });
    const facturesPeriod = factures.filter(f => {
        const date = f.dateFacture || f.dateCreation;
        return date && new Date(date) >= startOfPeriod;
    });

    // Statistiques de base
    const stats = {
        // Clients
        totalClients: clients.length,
        clientsActifs: clients.filter(c => c.actif).length,
        nouveauxClients: clients.filter(c => {
            const date = c.dateCreation;
            return date && new Date(date) >= startOfPeriod;
        }).length,

        // Devis - Statuts: EN_COURS, VALIDE, TRANSFORME_EN_FACTURE, ANNULE
        totalDevis: devis.length,
        devisPeriod: devisPeriod.length,
        devisEnCours: devis.filter(d => d.statut === 'EN_COURS').length,
        devisValide: devis.filter(d => d.statut === 'VALIDE').length,
        devisTransforme: devis.filter(d => d.statut === 'TRANSFORME_EN_FACTURE').length,
        // Devis acceptés = VALIDE + TRANSFORME_EN_FACTURE (accepté par le client)
        devisAcceptes: devis.filter(d => d.statut === 'VALIDE' || d.statut === 'TRANSFORME_EN_FACTURE').length,
        montantDevis: devis.reduce((sum, d) => sum + (parseFloat(d.totalTTC || d.montantTTC) || 0), 0),
        montantDevisPeriod: devisPeriod.reduce((sum, d) => sum + (parseFloat(d.totalTTC || d.montantTTC) || 0), 0),

        // Factures - Statuts: NON_PAYEE, PARTIELLEMENT_PAYEE, PAYEE, ANNULEE
        totalFactures: factures.length,
        facturesPeriod: facturesPeriod.length,
        facturesPayees: factures.filter(f => f.statut === 'PAYEE').length,
        facturesEnAttente: factures.filter(f => f.statut === 'NON_PAYEE' || f.statut === 'PARTIELLEMENT_PAYEE').length,
        facturesAnnulees: factures.filter(f => f.statut === 'ANNULEE').length,
        chiffreAffaires: factures.filter(f => f.statut === 'PAYEE').reduce((sum, f) => sum + (parseFloat(f.montantTTC) || 0), 0),
        chiffreAffairesPeriod: facturesPeriod.filter(f => f.statut === 'PAYEE').reduce((sum, f) => sum + (parseFloat(f.montantTTC) || 0), 0),
        montantEnAttente: factures.filter(f => f.statut === 'NON_PAYEE' || f.statut === 'PARTIELLEMENT_PAYEE').reduce((sum, f) => sum + (parseFloat(f.montantTTC) || 0), 0),

        // Produits
        totalProduits: produits.length,
        produitsActifs: produits.filter(p => p.actif).length,
        produitsEnRupture: produits.filter(p => p.stock !== null && p.stock === 0).length,
        produitsFaibleStock: produits.filter(p => p.stock !== null && p.stock > 0 && p.stock <= 10).length,

        // Taux de conversion (devis transformés en facture)
        tauxConversion: devis.length > 0 
            ? Math.round((devis.filter(d => d.statut === 'TRANSFORME_EN_FACTURE').length / devis.length) * 100) 
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
            // Utiliser dateFacture ou dateCreation selon ce qui est disponible
            const dateStr = f.dateFacture || f.dateCreation;
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return d.getMonth() === month && d.getFullYear() === year;
        });
        
        months.push({
            label: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
            count: facturesMois.length,
            montant: facturesMois.reduce((sum, f) => sum + (parseFloat(f.montantTTC) || 0), 0)
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
        // Utiliser clientId et clientNom du DTO
        const clientId = f.clientId || (f.client ? f.client.id : null);
        const clientNom = f.clientNom || (f.client ? f.client.nom : null);
        
        if (clientId) {
            if (!clientStats[clientId]) {
                clientStats[clientId] = {
                    id: clientId,
                    nom: clientNom || 'Client inconnu',
                    count: 0,
                    montant: 0
                };
            }
            clientStats[clientId].count++;
            clientStats[clientId].montant += parseFloat(f.montantTTC) || 0;
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
        if (f.lignes && Array.isArray(f.lignes)) {
            f.lignes.forEach(l => {
                // Utiliser produitId et produitNom du DTO
                const produitId = l.produitId || (l.produit ? l.produit.id : null);
                const produitNom = l.produitNom || (l.produit ? l.produit.nom : null);
                
                if (produitId) {
                    if (!produitStats[produitId]) {
                        produitStats[produitId] = {
                            id: produitId,
                            nom: produitNom || 'Produit inconnu',
                            quantite: 0,
                            montant: 0
                        };
                    }
                    produitStats[produitId].quantite += parseInt(l.quantite) || 0;
                    produitStats[produitId].montant += parseFloat(l.totalLigneHT) || ((parseInt(l.quantite) || 0) * (parseFloat(l.prixUnitaireHT) || 0));
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
    if (statCA) statCA.textContent = formatCurrency(calculatedStats.chiffreAffaires);
    
    const statCATrend = document.getElementById('stat-ca-trend');
    if (statCATrend) {
        const taux = calculatedStats.tauxConversion || 0;
        statCATrend.textContent = taux + '% taux de conversion';
    }
    
    const statFacturesPayees = document.getElementById('stat-factures-payees');
    if (statFacturesPayees) statFacturesPayees.textContent = calculatedStats.facturesPayees || 0;
    
    const statFacturesTotal = document.getElementById('stat-factures-total');
    if (statFacturesTotal) statFacturesTotal.textContent = 'sur ' + (calculatedStats.totalFactures || 0) + ' factures';
    
    const statDevisAcceptes = document.getElementById('stat-devis-acceptes');
    if (statDevisAcceptes) statDevisAcceptes.textContent = calculatedStats.devisAcceptes || 0;
    
    const statDevisTotal = document.getElementById('stat-devis-total');
    if (statDevisTotal) statDevisTotal.textContent = 'sur ' + (calculatedStats.totalDevis || 0) + ' devis';
    
    const statNouveauxClients = document.getElementById('stat-nouveaux-clients');
    if (statNouveauxClients) statNouveauxClients.textContent = calculatedStats.nouveauxClients || 0;
    
    const statClientsTotal = document.getElementById('stat-clients-total');
    if (statClientsTotal) statClientsTotal.textContent = (calculatedStats.totalClients || 0) + ' clients au total';
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
                borderRadius: 6,
                barThickness: 40,
                maxBarThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toLocaleString('fr-MA') + ' DH';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000) {
                                return (value / 1000).toFixed(0) + 'K DH';
                            }
                            return value.toLocaleString('fr-MA') + ' DH';
                        },
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: { size: 12, weight: '500' }
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
            labels: ['Devis acceptés', 'Devis en cours', 'Factures payées', 'Factures non payées'],
            datasets: [{
                data: [
                    stats.devisAcceptes || 0,
                    stats.devisEnCours || 0,
                    stats.facturesPayees || 0,
                    stats.facturesEnAttente || 0
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.85)',
                    'rgba(234, 179, 8, 0.85)',
                    'rgba(17, 82, 212, 0.85)',
                    'rgba(239, 68, 68, 0.85)'
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(234, 179, 8, 1)',
                    'rgba(17, 82, 212, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8
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
                <div class="flex flex-col">
                    <span class="font-medium text-gray-900 dark:text-white">${escapeHtml(item.nom || 'Client inconnu')}</span>
                    <span class="text-xs text-gray-500">${item.count} facture${item.count > 1 ? 's' : ''}</span>
                </div>
            </div>
            <span class="font-bold text-primary">${formatCurrency(item.montant)}</span>
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
                <div class="flex flex-col">
                    <span class="font-medium text-gray-900 dark:text-white">${escapeHtml(item.nom || 'Produit inconnu')}</span>
                    <span class="text-xs text-gray-500">${item.quantite} vendu${item.quantite > 1 ? 's' : ''}</span>
                </div>
            </div>
            <span class="font-bold text-primary">${formatCurrency(item.montant)}</span>
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

/**
 * Formate un montant en devise (DH)
 */
function formatCurrency(amount) {
    if (amount == null || isNaN(amount)) return '0,00 DH';
    return parseFloat(amount).toLocaleString('fr-MA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' DH';
}

/**
 * Affiche un état vide lorsqu'il n'y a pas de données
 */
function displayEmptyState() {
    // KPIs
    const statCA = document.getElementById('stat-ca');
    if (statCA) statCA.textContent = '0 DH';
    
    const statCATrend = document.getElementById('stat-ca-trend');
    if (statCATrend) statCATrend.textContent = 'Aucune donnée';
    
    const statFacturesPayees = document.getElementById('stat-factures-payees');
    if (statFacturesPayees) statFacturesPayees.textContent = '0';
    
    const statFacturesTotal = document.getElementById('stat-factures-total');
    if (statFacturesTotal) statFacturesTotal.textContent = 'sur 0 factures';
    
    const statDevisAcceptes = document.getElementById('stat-devis-acceptes');
    if (statDevisAcceptes) statDevisAcceptes.textContent = '0';
    
    const statDevisTotal = document.getElementById('stat-devis-total');
    if (statDevisTotal) statDevisTotal.textContent = 'sur 0 devis';
    
    const statNouveauxClients = document.getElementById('stat-nouveaux-clients');
    if (statNouveauxClients) statNouveauxClients.textContent = '0';
    
    const statClientsTotal = document.getElementById('stat-clients-total');
    if (statClientsTotal) statClientsTotal.textContent = '0 clients au total';

    // Containers
    const topClients = document.getElementById('top-clients');
    if (topClients) topClients.innerHTML = '<p class="text-center py-4 text-gray-500">Aucune donnée disponible</p>';
    
    const topProducts = document.getElementById('top-products');
    if (topProducts) topProducts.innerHTML = '<p class="text-center py-4 text-gray-500">Aucune donnée disponible</p>';
}

// Export pour utilisation globale
window.StatsPage = {
    loadStatistiques
};
