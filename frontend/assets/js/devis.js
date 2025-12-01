/**
 * Devis - Gestion de la liste des devis
 * Gère l'affichage, la recherche et les actions sur les devis
 */

let allDevis = [];
let filteredDevis = [];

document.addEventListener('DOMContentLoaded', () => {
    loadDevis();
    setupEventListeners();
});

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Bouton nouveau devis
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Nouveau') && btn.textContent.includes('Devis')) {
            btn.addEventListener('click', () => {
                window.location.href = "écran_création_d'un_devis.html";
            });
        }
    });

    // Recherche
    const searchInput = document.querySelector('input[placeholder*="Rechercher"]');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filterDevis(e.target.value);
        }, 300));
    }

    // Filtres de statut
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
 * Charge la liste des devis
 */
async function loadDevis() {
    try {
        showLoading(true);
        allDevis = await API.Devis.getAll();
        filteredDevis = [...allDevis];
        renderDevis(filteredDevis);
        updateStats();
    } catch (error) {
        console.error('Erreur lors du chargement des devis:', error);
        Utils.showToast('Erreur lors du chargement des devis', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Met à jour les statistiques
 */
function updateStats() {
    const stats = {
        total: allDevis.length,
        brouillon: allDevis.filter(d => d.statut === 'BROUILLON').length,
        envoye: allDevis.filter(d => d.statut === 'ENVOYE').length,
        accepte: allDevis.filter(d => d.statut === 'ACCEPTE').length,
        refuse: allDevis.filter(d => d.statut === 'REFUSE').length,
        expire: allDevis.filter(d => d.statut === 'EXPIRE').length,
        converti: allDevis.filter(d => d.statut === 'CONVERTI').length
    };

    // Mettre à jour les compteurs dans l'interface
    document.querySelectorAll('[data-stat]').forEach(el => {
        const stat = el.dataset.stat;
        if (stats[stat] !== undefined) {
            el.textContent = stats[stat];
        }
    });

    // Chercher et mettre à jour les badges de filtre
    document.querySelectorAll('.filter-badge, .status-count').forEach(el => {
        const text = el.parentElement?.textContent?.toLowerCase() || '';
        if (text.includes('brouillon')) el.textContent = stats.brouillon;
        else if (text.includes('envoyé')) el.textContent = stats.envoye;
        else if (text.includes('accepté')) el.textContent = stats.accepte;
        else if (text.includes('refusé')) el.textContent = stats.refuse;
        else if (text.includes('expiré')) el.textContent = stats.expire;
        else if (text.includes('converti')) el.textContent = stats.converti;
    });
}

/**
 * Affiche les devis dans le tableau
 */
function renderDevis(devis) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    if (devis.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-4xl mb-2 block">description</span>
                    Aucun devis trouvé
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = devis.map(d => `
        <tr class="border-b border-gray-200 dark:border-gray-800 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
            <td class="px-4 py-3">
                <span class="font-medium text-gray-900 dark:text-white">DEV-${String(d.id).padStart(4, '0')}</span>
            </td>
            <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span class="text-sm font-medium text-primary">${d.client?.nom?.charAt(0) || '?'}</span>
                    </div>
                    <span class="text-sm text-gray-900 dark:text-white">${escapeHtml(d.client?.nom || 'Client inconnu')}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${Utils.formatDate(d.dateCreation)}</td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${d.dateValidite ? Utils.formatDate(d.dateValidite) : '-'}</td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${Utils.formatCurrency(d.montantTTC)}</td>
            <td class="px-4 py-3">${Utils.getDevisStatusBadge(d.statut)}</td>
            <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                    <button onclick="viewDevis(${d.id})" class="p-2 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors" title="Voir">
                        <span class="material-symbols-outlined text-xl">visibility</span>
                    </button>
                    ${d.statut === 'BROUILLON' ? `
                        <button onclick="editDevis(${d.id})" class="p-2 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors" title="Modifier">
                            <span class="material-symbols-outlined text-xl">edit</span>
                        </button>
                    ` : ''}
                    ${d.statut === 'ENVOYE' ? `
                        <button onclick="accepterDevis(${d.id})" class="p-2 rounded-lg hover:bg-green-100 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors" title="Accepter">
                            <span class="material-symbols-outlined text-xl">check_circle</span>
                        </button>
                        <button onclick="refuserDevis(${d.id})" class="p-2 rounded-lg hover:bg-red-100 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors" title="Refuser">
                            <span class="material-symbols-outlined text-xl">cancel</span>
                        </button>
                    ` : ''}
                    ${d.statut === 'ACCEPTE' ? `
                        <button onclick="convertirDevis(${d.id})" class="p-2 rounded-lg hover:bg-blue-100 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors" title="Convertir en facture">
                            <span class="material-symbols-outlined text-xl">receipt</span>
                        </button>
                    ` : ''}
                    <button onclick="deleteDevis(${d.id})" class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
                        <span class="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Filtre les devis par recherche
 */
function filterDevis(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        filteredDevis = [...allDevis];
    } else {
        filteredDevis = allDevis.filter(devis => 
            String(devis.id).includes(term) ||
            (devis.client?.nom && devis.client.nom.toLowerCase().includes(term)) ||
            (devis.statut && devis.statut.toLowerCase().includes(term))
        );
    }
    
    renderDevis(filteredDevis);
}

/**
 * Filtre les devis par statut
 */
function filterByStatus(status) {
    if (status === 'all' || !status) {
        filteredDevis = [...allDevis];
    } else {
        filteredDevis = allDevis.filter(d => d.statut === status.toUpperCase());
    }
    
    renderDevis(filteredDevis);
}

/**
 * Voir le détail d'un devis
 */
function viewDevis(id) {
    window.location.href = `écran_détail_d'un_devis.html?id=${id}`;
}

/**
 * Modifier un devis
 */
function editDevis(id) {
    window.location.href = `écran_création_d'un_devis.html?id=${id}`;
}

/**
 * Accepter un devis
 */
async function accepterDevis(id) {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir accepter ce devis ?',
        async () => {
            try {
                await API.Devis.valider(id);
                Utils.showToast('Devis accepté avec succès', 'success');
                loadDevis();
            } catch (error) {
                console.error('Erreur lors de l\'acceptation:', error);
                Utils.showToast('Erreur lors de l\'acceptation du devis', 'error');
            }
        }
    );
}

/**
 * Refuser un devis
 */
async function refuserDevis(id) {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir refuser ce devis ?',
        async () => {
            try {
                await API.Devis.refuser(id);
                Utils.showToast('Devis refusé', 'success');
                loadDevis();
            } catch (error) {
                console.error('Erreur lors du refus:', error);
                Utils.showToast('Erreur lors du refus du devis', 'error');
            }
        }
    );
}

/**
 * Convertir un devis en facture
 */
async function convertirDevis(id) {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir convertir ce devis en facture ?',
        async () => {
            try {
                const facture = await API.Devis.convertir(id);
                Utils.showToast('Devis converti en facture avec succès', 'success');
                // Rediriger vers la facture créée
                setTimeout(() => {
                    window.location.href = `écran_détail_facture.html?id=${facture.id}`;
                }, 1500);
            } catch (error) {
                console.error('Erreur lors de la conversion:', error);
                Utils.showToast('Erreur lors de la conversion du devis', 'error');
            }
        }
    );
}

/**
 * Supprimer un devis
 */
function deleteDevis(id) {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir supprimer ce devis ?',
        async () => {
            try {
                await API.Devis.delete(id);
                Utils.showToast('Devis supprimé avec succès', 'success');
                loadDevis();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                Utils.showToast('Erreur lors de la suppression du devis', 'error');
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
window.DevisPage = {
    loadDevis,
    viewDevis,
    editDevis,
    accepterDevis,
    refuserDevis,
    convertirDevis,
    deleteDevis,
    filterDevis,
    filterByStatus
};
