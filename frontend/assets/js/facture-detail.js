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
 * Formate un montant pour le PDF - utilise regex pour eviter les espaces unicode
 */
function formatMoney(amount) {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' DH';
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
 * Genere et telecharge un PDF professionnel de la facture
 */
async function printFacture() {
    if (!factureData) {
        Utils.showToast('Donnees de la facture non disponibles', 'error');
        return;
    }

    try {
        // Recuperer les informations de l'entreprise
        let entreprise = null;
        try {
            entreprise = await API.Entreprise.get();
        } catch (e) {
            console.warn('Impossible de charger les infos entreprise:', e);
        }

        const { jsPDF } = window.jspdf;
        
        // Dimensions A4 fixes
        const pageWidth = 210;
        const pageHeight = 297;
        const marginLeft = 15;
        const marginRight = 15;
        const contentWidth = pageWidth - marginLeft - marginRight;
        
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        let y = 15;

        // Couleurs
        const primaryColor = [17, 82, 212];
        const successColor = [34, 197, 94];
        const warningColor = [234, 179, 8];
        const dangerColor = [239, 68, 68];
        const darkText = [31, 41, 55];
        const grayText = [107, 114, 128];

        // === EN-TETE ===
        // Nom entreprise: priorite API, puis localStorage
        const nomEntreprise = entreprise?.nom || localStorage.getItem('entrepriseNom') || 'Mon Entreprise';
        
        // Logo: priorite API, puis localStorage
        const logoData = entreprise?.logo || localStorage.getItem('entrepriseLogo');
        if (logoData && logoData.startsWith('data:image')) {
            try {
                doc.addImage(logoData, 'PNG', marginLeft, y, 30, 15);
            } catch (e) {
                console.warn('Erreur logo:', e);
            }
        }

        // Nom entreprise a droite
        const maxInfoWidth = 80; // Largeur max pour les infos entreprise
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        
        // Nom entreprise avec retour a la ligne si necessaire
        const nomLines = doc.splitTextToSize(nomEntreprise, maxInfoWidth);
        nomLines.forEach((line, idx) => {
            doc.text(line, pageWidth - marginRight, y + 5 + (idx * 6), { align: 'right' });
        });

        // Coordonnees entreprise
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayText);
        let rightY = y + 5 + (nomLines.length * 6) + 2;
        
        if (entreprise?.adresse) {
            const addrLines = doc.splitTextToSize(cleanText(entreprise.adresse), maxInfoWidth);
            addrLines.forEach((line) => {
                doc.text(line, pageWidth - marginRight, rightY, { align: 'right' });
                rightY += 4;
            });
        }
        if (entreprise?.telephone) {
            doc.text('Tel: ' + entreprise.telephone, pageWidth - marginRight, rightY, { align: 'right' });
            rightY += 4;
        }
        if (entreprise?.email) {
            const emailLines = doc.splitTextToSize(entreprise.email, maxInfoWidth);
            emailLines.forEach((line) => {
                doc.text(line, pageWidth - marginRight, rightY, { align: 'right' });
                rightY += 4;
            });
        }

        y = Math.max(y + 25, rightY + 5);

        // === BANNIERE FACTURE ===
        const numeroFacture = factureData.numeroFacture || 'FAC-' + String(factureData.id).padStart(4, '0');
        
        // Couleur selon statut
        let bannerColor = primaryColor;
        if (factureData.statut === 'PAYEE') bannerColor = successColor;
        else if (factureData.statut === 'NON_PAYEE') bannerColor = warningColor;
        else if (factureData.statut === 'ANNULEE') bannerColor = dangerColor;
        
        doc.setFillColor(...bannerColor);
        doc.rect(marginLeft, y, contentWidth, 14, 'F');
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('FACTURE', marginLeft + 8, y + 10);
        
        doc.setFontSize(14);
        doc.text(numeroFacture, pageWidth - marginRight - 8, y + 10, { align: 'right' });

        y += 22;

        // === INFOS CLIENT ET FACTURE ===
        const colWidth = (contentWidth - 10) / 2;

        // Client (gauche)
        doc.setFillColor(245, 247, 250);
        doc.rect(marginLeft, y, colWidth, 35, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('FACTURER A', marginLeft + 5, y + 8);

        doc.setFontSize(12);
        doc.setTextColor(...darkText);
        doc.text(factureData.clientNom || 'Client', marginLeft + 5, y + 16);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayText);
        let clientY = y + 22;
        if (factureData.clientAdresse) {
            doc.text(cleanText(factureData.clientAdresse).substring(0, 40), marginLeft + 5, clientY);
            clientY += 5;
        }
        if (factureData.clientTelephone) {
            doc.text(factureData.clientTelephone, marginLeft + 5, clientY);
        }

        // Details facture (droite)
        const rightX = marginLeft + colWidth + 10;
        doc.setFillColor(245, 247, 250);
        doc.rect(rightX, y, colWidth, 35, 'F');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('DETAILS FACTURE', rightX + 5, y + 8);

        const modePaiementLabels = {
            'ESPECES': 'Especes',
            'CHEQUE': 'Cheque',
            'VIREMENT': 'Virement',
            'CB': 'Carte bancaire',
            'PRELEVEMENT': 'Prelevement'
        };

        const statusLabels = {
            'NON_PAYEE': 'Non payee',
            'PARTIELLEMENT_PAYEE': 'Partielle',
            'PAYEE': 'Payee',
            'ANNULEE': 'Annulee'
        };

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayText);
        doc.text('Date:', rightX + 5, y + 16);
        doc.text('Paiement:', rightX + 5, y + 23);
        doc.text('Statut:', rightX + 5, y + 30);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkText);
        doc.text(Utils.formatDate(factureData.dateFacture) || '--', rightX + 35, y + 16);
        doc.text(modePaiementLabels[factureData.modePaiement] || factureData.modePaiement || '--', rightX + 35, y + 23);
        doc.text(statusLabels[factureData.statut] || factureData.statut || '--', rightX + 35, y + 30);

        y += 42;

        // === TABLEAU DES PRODUITS ===
        const lignes = factureData.lignes || [];
        const tableData = lignes.map((ligne) => {
            const totalLigne = (ligne.quantite || 0) * (ligne.prixUnitaireHT || 0);
            return [
                ligne.produitNom || 'Produit',
                (ligne.quantite || 0).toString(),
                formatMoney(ligne.prixUnitaireHT || 0),
                (ligne.tva || 20) + '%',
                formatMoney(totalLigne)
            ];
        });

        doc.autoTable({
            startY: y,
            head: [['Designation', 'Qte', 'Prix unit. HT', 'TVA', 'Total HT']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 4,
                textColor: darkText,
                lineColor: [200, 200, 200],
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 10
            },
            columnStyles: {
                0: { cellWidth: 70, halign: 'left' },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 35, halign: 'right' },
                3: { cellWidth: 20, halign: 'center' },
                4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: marginLeft, right: marginRight },
            tableWidth: contentWidth
        });

        y = doc.lastAutoTable.finalY + 10;

        // === TOTAUX ===
        const totalsX = marginLeft + contentWidth - 80;
        
        doc.setFillColor(245, 247, 250);
        doc.rect(totalsX, y, 80, 40, 'F');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayText);
        doc.text('Sous-total HT:', totalsX + 5, y + 10);
        doc.text('TVA:', totalsX + 5, y + 20);

        doc.setTextColor(...darkText);
        doc.text(formatMoney(factureData.montantHT || 0), totalsX + 75, y + 10, { align: 'right' });
        doc.text(formatMoney(factureData.montantTVA || 0), totalsX + 75, y + 20, { align: 'right' });

        // Ligne separation
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.line(totalsX + 5, y + 25, totalsX + 75, y + 25);

        // Total TTC
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('TOTAL TTC:', totalsX + 5, y + 35);
        doc.text(formatMoney(factureData.montantTTC || 0), totalsX + 75, y + 35, { align: 'right' });

        y += 50;

        // === BADGE STATUT ===
        if (factureData.statut === 'PAYEE') {
            doc.setFillColor(...successColor);
            doc.rect(marginLeft, y, 40, 10, 'F');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('PAYEE', marginLeft + 20, y + 7, { align: 'center' });
            y += 15;
        } else if (factureData.statut === 'ANNULEE') {
            doc.setFillColor(...dangerColor);
            doc.rect(marginLeft, y, 45, 10, 'F');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('ANNULEE', marginLeft + 22, y + 7, { align: 'center' });
            y += 15;
        }

        // === COORDONNEES BANCAIRES ===
        if (entreprise?.iban && y < 250) {
            doc.setFillColor(250, 251, 252);
            doc.rect(marginLeft, y, contentWidth, 18, 'F');
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...primaryColor);
            doc.text('Coordonnees bancaires', marginLeft + 5, y + 7);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...darkText);
            doc.text('IBAN: ' + entreprise.iban, marginLeft + 5, y + 14);
            if (entreprise?.bic) {
                doc.text('BIC: ' + entreprise.bic, marginLeft + 100, y + 14);
            }
            y += 22;
        }

        // === CONDITIONS ===
        if (y < 265) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...grayText);
            doc.text('Conditions de paiement : Paiement a reception de facture.', marginLeft, y);
        }

        // === PIED DE PAGE ===
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, 285, pageWidth - marginRight, 285);

        doc.setFontSize(8);
        doc.setTextColor(...grayText);
        doc.text(nomEntreprise, marginLeft, 290);
        doc.text('Page 1/1', pageWidth / 2, 290, { align: 'center' });
        
        const today = new Date();
        const dateStr = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
        doc.text('Genere le ' + dateStr, pageWidth - marginRight, 290, { align: 'right' });

        // Telecharger
        doc.save('Facture_' + numeroFacture + '.pdf');
        Utils.showToast('PDF telecharge avec succes', 'success');

    } catch (error) {
        console.error('Erreur lors de la generation du PDF:', error);
        Utils.showToast('Erreur lors de la generation du PDF', 'error');
    }
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
