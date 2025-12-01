/**
 * Devis Form - Formulaire de création/modification de devis
 * Gère le formulaire de la page écran_création_d'un_devis.html
 */

let devisId = null;
let isEditMode = false;
let clients = [];
let produits = [];
let lignesDevis = [];

document.addEventListener('DOMContentLoaded', () => {
    // Récupérer l'ID du devis depuis l'URL si présent
    const urlParams = new URLSearchParams(window.location.search);
    devisId = urlParams.get('id');
    isEditMode = !!devisId;

    init();
});

/**
 * Initialise la page
 */
async function init() {
    try {
        updatePageTitle();
        
        // Charger les données en parallèle
        const [clientsData, produitsData] = await Promise.all([
            API.Clients.getAll(),
            API.Produits.getAll()
        ]);

        clients = clientsData.filter(c => c.actif);
        produits = produitsData.filter(p => p.actif);

        populateClientSelect();
        populateProduitSelect();

        if (isEditMode) {
            await loadDevis();
        } else {
            // Ajouter une première ligne vide
            addLigne();
            setDefaultDates();
        }

        setupEventListeners();
        updateTotals();

    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        Utils.showToast('Erreur lors du chargement des données', 'error');
    }
}

/**
 * Met à jour le titre de la page
 */
function updatePageTitle() {
    const title = document.getElementById('page-title') || document.querySelector('h1, .page-title');
    if (title) {
        title.textContent = isEditMode ? 'Modifier le devis' : 'Nouveau devis';
    }
    
    // Mettre à jour le fil d'Ariane si présent
    const breadcrumb = document.getElementById('breadcrumb-action') || document.querySelector('.breadcrumb-current, nav span:last-child');
    if (breadcrumb) {
        breadcrumb.textContent = isEditMode ? 'Modifier le devis' : 'Nouveau devis';
    }
}

/**
 * Définit les dates par défaut
 */
function setDefaultDates() {
    const dateCreation = document.querySelector('[name="dateCreation"], #dateCreation');
    const dateValidite = document.querySelector('[name="dateValidite"], #dateValidite');

    const today = new Date().toISOString().split('T')[0];
    
    if (dateCreation) dateCreation.value = today;
    
    if (dateValidite) {
        const validite = new Date();
        validite.setDate(validite.getDate() + 30); // Validité de 30 jours par défaut
        dateValidite.value = validite.toISOString().split('T')[0];
    }
}

/**
 * Remplit le sélecteur de clients
 */
function populateClientSelect() {
    const select = document.querySelector('[name="clientId"], #clientId, select');
    if (!select) return;

    select.innerHTML = '<option value="">Sélectionner un client</option>';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = `${client.nom} - ${client.email}`;
        select.appendChild(option);
    });
}

/**
 * Remplit le sélecteur de produits (template)
 */
function populateProduitSelect() {
    // Le select sera créé dynamiquement pour chaque ligne
}

/**
 * Charge le devis existant
 */
async function loadDevis() {
    try {
        const devis = await API.Devis.getById(devisId);
        
        // Remplir les champs
        const clientSelect = document.querySelector('[name="clientId"], #clientId, select');
        if (clientSelect) clientSelect.value = devis.client?.id || '';

        const dateCreation = document.querySelector('[name="dateCreation"], #dateCreation');
        if (dateCreation) dateCreation.value = devis.dateCreation?.split('T')[0] || '';

        const dateValidite = document.querySelector('[name="dateValidite"], #dateValidite');
        if (dateValidite) dateValidite.value = devis.dateValidite?.split('T')[0] || '';

        const notes = document.querySelector('[name="notes"], #notes, textarea');
        if (notes) notes.value = devis.notes || '';

        // Charger les lignes
        if (devis.lignes && devis.lignes.length > 0) {
            lignesDevis = devis.lignes.map(ligne => ({
                produitId: ligne.produit?.id,
                designation: ligne.designation,
                quantite: ligne.quantite,
                prixUnitaireHT: ligne.prixUnitaireHT,
                tauxTVA: ligne.tauxTVA || 20
            }));
            renderLignes();
        } else {
            addLigne();
        }

        updateTotals();

    } catch (error) {
        console.error('Erreur lors du chargement du devis:', error);
        Utils.showToast('Devis introuvable', 'error');
        setTimeout(() => {
            window.location.href = 'écran_liste_des_devis.html';
        }, 2000);
    }
}

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Formulaire
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }

    // Bouton ajouter ligne
    document.querySelectorAll('button').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('ajouter') && (text.includes('ligne') || text.includes('produit'))) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                addLigne();
            });
        } else if (text.includes('annuler') || text.includes('retour')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'écran_liste_des_devis.html';
            });
        }
    });

    // Bouton avec icône add
    document.querySelectorAll('[class*="add-line"], .add-ligne').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            addLigne();
        });
    });
}

/**
 * Ajoute une nouvelle ligne de devis
 */
function addLigne() {
    lignesDevis.push({
        produitId: null,
        designation: '',
        quantite: 1,
        prixUnitaireHT: 0,
        tauxTVA: 20
    });
    renderLignes();
}

/**
 * Supprime une ligne de devis
 */
function removeLigne(index) {
    if (lignesDevis.length > 1) {
        lignesDevis.splice(index, 1);
        renderLignes();
        updateTotals();
    } else {
        Utils.showToast('Le devis doit contenir au moins une ligne', 'warning');
    }
}

/**
 * Affiche les lignes du devis
 */
function renderLignes() {
    const container = document.querySelector('.lignes-container, #lignes-container, tbody');
    if (!container) return;

    container.innerHTML = lignesDevis.map((ligne, index) => `
        <tr class="ligne-devis border-b border-gray-200 dark:border-gray-700" data-index="${index}">
            <td class="px-3 py-2">
                <select onchange="onProduitChange(${index}, this.value)" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
                    <option value="">Sélectionner...</option>
                    ${produits.map(p => `
                        <option value="${p.id}" ${ligne.produitId == p.id ? 'selected' : ''} data-prix="${p.prixUnitaireHT}">
                            ${escapeHtml(p.nom)} - ${Utils.formatCurrency(p.prixUnitaireHT)}
                        </option>
                    `).join('')}
                    <option value="custom" ${ligne.produitId === 'custom' ? 'selected' : ''}>Personnalisé...</option>
                </select>
            </td>
            <td class="px-3 py-2">
                <input type="text" value="${escapeHtml(ligne.designation)}" 
                    onchange="updateLigne(${index}, 'designation', this.value)"
                    placeholder="Description" 
                    class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
            </td>
            <td class="px-3 py-2 w-24">
                <input type="number" value="${ligne.quantite}" min="1" step="1"
                    onchange="updateLigne(${index}, 'quantite', this.value)"
                    class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-center">
            </td>
            <td class="px-3 py-2 w-32">
                <input type="number" value="${ligne.prixUnitaireHT}" min="0" step="0.01"
                    onchange="updateLigne(${index}, 'prixUnitaireHT', this.value)"
                    class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-right">
            </td>
            <td class="px-3 py-2 w-24">
                <select onchange="updateLigne(${index}, 'tauxTVA', this.value)" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
                    <option value="0" ${ligne.tauxTVA == 0 ? 'selected' : ''}>0%</option>
                    <option value="5.5" ${ligne.tauxTVA == 5.5 ? 'selected' : ''}>5.5%</option>
                    <option value="10" ${ligne.tauxTVA == 10 ? 'selected' : ''}>10%</option>
                    <option value="20" ${ligne.tauxTVA == 20 ? 'selected' : ''}>20%</option>
                </select>
            </td>
            <td class="px-3 py-2 w-32 text-right font-medium text-gray-900 dark:text-white">
                ${Utils.formatCurrency(ligne.quantite * ligne.prixUnitaireHT)}
            </td>
            <td class="px-3 py-2 w-12">
                <button type="button" onclick="removeLigne(${index})" class="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors">
                    <span class="material-symbols-outlined text-xl">close</span>
                </button>
            </td>
        </tr>
    `).join('');

    updateTotals();
}

/**
 * Met à jour une ligne
 */
function updateLigne(index, field, value) {
    if (field === 'quantite') {
        lignesDevis[index][field] = parseInt(value) || 1;
    } else if (field === 'prixUnitaireHT' || field === 'tauxTVA') {
        lignesDevis[index][field] = parseFloat(value) || 0;
    } else {
        lignesDevis[index][field] = value;
    }
    
    // Re-render la ligne pour mettre à jour le total
    renderLignes();
}

/**
 * Gère le changement de produit
 */
function onProduitChange(index, produitId) {
    if (produitId === 'custom') {
        lignesDevis[index].produitId = 'custom';
        lignesDevis[index].designation = '';
        lignesDevis[index].prixUnitaireHT = 0;
    } else if (produitId) {
        const produit = produits.find(p => p.id == produitId);
        if (produit) {
            lignesDevis[index].produitId = produit.id;
            lignesDevis[index].designation = produit.nom;
            lignesDevis[index].prixUnitaireHT = produit.prixUnitaireHT;
        }
    }
    
    renderLignes();
}

/**
 * Met à jour les totaux
 */
function updateTotals() {
    let totalHT = 0;
    let totalTVA = 0;

    lignesDevis.forEach(ligne => {
        const montantHT = ligne.quantite * ligne.prixUnitaireHT;
        const montantTVA = montantHT * (ligne.tauxTVA / 100);
        totalHT += montantHT;
        totalTVA += montantTVA;
    });

    const totalTTC = totalHT + totalTVA;

    // Mettre à jour l'affichage
    const htEl = document.querySelector('[data-total-ht], .total-ht, #totalHT');
    const tvaEl = document.querySelector('[data-total-tva], .total-tva, #totalTVA');
    const ttcEl = document.querySelector('[data-total-ttc], .total-ttc, #totalTTC');

    if (htEl) htEl.textContent = Utils.formatCurrency(totalHT);
    if (tvaEl) tvaEl.textContent = Utils.formatCurrency(totalTVA);
    if (ttcEl) ttcEl.textContent = Utils.formatCurrency(totalTTC);

    // Chercher les éléments par leur contexte
    document.querySelectorAll('.totaux-row, .total-row, tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        const valueEl = row.querySelector('td:last-child, span:last-child, .value');
        
        if (valueEl) {
            if (text.includes('total ht') && !text.includes('ttc')) {
                valueEl.textContent = Utils.formatCurrency(totalHT);
            } else if (text.includes('tva')) {
                valueEl.textContent = Utils.formatCurrency(totalTVA);
            } else if (text.includes('ttc') || text.includes('total à payer')) {
                valueEl.textContent = Utils.formatCurrency(totalTTC);
            }
        }
    });
}

/**
 * Gère la soumission du formulaire
 */
async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (!validateForm()) return;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<svg class="animate-spin h-5 w-5 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Enregistrement...';
    }

    try {
        const clientSelect = document.querySelector('[name="clientId"], #clientId, select');
        const dateValidite = document.querySelector('[name="dateValidite"], #dateValidite');
        const notes = document.querySelector('[name="notes"], #notes, textarea');

        const devisData = {
            client: { id: parseInt(clientSelect?.value) },
            dateValidite: dateValidite?.value,
            notes: notes?.value || '',
            statut: 'BROUILLON',
            lignes: lignesDevis.map(l => ({
                produit: l.produitId && l.produitId !== 'custom' ? { id: parseInt(l.produitId) } : null,
                designation: l.designation,
                quantite: l.quantite,
                prixUnitaireHT: l.prixUnitaireHT,
                tauxTVA: l.tauxTVA
            }))
        };

        if (isEditMode) {
            await API.Devis.update(devisId, devisData);
            Utils.showToast('Devis modifié avec succès', 'success');
        } else {
            const result = await API.Devis.create(devisData);
            Utils.showToast('Devis créé avec succès', 'success');
            devisId = result.id;
        }

        setTimeout(() => {
            window.location.href = `écran_détail_d'un_devis.html?id=${devisId}`;
        }, 1500);

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        Utils.showToast('Erreur lors de l\'enregistrement du devis', 'error');
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = isEditMode ? 'Modifier' : 'Créer';
        }
    }
}

/**
 * Valide le formulaire
 */
function validateForm() {
    const clientSelect = document.querySelector('[name="clientId"], #clientId, select');
    
    if (!clientSelect?.value) {
        Utils.showToast('Veuillez sélectionner un client', 'error');
        return false;
    }

    if (lignesDevis.length === 0) {
        Utils.showToast('Le devis doit contenir au moins une ligne', 'error');
        return false;
    }

    const invalidLignes = lignesDevis.filter(l => !l.designation || l.prixUnitaireHT <= 0);
    if (invalidLignes.length > 0) {
        Utils.showToast('Veuillez remplir toutes les lignes correctement', 'error');
        return false;
    }

    return true;
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
window.DevisForm = {
    addLigne,
    removeLigne,
    updateLigne,
    onProduitChange,
    handleSubmit
};
