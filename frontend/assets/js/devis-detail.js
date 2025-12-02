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
 * Nettoie le texte pour le PDF - remplace les caracteres speciaux non supportes
 */
function cleanText(text) {
    if (!text) return '';
    return String(text)
        // Exposants - notamment le "e" en exposant (ᵉ comme dans 3ᵉ)
        .replace(/\u1D49/g, 'e')  // ᵉ -> e
        .replace(/\u00B2/g, '2') // ² -> 2
        .replace(/\u00B3/g, '3') // ³ -> 3
        .replace(/\u00B9/g, '1') // ¹ -> 1
        .replace(/\u1D52/g, 'o') // ᵒ -> o
        .replace(/\u02B3/g, 'r') // ʳ -> r
        .replace(/\u02E2/g, 's') // ˢ -> s
        // Caracteres francais avec accents -> ASCII
        .replace(/[àâä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[îï]/g, 'i')
        .replace(/[ôö]/g, 'o')
        .replace(/[ùûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[ÀÂÄÃ]/g, 'A')
        .replace(/[ÉÈÊË]/g, 'E')
        .replace(/[ÎÏ]/g, 'I')
        .replace(/[ÔÖ]/g, 'O')
        .replace(/[ÙÛÜ]/g, 'U')
        .replace(/[Ç]/g, 'C')
        // Guillemets et apostrophes
        .replace(/[«»""„]/g, '"')
        .replace(/[''‚]/g, "'")
        // Tirets et espaces speciaux
        .replace(/[–—]/g, '-')
        .replace(/[\u00A0\u202F]/g, ' '); // Espaces insecables
}

/**
 * Genere et telecharge un PDF professionnel du devis
 */
async function printDevis() {
    if (!devisData) {
        Utils.showToast('Donnees du devis non disponibles', 'error');
        return;
    }

    try {
        let entreprise = null;
        try {
            entreprise = await API.Entreprise.get();
        } catch (e) {
            console.warn('Impossible de charger les infos entreprise:', e);
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = 210;
        const pageHeight = 297;
        const marginLeft = 15;
        const marginRight = 15;
        const contentWidth = pageWidth - marginLeft - marginRight;
        let y = 15;

        // Couleurs
        const blue = [17, 82, 212];
        const dark = [33, 33, 33];
        const gray = [120, 120, 120];
        const lightGray = [245, 245, 245];

        // === EN-TETE ===
        // Logo: priorite API, puis localStorage
        const logoData = entreprise?.logo || localStorage.getItem('entrepriseLogo');
        if (logoData && logoData.startsWith('data:image')) {
            try {
                doc.addImage(logoData, 'PNG', marginLeft, y, 30, 15);
            } catch (e) {}
        }

        // Nom entreprise: priorite API, puis localStorage
        const nomEntreprise = entreprise?.nom || localStorage.getItem('entrepriseNom') || 'Mon Entreprise';
        const maxInfoWidth = 72; // Largeur max pour les infos entreprise
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...blue);
        
        // Nom entreprise avec retour a la ligne si necessaire
        const nomLines = doc.splitTextToSize(nomEntreprise, maxInfoWidth);
        nomLines.forEach((line, idx) => {
            doc.text(line, pageWidth - marginRight, y + 5 + (idx * 5), { align: 'right' });
        });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...gray);
        let infoY = y + 5 + (nomLines.length * 5) + 2;
        
        if (entreprise?.adresse) {
            const addrLines = doc.splitTextToSize(cleanText(entreprise.adresse), maxInfoWidth);
            addrLines.forEach((line) => {
                doc.text(line, pageWidth - marginRight, infoY, { align: 'right' });
                infoY += 4;
            });
        }
        if (entreprise?.telephone) {
            doc.text('Tel: ' + entreprise.telephone, pageWidth - marginRight, infoY, { align: 'right' });
            infoY += 4;
        }
        if (entreprise?.email) {
            const emailLines = doc.splitTextToSize(entreprise.email, maxInfoWidth);
            emailLines.forEach((line) => {
                doc.text(line, pageWidth - marginRight, infoY, { align: 'right' });
                infoY += 4;
            });
        }

        y = Math.max(y + 25, infoY + 5);

        // === BANDEAU DEVIS ===
        const numeroDevis = devisData.numeroDevis || 'DEV-' + String(devisData.id).padStart(4, '0');
        doc.setFillColor(...blue);
        doc.rect(marginLeft, y, contentWidth, 12, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('DEVIS', marginLeft + 5, y + 8);
        doc.setFontSize(11);
        doc.text(numeroDevis, pageWidth - marginRight - 5, y + 8, { align: 'right' });

        y += 18;

        // === INFORMATIONS CLIENT ET DEVIS ===
        const boxHeight = 32;
        const boxWidth = (contentWidth - 6) / 2;

        // Box Client
        doc.setFillColor(...lightGray);
        doc.rect(marginLeft, y, boxWidth, boxHeight, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.rect(marginLeft, y, boxWidth, boxHeight, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...blue);
        doc.text('CLIENT', marginLeft + 4, y + 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...dark);
        doc.text(devisData.clientNom || 'Client', marginLeft + 4, y + 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...gray);
        let cy = y + 17;
        if (devisData.clientAdresse) {
            const addr = doc.splitTextToSize(cleanText(devisData.clientAdresse), boxWidth - 8);
            doc.text(addr[0] || '', marginLeft + 4, cy);
            cy += 4;
        }
        if (devisData.clientTelephone) {
            doc.text(devisData.clientTelephone, marginLeft + 4, cy);
            cy += 4;
        }
        if (devisData.clientEmail) {
            doc.text(devisData.clientEmail, marginLeft + 4, cy);
        }

        // Box Devis
        const rightBox = marginLeft + boxWidth + 6;
        doc.setFillColor(...lightGray);
        doc.rect(rightBox, y, boxWidth, boxHeight, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.rect(rightBox, y, boxWidth, boxHeight, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...blue);
        doc.text('DETAILS', rightBox + 4, y + 6);

        doc.setFontSize(8);
        const details = [
            ['Date:', Utils.formatDate(devisData.dateDevis)],
            ['Validite:', devisData.dateValidite ? Utils.formatDate(devisData.dateValidite) : '30 jours'],
            ['Statut:', getStatusText(devisData.statut)]
        ];
        let dy = y + 13;
        details.forEach(([label, value]) => {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...gray);
            doc.text(label, rightBox + 4, dy);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...dark);
            doc.text(value, rightBox + 28, dy);
            dy += 5;
        });

        y += boxHeight + 6;

        // === TABLEAU PRODUITS ===
        const lignes = devisData.lignes || [];
        const tableBody = lignes.map(l => {
            const total = (l.quantite || 0) * (l.prixUnitaireHT || 0);
            return [
                l.produitNom || 'Produit',
                String(l.quantite || 0),
                formatMoney(l.prixUnitaireHT || 0),
                (l.tva || 20) + '%',
                formatMoney(total)
            ];
        });

        doc.autoTable({
            startY: y,
            head: [['Designation', 'Qte', 'Prix HT', 'TVA', 'Total HT']],
            body: tableBody,
            theme: 'grid',
            styles: {
                font: 'helvetica',
                fontSize: 9,
                cellPadding: 3,
                textColor: dark,
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: blue,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9
            },
            columnStyles: {
                0: { cellWidth: 'auto', halign: 'left' },
                1: { cellWidth: 18, halign: 'center' },
                2: { cellWidth: 30, halign: 'right' },
                3: { cellWidth: 18, halign: 'center' },
                4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: marginLeft, right: marginRight },
            tableWidth: contentWidth,
            alternateRowStyles: { fillColor: [252, 252, 252] }
        });

        y = doc.lastAutoTable.finalY + 6;

        // === TOTAUX ===
        const totWidth = 70;
        const totX = pageWidth - marginRight - totWidth;

        doc.setFillColor(...lightGray);
        doc.rect(totX, y, totWidth, 36, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.rect(totX, y, totWidth, 36, 'S');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...gray);
        doc.text('Sous-total HT', totX + 4, y + 8);
        doc.setTextColor(...dark);
        doc.text(formatMoney(devisData.totalHT || 0), totX + totWidth - 4, y + 8, { align: 'right' });

        doc.setTextColor(...gray);
        doc.text('TVA', totX + 4, y + 16);
        doc.setTextColor(...dark);
        doc.text(formatMoney(devisData.totalTVA || 0), totX + totWidth - 4, y + 16, { align: 'right' });

        doc.setDrawColor(...blue);
        doc.setLineWidth(0.5);
        doc.line(totX + 4, y + 21, totX + totWidth - 4, y + 21);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...blue);
        doc.text('TOTAL TTC', totX + 4, y + 30);
        doc.text(formatMoney(devisData.totalTTC || 0), totX + totWidth - 4, y + 30, { align: 'right' });

        y += 42;

        // === COMMENTAIRE ===
        if (devisData.commentaire && y < 260) {
            doc.setFillColor(...lightGray);
            doc.rect(marginLeft, y, contentWidth, 16, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(...blue);
            doc.text('Note:', marginLeft + 4, y + 6);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...dark);
            const note = doc.splitTextToSize(devisData.commentaire, contentWidth - 20);
            doc.text(note[0] || '', marginLeft + 16, y + 6);
            y += 20;
        }

        // === CONDITIONS ===
        if (y < 270) {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...gray);
            doc.text('Conditions: Ce devis est valable 30 jours. Paiement selon conditions convenues.', marginLeft, y);
        }

        // === PIED DE PAGE ===
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, 285, pageWidth - marginRight, 285);
        doc.setFontSize(7);
        doc.setTextColor(...gray);
        doc.text(nomEntreprise, marginLeft, 290);
        doc.text('Page 1/1', pageWidth / 2, 290, { align: 'center' });
        doc.text('Genere le ' + new Date().toLocaleDateString('fr-FR'), pageWidth - marginRight, 290, { align: 'right' });

        doc.save('Devis_' + numeroDevis + '.pdf');
        Utils.showToast('PDF telecharge avec succes', 'success');

    } catch (error) {
        console.error('Erreur PDF:', error);
        Utils.showToast('Erreur lors de la generation du PDF', 'error');
    }
}

/**
 * Formate un montant en dirhams
 */
function formatMoney(amount) {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' DH';
}


/**
 * Retourne le texte du statut
 */
function getStatusText(statut) {
    const statusText = {
        'EN_COURS': 'En cours',
        'VALIDE': 'Valide',
        'TRANSFORME_EN_FACTURE': 'Converti',
        'ANNULE': 'Annule'
    };
    return statusText[statut] || statut;
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
