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
    // Numéro de la facture dans le fil d'ariane
    const breadcrumbNumero = document.getElementById('facture-numero');
    if (breadcrumbNumero) {
        breadcrumbNumero.textContent = facture.numeroFacture || `FAC-${String(facture.id).padStart(4, '0')}`;
    }

    // Informations de la facture
    const infoNumero = document.getElementById('info-numero');
    if (infoNumero) {
        infoNumero.textContent = facture.numeroFacture || `FAC-${String(facture.id).padStart(4, '0')}`;
    }

    const infoDate = document.getElementById('info-date');
    if (infoDate) {
        infoDate.textContent = Utils.formatDate(facture.dateFacture);
    }

    const infoPaiement = document.getElementById('info-paiement');
    if (infoPaiement) {
        const modePaiementLabels = {
            'ESPECES': 'Espèces',
            'CHEQUE': 'Chèque',
            'VIREMENT': 'Virement bancaire',
            'CB': 'Carte bancaire',
            'PRELEVEMENT': 'Prélèvement'
        };
        infoPaiement.textContent = modePaiementLabels[facture.modePaiement] || facture.modePaiement || '--';
    }

    // Statut
    const infoStatut = document.getElementById('info-statut');
    if (infoStatut) {
        const statusConfig = {
            'NON_PAYEE': { text: 'Non payée', class: 'bg-yellow-100 text-yellow-800' },
            'PARTIELLEMENT_PAYEE': { text: 'Partiellement payée', class: 'bg-orange-100 text-orange-800' },
            'PAYEE': { text: 'Payée', class: 'bg-green-100 text-green-800' },
            'ANNULEE': { text: 'Annulée', class: 'bg-red-100 text-red-800' }
        };
        const config = statusConfig[facture.statut] || { text: facture.statut, class: 'bg-gray-100 text-gray-800' };
        infoStatut.textContent = config.text;
        infoStatut.className = `inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.class}`;
    }

    // Devis d'origine
    const devisOrigine = document.getElementById('devis-origine');
    if (devisOrigine) {
        if (facture.devisOrigineId && facture.devisOrigineNumero) {
            devisOrigine.innerHTML = `<a href="écran_détail_d'un_devis.html?id=${facture.devisOrigineId}" class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">${facture.devisOrigineNumero}</a>`;
        } else {
            devisOrigine.textContent = 'Aucun devis associé';
        }
    }

    // Informations client - passer la facture entière car les infos client sont à la racine
    displayClientInfo(facture);

    // Lignes de la facture
    displayLignes(facture.lignes || []);

    // Totaux
    displayTotals(facture);
}

/**
 * Affiche les informations du client
 */
function displayClientInfo(facture) {
    if (!facture) return;

    // Nom - utiliser clientNom du DTO
    const clientName = document.getElementById('client-name');
    if (clientName) {
        clientName.textContent = facture.clientNom || '--';
    }

    // Email - utiliser clientEmail du DTO
    const clientEmail = document.getElementById('client-email');
    if (clientEmail) {
        clientEmail.textContent = facture.clientEmail || '--';
    }

    // Téléphone - utiliser clientTelephone du DTO si disponible
    const clientPhone = document.getElementById('client-phone');
    if (clientPhone) {
        clientPhone.textContent = facture.clientTelephone || 'Non renseigné';
    }

    // Adresse - utiliser clientAdresse du DTO si disponible
    const clientAddress = document.getElementById('client-address');
    if (clientAddress) {
        clientAddress.textContent = facture.clientAdresse || 'Non renseignée';
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
    const tbody = document.getElementById('lines-table-body') || document.querySelector('table tbody');
    if (!tbody) return;

    if (!lignes || lignes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                    Aucune ligne dans cette facture
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lignes.map((ligne) => {
        const produitNom = ligne.produitNom || 'Produit inconnu';
        const totalLigne = (ligne.quantite || 0) * (ligne.prixUnitaireHT || 0);
        const tva = ligne.tva || 20;
        
        return `
            <tr class="border-b border-gray-200 dark:border-gray-700">
                <td class="px-4 py-3">
                    <p class="font-medium text-gray-900 dark:text-white">${escapeHtml(produitNom)}</p>
                </td>
                <td class="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">${ligne.quantite}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">${Utils.formatCurrency(ligne.prixUnitaireHT)}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">${tva}%</td>
                <td class="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">${Utils.formatCurrency(totalLigne)}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Affiche les totaux
 */
function displayTotals(facture) {
    // Total HT
    const totalHt = document.getElementById('total-ht');
    if (totalHt) {
        totalHt.textContent = Utils.formatCurrency(facture.montantHT || 0);
    }

    // Total TVA
    const totalTva = document.getElementById('total-tva');
    if (totalTva) {
        totalTva.textContent = Utils.formatCurrency(facture.montantTVA || 0);
    }

    // Total TTC
    const totalTtc = document.getElementById('total-ttc');
    if (totalTtc) {
        totalTtc.textContent = Utils.formatCurrency(facture.montantTTC || 0);
    }
}

/**
 * Met à jour la visibilité des boutons d'action selon le statut
 */
function updateActionButtons() {
    const statut = factureData?.statut;

    // Bouton modifier
    const btnEdit = document.getElementById('btn-edit');
    if (btnEdit) {
        btnEdit.style.display = (statut === 'NON_PAYEE') ? '' : 'none';
    }
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
