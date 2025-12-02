/**
 * Facture Form - Formulaire de création/modification de facture
 * Gère le formulaire de la page écran_création_facture.html
 */

let factureId = null;
let isEditMode = false;
let clients = [];
let produits = [];
let lignesFacture = [];

document.addEventListener('DOMContentLoaded', () => {
    // Récupérer l'ID de la facture depuis l'URL si présent
    const urlParams = new URLSearchParams(window.location.search);
    factureId = urlParams.get('id');
    isEditMode = !!factureId;

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

        if (isEditMode) {
            await loadFacture();
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
        title.textContent = isEditMode ? 'Modifier la facture' : 'Nouvelle facture';
    }
    
    // Mettre à jour le fil d'Ariane si présent
    const breadcrumb = document.getElementById('breadcrumb-action') || document.querySelector('.breadcrumb-current, nav span:last-child');
    if (breadcrumb) {
        breadcrumb.textContent = isEditMode ? 'Modifier la facture' : 'Nouvelle facture';
    }
}

/**
 * Définit les dates par défaut
 */
function setDefaultDates() {
    const dateCreation = document.querySelector('[name="dateCreation"], #dateCreation');
    const dateEcheance = document.querySelector('[name="dateEcheance"], #dateEcheance');

    const today = new Date().toISOString().split('T')[0];
    
    if (dateCreation) dateCreation.value = today;
    
    if (dateEcheance) {
        const echeance = new Date();
        echeance.setDate(echeance.getDate() + 30); // Échéance de 30 jours par défaut
        dateEcheance.value = echeance.toISOString().split('T')[0];
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
 * Charge la facture existante
 */
async function loadFacture() {
    try {
        const facture = await API.Factures.getById(factureId);
        console.log('Facture chargée:', facture);
        
        // Remplir les champs - utiliser clientId du DTO ou client.id en fallback
        const clientSelect = document.querySelector('[name="clientId"], #clientId, select');
        if (clientSelect) {
            const clientIdValue = facture.clientId || facture.client?.id || '';
            clientSelect.value = clientIdValue;
        }

        // Utiliser dateFacture du DTO ou dateCreation en fallback
        const dateCreation = document.querySelector('[name="dateCreation"], #dateCreation');
        if (dateCreation) {
            const dateValue = facture.dateFacture || facture.dateCreation || '';
            dateCreation.value = dateValue ? dateValue.split('T')[0] : '';
        }

        const dateEcheance = document.querySelector('[name="dateEcheance"], #dateEcheance');
        if (dateEcheance && facture.dateEcheance) {
            dateEcheance.value = facture.dateEcheance.split('T')[0];
        }

        const notes = document.querySelector('[name="notes"], #notes, textarea');
        if (notes) notes.value = facture.notes || '';

        // Mode paiement
        const modePaiement = document.querySelector('[name="modePaiement"], #modePaiement');
        if (modePaiement) modePaiement.value = facture.modePaiement || '';

        // Charger les lignes - utiliser produitId du DTO ou produit.id en fallback
        if (facture.lignes && facture.lignes.length > 0) {
            lignesFacture = facture.lignes.map(ligne => ({
                produitId: ligne.produitId || ligne.produit?.id,
                designation: ligne.produitNom || ligne.designation || ligne.produit?.nom || '',
                quantite: parseInt(ligne.quantite) || 1,
                prixUnitaireHT: parseFloat(ligne.prixUnitaireHT) || 0,
                tauxTVA: parseFloat(ligne.tva) || parseFloat(ligne.tauxTVA) || 20
            }));
            renderLignes();
        } else {
            addLigne();
        }

        updateTotals();

    } catch (error) {
        console.error('Erreur lors du chargement de la facture:', error);
        Utils.showToast('Facture introuvable', 'error');
        setTimeout(() => {
            window.location.href = 'écran_factures_(liste).html';
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
                window.location.href = 'écran_factures_(liste).html';
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
 * Ajoute une nouvelle ligne de facture
 */
function addLigne() {
    lignesFacture.push({
        produitId: null,
        designation: '',
        quantite: 1,
        prixUnitaireHT: 0,
        tauxTVA: 20
    });
    renderLignes();
}

/**
 * Supprime une ligne de facture
 */
function removeLigne(index) {
    if (lignesFacture.length > 1) {
        lignesFacture.splice(index, 1);
        renderLignes();
        updateTotals();
    } else {
        Utils.showToast('La facture doit contenir au moins une ligne', 'warning');
    }
}

/**
 * Affiche les lignes de la facture
 */
function renderLignes() {
    const container = document.querySelector('.lignes-container, #lignes-container, tbody');
    if (!container) return;

    container.innerHTML = lignesFacture.map((ligne, index) => `
        <tr class="ligne-facture border-b border-gray-200 dark:border-gray-700" data-index="${index}">
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
        lignesFacture[index][field] = parseInt(value) || 1;
    } else if (field === 'prixUnitaireHT' || field === 'tauxTVA') {
        lignesFacture[index][field] = parseFloat(value) || 0;
    } else {
        lignesFacture[index][field] = value;
    }
    
    renderLignes();
}

/**
 * Gère le changement de produit
 */
function onProduitChange(index, produitId) {
    if (produitId === 'custom') {
        lignesFacture[index].produitId = 'custom';
        lignesFacture[index].designation = '';
        lignesFacture[index].prixUnitaireHT = 0;
    } else if (produitId) {
        const produit = produits.find(p => p.id == produitId);
        if (produit) {
            lignesFacture[index].produitId = produit.id;
            lignesFacture[index].designation = produit.nom;
            lignesFacture[index].prixUnitaireHT = produit.prixUnitaireHT;
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

    lignesFacture.forEach(ligne => {
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
        const dateEcheance = document.querySelector('[name="dateEcheance"], #dateEcheance');
        const notes = document.querySelector('[name="notes"], #notes, textarea');

        const factureData = {
            client: { id: parseInt(clientSelect?.value) },
            dateEcheance: dateEcheance?.value,
            notes: notes?.value || '',
            statut: 'BROUILLON',
            lignes: lignesFacture.map(l => ({
                produit: l.produitId && l.produitId !== 'custom' ? { id: parseInt(l.produitId) } : null,
                designation: l.designation,
                quantite: l.quantite,
                prixUnitaireHT: l.prixUnitaireHT,
                tauxTVA: l.tauxTVA
            }))
        };

        if (isEditMode) {
            await API.Factures.update(factureId, factureData);
            Utils.showToast('Facture modifiée avec succès', 'success');
        } else {
            const result = await API.Factures.create(factureData);
            Utils.showToast('Facture créée avec succès', 'success');
            factureId = result.id;
        }

        setTimeout(() => {
            window.location.href = `écran_détail_facture.html?id=${factureId}`;
        }, 1500);

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        Utils.showToast('Erreur lors de l\'enregistrement de la facture', 'error');
        
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

    if (lignesFacture.length === 0) {
        Utils.showToast('La facture doit contenir au moins une ligne', 'error');
        return false;
    }

    const invalidLignes = lignesFacture.filter(l => !l.designation || l.prixUnitaireHT <= 0);
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
window.FactureForm = {
    addLigne,
    removeLigne,
    updateLigne,
    onProduitChange,
    handleSubmit
};
