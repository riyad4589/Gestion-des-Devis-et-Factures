/**
 * Devis Detail - Détail d'un devis
 * Affiche les détails complets d'un devis
 */

let devisId = null;
let devisData = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    devisId = urlParams.get('id');

    if (!devisId) {
        Utils.showToast('Devis non spécifié', 'error');
        setTimeout(() => {
            window.location.href = 'écran_liste_des_devis.html';
        }, 2000);
        return;
    }

    loadDevis();
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
                window.location.href = 'écran_liste_des_devis.html';
            });
        } else if (text.includes('modifier') || iconText === 'edit') {
            btn.addEventListener('click', () => editDevis());
        } else if (text.includes('imprimer') || text.includes('pdf') || iconText === 'print' || iconText === 'picture_as_pdf') {
            btn.addEventListener('click', () => printDevis());
        } else if (text.includes('envoyer') || iconText === 'send') {
            btn.addEventListener('click', () => envoyerDevis());
        } else if (text.includes('accepter') || iconText === 'check_circle') {
            btn.addEventListener('click', () => accepterDevis());
        } else if (text.includes('refuser') || iconText === 'cancel') {
            btn.addEventListener('click', () => refuserDevis());
        } else if (text.includes('convertir') || iconText === 'receipt') {
            btn.addEventListener('click', () => convertirDevis());
        } else if (text.includes('supprimer') || iconText === 'delete') {
            btn.addEventListener('click', () => deleteDevis());
        }
    });
}

/**
 * Charge les détails du devis
 */
async function loadDevis() {
    try {
        devisData = await API.Devis.getById(devisId);
        displayDevis(devisData);
        updateActionButtons();
    } catch (error) {
        console.error('Erreur lors du chargement du devis:', error);
        Utils.showToast('Devis introuvable', 'error');
        setTimeout(() => {
            window.location.href = 'écran_liste_des_devis.html';
        }, 2000);
    }
}

/**
 * Affiche les détails du devis
 */
function displayDevis(devis) {
    // Numéro du devis
    document.querySelectorAll('[data-devis-numero], .devis-numero, h1, h2').forEach(el => {
        if (el.textContent.includes('Devis') || el.classList.contains('devis-numero')) {
            el.textContent = `Devis DEV-${String(devis.id).padStart(4, '0')}`;
        }
    });

    // Statut
    const statusEl = document.querySelector('[data-devis-statut], .devis-statut');
    if (statusEl) {
        statusEl.innerHTML = Utils.getDevisStatusBadge(devis.statut);
    }

    // Informations client
    displayClientInfo(devis.client);

    // Dates
    displayDates(devis);

    // Lignes du devis
    displayLignes(devis.lignes || []);

    // Totaux
    displayTotals(devis);

    // Notes
    const notesEl = document.querySelector('[data-devis-notes], .devis-notes, .notes');
    if (notesEl) {
        notesEl.textContent = devis.notes || 'Aucune note';
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
function displayDates(devis) {
    // Date de création
    document.querySelectorAll('[data-date-creation], .date-creation').forEach(el => {
        el.textContent = Utils.formatDate(devis.dateCreation);
    });

    // Date de validité
    document.querySelectorAll('[data-date-validite], .date-validite').forEach(el => {
        el.textContent = devis.dateValidite ? Utils.formatDate(devis.dateValidite) : 'Non définie';
    });

    // Vérifier si expiré
    if (devis.dateValidite) {
        const validite = new Date(devis.dateValidite);
        const now = new Date();
        if (validite < now && devis.statut === 'ENVOYE') {
            const expireEl = document.querySelector('.expire-warning');
            if (expireEl) {
                expireEl.classList.remove('hidden');
            }
        }
    }
}

/**
 * Affiche les lignes du devis
 */
function displayLignes(lignes) {
    const tbody = document.querySelector('table tbody, .lignes-container');
    if (!tbody) return;

    if (lignes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Aucune ligne dans ce devis
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
function displayTotals(devis) {
    // Total HT
    document.querySelectorAll('[data-total-ht], .total-ht').forEach(el => {
        el.textContent = Utils.formatCurrency(devis.montantHT || 0);
    });

    // Total TVA
    document.querySelectorAll('[data-total-tva], .total-tva').forEach(el => {
        el.textContent = Utils.formatCurrency(devis.montantTVA || 0);
    });

    // Total TTC
    document.querySelectorAll('[data-total-ttc], .total-ttc').forEach(el => {
        el.textContent = Utils.formatCurrency(devis.montantTTC || 0);
    });
}

/**
 * Met à jour la visibilité des boutons d'action selon le statut
 */
function updateActionButtons() {
    const statut = devisData?.statut;

    // Cacher/afficher les boutons selon le statut
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

        // Boutons accepter/refuser - seulement si envoyé
        if (text.includes('accepter') || iconText === 'check_circle' ||
            text.includes('refuser') || iconText === 'cancel') {
            btn.style.display = statut === 'ENVOYE' ? '' : 'none';
        }

        // Bouton convertir - seulement si accepté
        if (text.includes('convertir') || iconText === 'receipt') {
            btn.style.display = statut === 'ACCEPTE' ? '' : 'none';
        }
    });
}

/**
 * Modifier le devis
 */
function editDevis() {
    window.location.href = `écran_création_d'un_devis.html?id=${devisId}`;
}

/**
 * Imprimer/PDF du devis
 */
function printDevis() {
    window.print();
}

/**
 * Envoyer le devis (passer en statut ENVOYE)
 */
async function envoyerDevis() {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir marquer ce devis comme envoyé ?',
        async () => {
            try {
                // Mettre à jour le statut via l'API
                await API.Devis.update(devisId, { ...devisData, statut: 'ENVOYE' });
                Utils.showToast('Devis marqué comme envoyé', 'success');
                loadDevis();
            } catch (error) {
                console.error('Erreur:', error);
                Utils.showToast('Erreur lors de l\'envoi du devis', 'error');
            }
        }
    );
}

/**
 * Accepter le devis
 */
async function accepterDevis() {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir accepter ce devis ?',
        async () => {
            try {
                await API.Devis.valider(devisId);
                Utils.showToast('Devis accepté avec succès', 'success');
                loadDevis();
            } catch (error) {
                console.error('Erreur:', error);
                Utils.showToast('Erreur lors de l\'acceptation du devis', 'error');
            }
        }
    );
}

/**
 * Refuser le devis
 */
async function refuserDevis() {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir refuser ce devis ?',
        async () => {
            try {
                await API.Devis.refuser(devisId);
                Utils.showToast('Devis refusé', 'success');
                loadDevis();
            } catch (error) {
                console.error('Erreur:', error);
                Utils.showToast('Erreur lors du refus du devis', 'error');
            }
        }
    );
}

/**
 * Convertir le devis en facture
 */
async function convertirDevis() {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir convertir ce devis en facture ?',
        async () => {
            try {
                const facture = await API.Devis.convertir(devisId);
                Utils.showToast('Devis converti en facture avec succès', 'success');
                setTimeout(() => {
                    window.location.href = `écran_détail_facture.html?id=${facture.id}`;
                }, 1500);
            } catch (error) {
                console.error('Erreur:', error);
                Utils.showToast('Erreur lors de la conversion du devis', 'error');
            }
        }
    );
}

/**
 * Supprimer le devis
 */
function deleteDevis() {
    Utils.showConfirm(
        'Êtes-vous sûr de vouloir supprimer ce devis ?',
        async () => {
            try {
                await API.Devis.delete(devisId);
                Utils.showToast('Devis supprimé avec succès', 'success');
                setTimeout(() => {
                    window.location.href = 'écran_liste_des_devis.html';
                }, 1500);
            } catch (error) {
                console.error('Erreur:', error);
                Utils.showToast('Erreur lors de la suppression du devis', 'error');
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
window.DevisDetail = {
    loadDevis,
    editDevis,
    printDevis,
    envoyerDevis,
    accepterDevis,
    refuserDevis,
    convertirDevis,
    deleteDevis
};
