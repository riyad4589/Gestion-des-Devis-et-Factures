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
    // Numéro du devis dans le fil d'ariane
    const breadcrumbNumero = document.getElementById('devis-numero');
    if (breadcrumbNumero) {
        breadcrumbNumero.textContent = devis.numeroDevis || `DEV-${String(devis.id).padStart(4, '0')}`;
    }

    // Informations du devis
    const infoNumero = document.getElementById('info-numero');
    if (infoNumero) {
        infoNumero.textContent = devis.numeroDevis || `DEV-${String(devis.id).padStart(4, '0')}`;
    }

    const infoDate = document.getElementById('info-date');
    if (infoDate) {
        infoDate.textContent = Utils.formatDate(devis.dateDevis);
    }

    // Statut
    const infoStatut = document.getElementById('info-statut');
    if (infoStatut) {
        const statusConfig = {
            'EN_COURS': { text: 'En cours', class: 'bg-yellow-100 text-yellow-800' },
            'VALIDE': { text: 'Validé', class: 'bg-green-100 text-green-800' },
            'TRANSFORME_EN_FACTURE': { text: 'Converti', class: 'bg-blue-100 text-blue-800' },
            'ANNULE': { text: 'Annulé', class: 'bg-red-100 text-red-800' }
        };
        const config = statusConfig[devis.statut] || { text: devis.statut, class: 'bg-gray-100 text-gray-800' };
        infoStatut.textContent = config.text;
        infoStatut.className = `inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.class}`;
    }

    // Informations client
    displayClientInfo(devis);

    // Lignes du devis
    displayLignes(devis.lignes || []);

    // Totaux
    displayTotals(devis);

    // Commentaire
    const commentaireEl = document.getElementById('commentaire');
    if (commentaireEl) {
        commentaireEl.textContent = devis.commentaire || 'Aucun commentaire';
    }
}

/**
 * Affiche les informations du client
 */
function displayClientInfo(devis) {
    if (!devis) return;

    // Nom
    const clientName = document.getElementById('client-name');
    if (clientName) {
        clientName.textContent = devis.clientNom || '--';
    }

    // Email
    const clientEmail = document.getElementById('client-email');
    if (clientEmail) {
        clientEmail.textContent = devis.clientEmail || '--';
    }

    // Téléphone
    const clientPhone = document.getElementById('client-phone');
    if (clientPhone) {
        clientPhone.textContent = devis.clientTelephone || 'Non renseigné';
    }

    // Adresse
    const clientAddress = document.getElementById('client-address');
    if (clientAddress) {
        clientAddress.textContent = devis.clientAdresse || 'Non renseignée';
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
    const tbody = document.getElementById('lines-table-body');
    if (!tbody) return;

    if (!lignes || lignes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                    Aucune ligne dans ce devis
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
function displayTotals(devis) {
    // Total HT
    const totalHt = document.getElementById('total-ht');
    if (totalHt) {
        totalHt.textContent = Utils.formatCurrency(devis.totalHT || 0);
    }

    // Total TVA
    const totalTva = document.getElementById('total-tva');
    if (totalTva) {
        totalTva.textContent = Utils.formatCurrency(devis.totalTVA || 0);
    }

    // Total TTC
    const totalTtc = document.getElementById('total-ttc');
    if (totalTtc) {
        totalTtc.textContent = Utils.formatCurrency(devis.totalTTC || 0);
    }
}

/**
 * Met à jour la visibilité des boutons d'action selon le statut
 */
function updateActionButtons() {
    const statut = devisData?.statut;

    // Bouton modifier
    const btnEdit = document.getElementById('btn-edit');
    if (btnEdit) {
        btnEdit.style.display = (statut === 'EN_COURS') ? '' : 'none';
    }

    // Bouton convertir en facture
    const btnConvert = document.getElementById('btn-convert');
    if (btnConvert) {
        btnConvert.style.display = (statut === 'VALIDE') ? '' : 'none';
    }
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
