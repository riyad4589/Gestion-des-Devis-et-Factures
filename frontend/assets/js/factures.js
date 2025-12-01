/**
 * Factures - Gestion de la liste des factures
 * Gère l'affichage, la recherche et les actions sur les factures
 */

let allFactures = [];
let filteredFactures = [];

document.addEventListener('DOMContentLoaded', () => {
    loadFactures();
    setupEventListeners();
});

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Bouton nouvelle facture
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Nouvelle') && btn.textContent.includes('Facture')) {
            btn.addEventListener('click', () => {
                window.location.href = "écran_création_facture.html";
            });
        }
    });

    // Recherche
    const searchInput = document.querySelector('#search-input, input[placeholder*="Rechercher"]');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filterFactures(e.target.value);
        }, 300));
    }

    // Select de statut natif
    const statusSelect = document.getElementById('status-filter');
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            filterByStatus(e.target.value);
        });
    }

    // Filtres de statut (boutons)
    setupStatusFilters();
}

/**
 * Configure les filtres de statut
 */
function setupStatusFilters() {
    const filterBtns = document.querySelectorAll('[data-status-filter], .status-filter');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const status = btn.dataset.status || btn.dataset.statusFilter;
            filterByStatus(status);
            
            // Mettre à jour le style actif
            filterBtns.forEach(b => b.classList.remove('bg-primary', 'text-white'));
            btn.classList.add('bg-primary', 'text-white');
        });
    });
}

/**
 * Charge la liste des factures
 */
async function loadFactures() {
    try {
        showLoading(true);
        allFactures = await API.Factures.getAll();
        filteredFactures = [...allFactures];
        renderFactures(filteredFactures);
        updateStats();
    } catch (error) {
        console.error('Erreur lors du chargement des factures:', error);
        Utils.showToast('Erreur lors du chargement des factures', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Met à jour les statistiques
 */
function updateStats() {
    const stats = {
        total: allFactures.length,
        brouillon: allFactures.filter(f => f.statut === 'BROUILLON').length,
        envoyee: allFactures.filter(f => f.statut === 'ENVOYEE').length,
        payee: allFactures.filter(f => f.statut === 'PAYEE').length,
        enRetard: allFactures.filter(f => f.statut === 'EN_RETARD').length,
        annulee: allFactures.filter(f => f.statut === 'ANNULEE').length
    };

    // Calculer les montants
    const montantTotal = allFactures.reduce((sum, f) => sum + (f.montantTTC || 0), 0);
    const montantPaye = allFactures.filter(f => f.statut === 'PAYEE').reduce((sum, f) => sum + (f.montantTTC || 0), 0);
    const montantEnAttente = allFactures.filter(f => f.statut === 'ENVOYEE' || f.statut === 'EN_RETARD').reduce((sum, f) => sum + (f.montantTTC || 0), 0);

    // Mettre à jour les compteurs dans l'interface
    document.querySelectorAll('[data-stat]').forEach(el => {
        const stat = el.dataset.stat;
        if (stats[stat] !== undefined) {
            el.textContent = stats[stat];
        }
    });

    // Mettre à jour les montants
    document.querySelectorAll('[data-montant]').forEach(el => {
        const type = el.dataset.montant;
        if (type === 'total') el.textContent = Utils.formatCurrency(montantTotal);
        else if (type === 'paye') el.textContent = Utils.formatCurrency(montantPaye);
        else if (type === 'attente') el.textContent = Utils.formatCurrency(montantEnAttente);
    });
}

/**
 * Affiche les factures dans le tableau
 */
function renderFactures(factures) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    if (factures.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
                    Aucune facture trouvée
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = factures.map(f => `
        <tr class="border-b border-gray-200 dark:border-gray-800 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
            <td class="px-4 py-3">
                <span class="font-medium text-gray-900 dark:text-white">${f.numeroFacture || `FAC-${String(f.id).padStart(4, '0')}`}</span>
            </td>
            <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span class="text-sm font-medium text-primary">${f.client?.nom?.charAt(0) || '?'}</span>
                    </div>
                    <span class="text-sm text-gray-900 dark:text-white">${escapeHtml(f.client?.nom || 'Client inconnu')}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${Utils.formatDate(f.dateFacture)}</td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">-</td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${Utils.formatCurrency(f.montantTTC)}</td>
            <td class="px-4 py-3">${Utils.getFactureStatusBadge(f.statut)}</td>
            <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                    <button onclick="viewFacture(${f.id})" class="p-2 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors" title="Voir">
                        <span class="material-symbols-outlined text-xl">visibility</span>
                    </button>
                    ${f.statut === 'BROUILLON' ? `
                        <button onclick="editFacture(${f.id})" class="p-2 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors" title="Modifier">
                            <span class="material-symbols-outlined text-xl">edit</span>
                        </button>
                    ` : ''}
                    ${f.statut === 'ENVOYEE' || f.statut === 'EN_RETARD' ? `
                        <button onclick="payerFacture(${f.id})" class="p-2 rounded-lg hover:bg-green-100 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors" title="Marquer comme payée">
                            <span class="material-symbols-outlined text-xl">paid</span>
                        </button>
                    ` : ''}
                    <button onclick="deleteFacture(${f.id})" class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
                        <span class="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Filtre les factures par recherche
 */
function filterFactures(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        filteredFactures = [...allFactures];
    } else {
        filteredFactures = allFactures.filter(facture => 
            String(facture.id).includes(term) ||
            (facture.client?.nom && facture.client.nom.toLowerCase().includes(term)) ||
            (facture.statut && facture.statut.toLowerCase().includes(term))
        );
    }
    
    renderFactures(filteredFactures);
}

/**
 * Filtre les factures par statut
 */
function filterByStatus(status) {
    if (status === 'all' || !status) {
        filteredFactures = [...allFactures];
    } else {
        filteredFactures = allFactures.filter(f => f.statut === status.toUpperCase());
    }
    
    renderFactures(filteredFactures);
}

/**
 * Voir le détail d'une facture
 */
function viewFacture(id) {
    window.location.href = `écran_détail_facture.html?id=${id}`;
}

/**
 * Modifier une facture
 */
function editFacture(id) {
    window.location.href = `écran_création_facture.html?id=${id}`;
}

/**
 * Marquer une facture comme payée
 */
async function payerFacture(id) {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir marquer cette facture comme payée ?',
        async () => {
            try {
                await API.Factures.payer(id);
                Utils.showToast('Facture marquée comme payée', 'success');
                loadFactures();
            } catch (error) {
                console.error('Erreur lors du paiement:', error);
                Utils.showToast('Erreur lors du paiement de la facture', 'error');
            }
        }
    );
}

/**
 * Supprimer une facture
 */
function deleteFacture(id) {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir supprimer cette facture ?',
        async () => {
            try {
                await API.Factures.delete(id);
                Utils.showToast('Facture supprimée avec succès', 'success');
                loadFactures();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                Utils.showToast('Erreur lors de la suppression de la facture', 'error');
            }
        }
    );
}

/**
 * Affiche/masque l'indicateur de chargement
 */
function showLoading(show) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    if (show) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center">
                    <div class="inline-flex items-center gap-2 text-gray-500">
                        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Chargement...
                    </div>
                </td>
            </tr>
        `;
    }
}

/**
 * Fonction debounce pour la recherche
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
window.FacturesPage = {
    loadFactures,
    viewFacture,
    editFacture,
    payerFacture,
    deleteFacture,
    filterFactures,
    filterByStatus
};

// Exposer les fonctions globalement pour le HTML onclick
window.viewFacture = viewFacture;
window.editFacture = editFacture;
window.payerFacture = payerFacture;
window.deleteFacture = deleteFacture;
window.filterByStatus = filterByStatus;
