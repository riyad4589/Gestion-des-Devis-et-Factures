/**
 * Clients - Gestion des clients
 * Gère l'affichage, la création, la modification et la suppression des clients
 */

let allClients = [];
let filteredClients = [];

document.addEventListener('DOMContentLoaded', () => {
    loadClients();
    setupEventListeners();
});

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Bouton nouveau client
    const newClientBtn = document.querySelector('button');
    if (newClientBtn && newClientBtn.textContent.includes('Nouveau Client')) {
        newClientBtn.addEventListener('click', () => {
            window.location.href = 'modification_client.html';
        });
    }

    // Recherche
    const searchInput = document.querySelector('input[placeholder*="Rechercher"]');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filterClients(e.target.value);
        }, 300));
    }

    // Filtres de statut
    const statusFilter = document.querySelector('button:has(p:contains("Statut"))') || 
                         document.querySelector('[data-filter="status"]');
    if (statusFilter) {
        statusFilter.addEventListener('click', () => {
            showStatusFilterMenu(statusFilter);
        });
    }
}

/**
 * Charge la liste des clients
 */
async function loadClients() {
    try {
        showLoading(true);
        allClients = await API.Clients.getAll();
        filteredClients = [...allClients];
        renderClients(filteredClients);
    } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
        Utils.showToast('Erreur lors du chargement des clients', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Affiche les clients dans le tableau
 */
function renderClients(clients) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    if (clients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-4xl mb-2 block">person_off</span>
                    Aucun client trouvé
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = clients.map(client => `
        <tr class="border-b border-gray-200 dark:border-gray-800 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${escapeHtml(client.nom)}</td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${escapeHtml(client.email)}</td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${escapeHtml(client.telephone || '-')}</td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${Utils.formatDate(client.dateCreation)}</td>
            <td class="px-4 py-3">
                ${client.actif 
                    ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Actif</span>'
                    : '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"><span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span>Inactif</span>'
                }
            </td>
            <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                    <button onclick="viewClient(${client.id})" class="p-2 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors" title="Voir l'historique">
                        <span class="material-symbols-outlined text-xl">visibility</span>
                    </button>
                    <button onclick="editClient(${client.id})" class="p-2 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors" title="Modifier">
                        <span class="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button onclick="deleteClient(${client.id}, '${escapeHtml(client.nom)}')" class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
                        <span class="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Filtre les clients par recherche
 */
function filterClients(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        filteredClients = [...allClients];
    } else {
        filteredClients = allClients.filter(client => 
            client.nom.toLowerCase().includes(term) ||
            client.email.toLowerCase().includes(term) ||
            (client.telephone && client.telephone.includes(term))
        );
    }
    
    renderClients(filteredClients);
}

/**
 * Filtre les clients par statut
 */
function filterByStatus(status) {
    if (status === 'all') {
        filteredClients = [...allClients];
    } else if (status === 'active') {
        filteredClients = allClients.filter(c => c.actif);
    } else if (status === 'inactive') {
        filteredClients = allClients.filter(c => !c.actif);
    }
    
    renderClients(filteredClients);
}

/**
 * Voir l'historique d'un client
 */
function viewClient(id) {
    window.location.href = `écran_historique_client.html?id=${id}`;
}

/**
 * Modifier un client
 */
function editClient(id) {
    window.location.href = `modification_client.html?id=${id}`;
}

/**
 * Supprimer (désactiver) un client
 */
function deleteClient(id, nom) {
    Utils.showConfirm(
        `Êtes-vous sûr de vouloir supprimer le client "${nom}" ?`,
        async () => {
            try {
                await API.Clients.delete(id);
                Utils.showToast('Client supprimé avec succès', 'success');
                loadClients();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                Utils.showToast('Erreur lors de la suppression du client', 'error');
            }
        }
    );
}

/**
 * Affiche le menu de filtre par statut
 */
function showStatusFilterMenu(button) {
    // Supprimer un menu existant
    const existingMenu = document.getElementById('statusFilterMenu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const menu = document.createElement('div');
    menu.id = 'statusFilterMenu';
    menu.className = 'absolute mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50';
    menu.innerHTML = `
        <button onclick="filterByStatus('all'); this.parentElement.remove();" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg">Tous</button>
        <button onclick="filterByStatus('active'); this.parentElement.remove();" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Actifs</button>
        <button onclick="filterByStatus('inactive'); this.parentElement.remove();" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg">Inactifs</button>
    `;

    button.parentElement.style.position = 'relative';
    button.parentElement.appendChild(menu);

    // Fermer le menu au clic ailleurs
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && e.target !== button) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
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
                <td colspan="6" class="px-6 py-8 text-center">
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
window.ClientsPage = {
    loadClients,
    viewClient,
    editClient,
    deleteClient,
    filterClients,
    filterByStatus
};
