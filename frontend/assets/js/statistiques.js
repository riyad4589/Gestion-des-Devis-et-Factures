/**
 * Statistiques - Page de statistiques et tableaux de bord
 * Affiche les graphiques et KPIs de l'application
 */

document.addEventListener('DOMContentLoaded', () => {
    loadStatistiques();
    setupEventListeners();
});

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Filtres de période
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

    // Sélecteur de date personnalisée
    const dateRange = document.querySelector('[data-date-range], .date-range');
    if (dateRange) {
        dateRange.addEventListener('change', () => {
            // Charger les stats pour la période personnalisée
        });
    }
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
    // Chiffre d'affaires
    setElementValue('[data-kpi="ca"], .kpi-ca', Utils.formatCurrency(calculatedStats.chiffreAffaires));
    
    // Montant en attente
    setElementValue('[data-kpi="attente"], .kpi-attente', Utils.formatCurrency(calculatedStats.montantEnAttente));
    
    // Total clients
    setElementValue('[data-kpi="clients"], .kpi-clients', calculatedStats.totalClients);
    
    // Total devis
    setElementValue('[data-kpi="devis"], .kpi-devis', calculatedStats.totalDevis);
    
    // Total factures
    setElementValue('[data-kpi="factures"], .kpi-factures', calculatedStats.totalFactures);
    
    // Taux de conversion
    setElementValue('[data-kpi="conversion"], .kpi-conversion', `${calculatedStats.tauxConversion}%`);
    
    // Factures payées
    setElementValue('[data-kpi="payees"], .kpi-payees', calculatedStats.facturesPayees);
    
    // Factures en retard
    setElementValue('[data-kpi="retard"], .kpi-retard', calculatedStats.facturesEnRetard);
    
    // Produits
    setElementValue('[data-kpi="produits"], .kpi-produits', calculatedStats.totalProduits);
    
    // Mettre à jour les éléments basés sur le contenu
    document.querySelectorAll('.stat-card, .kpi-card, .bg-white').forEach(card => {
        const label = card.querySelector('.stat-label, .kpi-label, p, span')?.textContent?.toLowerCase() || '';
        const value = card.querySelector('.stat-value, .kpi-value, h2, h3');
        
        if (!value) return;
        
        if (label.includes('chiffre') || label.includes('revenus')) {
            value.textContent = Utils.formatCurrency(calculatedStats.chiffreAffaires);
        } else if (label.includes('attente')) {
            value.textContent = Utils.formatCurrency(calculatedStats.montantEnAttente);
        } else if (label.includes('client')) {
            value.textContent = calculatedStats.totalClients;
        } else if (label.includes('devis') && !label.includes('facture')) {
            value.textContent = calculatedStats.totalDevis;
        } else if (label.includes('facture')) {
            value.textContent = calculatedStats.totalFactures;
        } else if (label.includes('conversion')) {
            value.textContent = `${calculatedStats.tauxConversion}%`;
        }
    });
}

/**
 * Affiche les graphiques
 */
function displayCharts(stats) {
    // Graphique évolution mensuelle
    displayEvolutionChart(stats.evolutionMensuelle);
    
    // Graphique répartition devis
    displayDevisChart(stats);
    
    // Graphique répartition factures
    displayFacturesChart(stats);
}

/**
 * Affiche le graphique d'évolution
 */
function displayEvolutionChart(data) {
    const container = document.querySelector('[data-chart="evolution"], #evolution-chart, .evolution-chart');
    if (!container) return;

    // Créer un graphique simple en barres
    const maxMontant = Math.max(...data.map(d => d.montant));
    
    container.innerHTML = `
        <div class="flex items-end justify-between h-48 gap-2">
            ${data.map(d => `
                <div class="flex-1 flex flex-col items-center">
                    <div class="w-full bg-primary/20 rounded-t" style="height: ${maxMontant > 0 ? (d.montant / maxMontant * 100) : 0}%">
                        <div class="w-full h-full bg-primary rounded-t opacity-80 hover:opacity-100 transition-opacity"></div>
                    </div>
                    <span class="text-xs text-gray-500 mt-2">${d.label}</span>
                </div>
            `).join('')}
        </div>
        <div class="text-center mt-4 text-sm text-gray-500">
            Évolution du chiffre d'affaires sur 6 mois
        </div>
    `;
}

/**
 * Affiche le graphique de répartition des devis
 */
function displayDevisChart(stats) {
    const container = document.querySelector('[data-chart="devis"], #devis-chart, .devis-chart');
    if (!container) return;

    const total = stats.totalDevis || 1;
    const data = [
        { label: 'Brouillon', value: stats.devisBrouillon, color: 'bg-gray-400' },
        { label: 'Envoyé', value: stats.devisEnvoye, color: 'bg-blue-400' },
        { label: 'Accepté', value: stats.devisAccepte, color: 'bg-green-400' },
        { label: 'Refusé', value: stats.devisRefuse, color: 'bg-red-400' },
        { label: 'Converti', value: stats.devisConverti, color: 'bg-purple-400' }
    ];

    container.innerHTML = `
        <div class="space-y-3">
            ${data.map(d => `
                <div class="flex items-center gap-3">
                    <div class="w-24 text-sm text-gray-600">${d.label}</div>
                    <div class="flex-1 bg-gray-200 rounded-full h-4">
                        <div class="${d.color} h-4 rounded-full transition-all" style="width: ${(d.value / total) * 100}%"></div>
                    </div>
                    <div class="w-12 text-sm text-gray-600 text-right">${d.value}</div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Affiche le graphique de répartition des factures
 */
function displayFacturesChart(stats) {
    const container = document.querySelector('[data-chart="factures"], #factures-chart, .factures-chart');
    if (!container) return;

    const total = stats.totalFactures || 1;
    const data = [
        { label: 'Payées', value: stats.facturesPayees, color: 'bg-green-400' },
        { label: 'En attente', value: stats.facturesEnAttente, color: 'bg-yellow-400' },
        { label: 'En retard', value: stats.facturesEnRetard, color: 'bg-red-400' }
    ];

    container.innerHTML = `
        <div class="space-y-3">
            ${data.map(d => `
                <div class="flex items-center gap-3">
                    <div class="w-24 text-sm text-gray-600">${d.label}</div>
                    <div class="flex-1 bg-gray-200 rounded-full h-4">
                        <div class="${d.color} h-4 rounded-full transition-all" style="width: ${(d.value / total) * 100}%"></div>
                    </div>
                    <div class="w-12 text-sm text-gray-600 text-right">${d.value}</div>
                </div>
            `).join('')}
        </div>
    `;
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
    const container = document.querySelector('[data-table="clients"], #top-clients, .top-clients tbody');
    if (!container) return;

    if (topClients.length === 0) {
        container.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-gray-500">Aucune donnée</td></tr>';
        return;
    }

    container.innerHTML = topClients.map((item, index) => `
        <tr class="border-b border-gray-200 dark:border-gray-700">
            <td class="py-2 px-4">
                <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">${index + 1}</span>
                    <span class="text-gray-900 dark:text-white">${escapeHtml(item.client?.nom || 'Inconnu')}</span>
                </div>
            </td>
            <td class="py-2 px-4 text-center text-gray-600 dark:text-gray-400">${item.count}</td>
            <td class="py-2 px-4 text-right font-medium text-gray-900 dark:text-white">${Utils.formatCurrency(item.montant)}</td>
        </tr>
    `).join('');
}

/**
 * Affiche le top produits
 */
function displayTopProduits(topProduits) {
    const container = document.querySelector('[data-table="produits"], #top-produits, .top-produits tbody');
    if (!container) return;

    if (topProduits.length === 0) {
        container.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-gray-500">Aucune donnée</td></tr>';
        return;
    }

    container.innerHTML = topProduits.map((item, index) => `
        <tr class="border-b border-gray-200 dark:border-gray-700">
            <td class="py-2 px-4">
                <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">${index + 1}</span>
                    <span class="text-gray-900 dark:text-white">${escapeHtml(item.produit?.nom || 'Inconnu')}</span>
                </div>
            </td>
            <td class="py-2 px-4 text-center text-gray-600 dark:text-gray-400">${item.quantite}</td>
            <td class="py-2 px-4 text-right font-medium text-gray-900 dark:text-white">${Utils.formatCurrency(item.montant)}</td>
        </tr>
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
