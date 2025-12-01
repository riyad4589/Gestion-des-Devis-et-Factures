package com.monentreprise.gestiondevisfactures.service;

import com.monentreprise.gestiondevisfactures.entity.Devis;
import com.monentreprise.gestiondevisfactures.entity.Facture;

/**
 * Interface du service de génération PDF
 */
public interface PdfService {

    /**
     * Génère le PDF d'un devis
     */
    byte[] genererPdfDevis(Long devisId);

    /**
     * Génère le PDF d'une facture
     */
    byte[] genererPdfFacture(Long factureId);
}
