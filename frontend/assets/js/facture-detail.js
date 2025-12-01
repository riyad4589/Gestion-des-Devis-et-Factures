/**
 * Facture Detail - Détail d'une facture
 * Affiche les détails complets d'une facture
 */

let factureId = null;
let factureData = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    factureId = urlParams.get('id');

    if (!factureId) {
        Utils.showToast('Facture non spécifiée', 'error');
        setTimeout(() => {
            window.location.href = 'écran_factures_(liste).html';
        }, 2000);
        return;
    }

    loadFacture();
    setupEventListeners();
});

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    document.querySelectorAll('button').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        const icon = btn.querySelector('.material-symbols-outlined');
        const iconText = icon?.textContent || '';

        if (text.includes('retour') || iconText === 'arrow_back') {
            btn.addEventListener('click', () => {
                window.location.href = 'écran_factures_(liste).html';
            });
        } else if (text.includes('modifier') || iconText === 'edit') {
            btn.addEventListener('click', () => editFacture());
        } else if (text.includes('imprimer') || text.includes('pdf') || iconText === 'print' || iconText === 'picture_as_pdf') {
            btn.addEventListener('click', () => printFacture());
        } else if (text.includes('envoyer') || iconText === 'send') {
            btn.addEventListener('click', () => envoyerFacture());
        } else if (text.includes('payer') || text.includes('payé') || iconText === 'paid') {
            btn.addEventListener('click', () => payerFacture());
        } else if (text.includes('annuler') || iconText === 'block') {
            btn.addEventListener('click', () => annulerFacture());
        } else if (text.includes('supprimer') || iconText === 'delete') {
            btn.addEventListener('click', () => deleteFacture());
        }
    });
}

/**
 * Charge les détails de la facture
 */
async function loadFacture() {
    try {
        factureData = await API.Factures.getById(factureId);
        displayFacture(factureData);
        updateActionButtons();
    } catch (error) {
        console.error('Erreur lors du chargement de la facture:', error);
        Utils.showToast('Facture introuvable', 'error');
        setTimeout(() => {
            window.location.href = 'écran_factures_(liste).html';
        }, 2000);
    }
}

/**
 * Affiche les détails de la facture
 */
function displayFacture(facture) {
    // Numéro de la facture
    document.querySelectorAll('[data-facture-numero], .facture-numero, h1, h2').forEach(el => {
        if (el.textContent.includes('Facture') || el.classList.contains('facture-numero')) {
            el.textContent = `Facture FAC-${String(facture.id).padStart(4, '0')}`;
        }
    });

    // Statut
    const statusEl = document.querySelector('[data-facture-statut], .facture-statut');
    if (statusEl) {
        statusEl.innerHTML = Utils.getFactureStatusBadge(facture.statut);
    }

    // Informations client
    displayClientInfo(facture.client);

    // Dates
    displayDates(facture);

    // Lignes de la facture
    displayLignes(facture.lignes || []);

    // Totaux
    displayTotals(facture);

    // Notes
    const notesEl = document.querySelector('[data-facture-notes], .facture-notes, .notes');
    if (notesEl) {
        notesEl.textContent = facture.notes || 'Aucune note';
    }

    // Référence devis si converti
    if (facture.devis) {
        const devisRef = document.querySelector('[data-devis-reference], .devis-reference');
        if (devisRef) {
            devisRef.innerHTML = `
                <span class="text-gray-600">Créée depuis le devis</span>
                <a href="écran_détail_d'un_devis.html?id=${facture.devis.id}" class="text-primary hover:underline">
                    DEV-${String(facture.devis.id).padStart(4, '0')}
                </a>
            `;
        }
    }
}

/**
 * Affiche les informations du client
 */
function displayClientInfo(client) {
    if (!client) return;

    // Nom
    document.querySelectorAll('[data-client-nom], .client-nom').forEach(el => {
        el.textContent = client.nom;
    });

    // Email
    document.querySelectorAll('[data-client-email], .client-email').forEach(el => {
        el.textContent = client.email;
    });

    // Téléphone
    document.querySelectorAll('[data-client-telephone], .client-telephone').forEach(el => {
        el.textContent = client.telephone || 'Non renseigné';
    });

    // Adresse
    document.querySelectorAll('[data-client-adresse], .client-adresse').forEach(el => {
        el.textContent = client.adresse || 'Non renseignée';
    });

    // Bloc info client
    const clientBlock = document.querySelector('.client-info, .client-block');
    if (clientBlock) {
        clientBlock.innerHTML = `
            <p class="font-semibold text-gray-900 dark:text-white">${escapeHtml(client.nom)}</p>
            <p class="text-gray-600 dark:text-gray-400">${escapeHtml(client.email)}</p>
            <p class="text-gray-600 dark:text-gray-400">${escapeHtml(client.telephone || '')}</p>
            <p class="text-gray-600 dark:text-gray-400">${escapeHtml(client.adresse || '')}</p>
        `;
    }
}

/**
 * Affiche les dates
 */
function displayDates(facture) {
    // Date de création
    document.querySelectorAll('[data-date-creation], .date-creation').forEach(el => {
        el.textContent = Utils.formatDate(facture.dateCreation);
    });

    // Date d'échéance
    document.querySelectorAll('[data-date-echeance], .date-echeance').forEach(el => {
        el.textContent = facture.dateEcheance ? Utils.formatDate(facture.dateEcheance) : 'Non définie';
    });

    // Date de paiement
    if (facture.datePaiement) {
        document.querySelectorAll('[data-date-paiement], .date-paiement').forEach(el => {
            el.textContent = Utils.formatDate(facture.datePaiement);
        });
    }

    // Vérifier si en retard
    if (facture.dateEcheance && facture.statut === 'ENVOYEE') {
        const echeance = new Date(facture.dateEcheance);
        const now = new Date();
        if (echeance < now) {
            const retardEl = document.querySelector('.retard-warning');
            if (retardEl) {
                retardEl.classList.remove('hidden');
            }
        }
    }
}

/**
 * Affiche les lignes de la facture
 */
function displayLignes(lignes) {
    const tbody = document.querySelector('table tbody, .lignes-container');
    if (!tbody) return;

    if (lignes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Aucune ligne dans cette facture
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lignes.map((ligne, index) => {
        const totalLigne = ligne.quantite * ligne.prixUnitaireHT;
        return `
            <tr class="border-b border-gray-200 dark:border-gray-700">
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${index + 1}</td>
                <td class="px-4 py-3">
                    <p class="font-medium text-gray-900 dark:text-white">${escapeHtml(ligne.designation)}</p>
                    ${ligne.produit ? `<p class="text-sm text-gray-500">${escapeHtml(ligne.produit.categorie || '')}</p>` : ''}
                </td>
                <td class="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">${ligne.quantite}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">${Utils.formatCurrency(ligne.prixUnitaireHT)}</td>
                <td class="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">${ligne.tauxTVA || 20}%</td>
                <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">${Utils.formatCurrency(totalLigne)}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Affiche les totaux
 */
function displayTotals(facture) {
    // Total HT
    document.querySelectorAll('[data-total-ht], .total-ht').forEach(el => {
        el.textContent = Utils.formatCurrency(facture.montantHT || 0);
    });

    // Total TVA
    document.querySelectorAll('[data-total-tva], .total-tva').forEach(el => {
        el.textContent = Utils.formatCurrency(facture.montantTVA || 0);
    });

    // Total TTC
    document.querySelectorAll('[data-total-ttc], .total-ttc').forEach(el => {
        el.textContent = Utils.formatCurrency(facture.montantTTC || 0);
    });
}

/**
 * Met à jour la visibilité des boutons d'action selon le statut
 */
function updateActionButtons() {
    const statut = factureData?.statut;

    document.querySelectorAll('button').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        const icon = btn.querySelector('.material-symbols-outlined');
        const iconText = icon?.textContent || '';

        // Bouton modifier - seulement si brouillon
        if (text.includes('modifier') || iconText === 'edit') {
            btn.style.display = statut === 'BROUILLON' ? '' : 'none';
        }

        // Bouton envoyer - seulement si brouillon
        if (text.includes('envoyer') || iconText === 'send') {
            btn.style.display = statut === 'BROUILLON' ? '' : 'none';
        }

        // Bouton payer - seulement si envoyée ou en retard
        if (text.includes('payer') || text.includes('payé') || iconText === 'paid') {
            btn.style.display = (statut === 'ENVOYEE' || statut === 'EN_RETARD') ? '' : 'none';
        }

        // Bouton annuler - si pas déjà annulée ou payée
        if (text.includes('annuler') || iconText === 'block') {
            btn.style.display = (statut !== 'ANNULEE' && statut !== 'PAYEE') ? '' : 'none';
        }
    });
}

/**
 * Modifier la facture
 */
function editFacture() {
    window.location.href = `écran_création_facture.html?id=${factureId}`;
}

/**
 * Imprimer/PDF de la facture
 */
function printFacture() {
    window.print();
}

/**
 * Envoyer la facture (passer en statut ENVOYEE)
 */
async function envoyerFacture() {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir marquer cette facture comme envoyée ?',
        async () => {
            try {
                await API.Factures.update(factureId, { ...factureData, statut: 'ENVOYEE' });
                Utils.showToast('Facture marquée comme envoyée', 'success');
                loadFacture();
            } catch (error) {
                console.error('Erreur:', error);
                Utils.showToast('Erreur lors de l\'envoi de la facture', 'error');
            }
        }
    );
}

/**
 * Marquer la facture comme payée
 */
async function payerFacture() {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir marquer cette facture comme payée ?',
        async () => {
            try {
                await API.Factures.payer(factureId);
                Utils.showToast('Facture marquée comme payée', 'success');
                loadFacture();
            } catch (error) {
                console.error('Erreur:', error);
                Utils.showToast('Erreur lors du paiement de la facture', 'error');
            }
        }
    );
}

/**
 * Annuler la facture
 */
async function annulerFacture() {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir annuler cette facture ?',
        async () => {
            try {
                await API.Factures.update(factureId, { ...factureData, statut: 'ANNULEE' });
                Utils.showToast('Facture annulée', 'success');
                loadFacture();
            } catch (error) {
                console.error('Erreur:', error);
                Utils.showToast('Erreur lors de l\'annulation de la facture', 'error');
            }
        }
    );
}

/**
 * Supprimer la facture
 */
function deleteFacture() {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir supprimer cette facture ?',
        async () => {
            try {
                await API.Factures.delete(factureId);
                Utils.showToast('Facture supprimée avec succès', 'success');
                setTimeout(() => {
                    window.location.href = 'écran_factures_(liste).html';
                }, 1500);
            } catch (error) {
                console.error('Erreur:', error);
                Utils.showToast('Erreur lors de la suppression de la facture', 'error');
            }
        }
    );
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
window.FactureDetail = {
    loadFacture,
    editFacture,
    printFacture,
    envoyerFacture,
    payerFacture,
    annulerFacture,
    deleteFacture
};
