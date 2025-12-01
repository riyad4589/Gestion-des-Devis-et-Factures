/**
 * Produits - Gestion des produits/services
 * Gère l'affichage, la création, la modification et la suppression des produits
 */

let allProduits = [];
let filteredProduits = [];
let categories = [];

document.addEventListener('DOMContentLoaded', () => {
    loadProduits();
    setupEventListeners();
});

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Bouton nouveau produit
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Nouveau') && btn.textContent.includes('Produit')) {
            btn.addEventListener('click', () => {
                window.location.href = 'modification_produit.html';
            });
        }
    });

    // Recherche
    const searchInput = document.querySelector('input[placeholder*="Rechercher"]');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filterProduits(e.target.value);
        }, 300));
    }

    // Filtres de catégorie
    document.querySelectorAll('[data-category-filter], .category-filter').forEach(filter => {
        filter.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            if (category) {
                filterByCategory(category);
            }
        });
    });
}

/**
 * Charge la liste des produits
 */
async function loadProduits() {
    try {
        showLoading(true);
        allProduits = await API.Produits.getAll();
        filteredProduits = [...allProduits];
        
        // Extraire les catégories uniques
        categories = [...new Set(allProduits.map(p => p.categorie).filter(Boolean))];
        
        renderProduits(filteredProduits);
        renderCategoryFilters();
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        Utils.showToast('Erreur lors du chargement des produits', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Affiche les produits dans le tableau ou la grille
 */
function renderProduits(produits) {
    // Chercher un tableau
    const tbody = document.querySelector('table tbody');
    
    // Chercher une grille de cartes
    const grid = document.querySelector('.products-grid, .grid');

    if (tbody) {
        renderProduitsTable(produits, tbody);
    } else if (grid) {
        renderProduitsGrid(produits, grid);
    }

    // Mettre à jour le compteur
    const countEl = document.querySelector('[data-count], .products-count');
    if (countEl) {
        countEl.textContent = `${produits.length} produit${produits.length > 1 ? 's' : ''}`;
    }
}

/**
 * Affiche les produits en tableau
 */
function renderProduitsTable(produits, tbody) {
    if (produits.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                    Aucun produit trouvé
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = produits.map(produit => `
        <tr class="border-b border-gray-200 dark:border-gray-800 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
            <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary">inventory_2</span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900 dark:text-white">${escapeHtml(produit.nom)}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${escapeHtml(produit.description || '').substring(0, 50)}${produit.description && produit.description.length > 50 ? '...' : ''}</p>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    ${escapeHtml(produit.categorie || 'Non catégorisé')}
                </span>
            </td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${Utils.formatCurrency(produit.prixUnitaireHT)}</td>
            <td class="px-4 py-3">
                ${getStockBadge(produit.stock)}
            </td>
            <td class="px-4 py-3">
                ${produit.actif 
                    ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Actif</span>'
                    : '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"><span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span>Inactif</span>'
                }
            </td>
            <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                    <button onclick="editProduit(${produit.id})" class="p-2 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors" title="Modifier">
                        <span class="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button onclick="deleteProduit(${produit.id}, '${escapeHtml(produit.nom)}')" class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
                        <span class="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Affiche les produits en grille de cartes
 */
function renderProduitsGrid(produits, grid) {
    if (produits.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <span class="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                Aucun produit trouvé
            </div>
        `;
        return;
    }

    grid.innerHTML = produits.map(produit => `
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-3">
                <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary text-2xl">inventory_2</span>
                </div>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    ${escapeHtml(produit.categorie || 'Non catégorisé')}
                </span>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">${escapeHtml(produit.nom)}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">${escapeHtml(produit.description || 'Aucune description')}</p>
            <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-primary">${Utils.formatCurrency(produit.prixUnitaireHT)}</span>
                ${getStockBadge(produit.stock)}
            </div>
            <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button onclick="editProduit(${produit.id})" class="flex-1 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                    Modifier
                </button>
                <button onclick="deleteProduit(${produit.id}, '${escapeHtml(produit.nom)}')" class="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <span class="material-symbols-outlined text-xl">delete</span>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Génère le badge de stock
 */
function getStockBadge(stock) {
    if (stock === null || stock === undefined) {
        return '<span class="text-sm text-gray-500">-</span>';
    }
    
    if (stock === 0) {
        return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Rupture</span>';
    } else if (stock <= 10) {
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">${stock} en stock</span>`;
    } else {
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">${stock} en stock</span>`;
    }
}

/**
 * Affiche les filtres de catégorie
 */
function renderCategoryFilters() {
    const filterContainer = document.querySelector('.category-filters, [data-category-filters]');
    if (!filterContainer || categories.length === 0) return;

    filterContainer.innerHTML = `
        <button data-category="all" class="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-white">Tous</button>
        ${categories.map(cat => `
            <button data-category="${escapeHtml(cat)}" class="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                ${escapeHtml(cat)}
            </button>
        `).join('')}
    `;

    // Ajouter les événements
    filterContainer.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            filterByCategory(btn.dataset.category);
            
            // Mettre à jour le style actif
            filterContainer.querySelectorAll('button').forEach(b => {
                b.classList.remove('bg-primary', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-700', 'dark:bg-gray-800', 'dark:text-gray-300');
            });
            btn.classList.remove('bg-gray-100', 'text-gray-700', 'dark:bg-gray-800', 'dark:text-gray-300');
            btn.classList.add('bg-primary', 'text-white');
        });
    });
}

/**
 * Filtre les produits par recherche
 */
function filterProduits(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        filteredProduits = [...allProduits];
    } else {
        filteredProduits = allProduits.filter(produit => 
            produit.nom.toLowerCase().includes(term) ||
            (produit.description && produit.description.toLowerCase().includes(term)) ||
            (produit.categorie && produit.categorie.toLowerCase().includes(term))
        );
    }
    
    renderProduits(filteredProduits);
}

/**
 * Filtre les produits par catégorie
 */
function filterByCategory(category) {
    if (category === 'all') {
        filteredProduits = [...allProduits];
    } else {
        filteredProduits = allProduits.filter(p => p.categorie === category);
    }
    
    renderProduits(filteredProduits);
}

/**
 * Modifier un produit
 */
function editProduit(id) {
    window.location.href = `modification_produit.html?id=${id}`;
}

/**
 * Supprimer un produit
 */
function deleteProduit(id, nom) {
    Utils.showConfirm(
        `Êtes-vous sûr de vouloir supprimer le produit "${nom}" ?`,
        async () => {
            try {
                await API.Produits.delete(id);
                Utils.showToast('Produit supprimé avec succès', 'success');
                loadProduits();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                Utils.showToast('Erreur lors de la suppression du produit', 'error');
            }
        }
    );
}

/**
 * Affiche/masque l'indicateur de chargement
 */
function showLoading(show) {
    const container = document.querySelector('table tbody, .products-grid, .grid');
    if (!container) return;

    if (show) {
        container.innerHTML = `
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
window.ProduitsPage = {
    loadProduits,
    editProduit,
    deleteProduit,
    filterProduits,
    filterByCategory
};
