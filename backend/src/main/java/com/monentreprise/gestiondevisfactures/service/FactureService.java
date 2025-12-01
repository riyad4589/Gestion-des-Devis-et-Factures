package com.monentreprise.gestiondevisfactures.service;

import com.monentreprise.gestiondevisfactures.dto.FactureDTO;
import com.monentreprise.gestiondevisfactures.entity.Facture;

import java.util.List;

/**
 * Interface du service de gestion des factures
 */
public interface FactureService {

    /**
     * Récupère toutes les factures
     */
    List<FactureDTO> findAll();

    /**
     * Récupère une facture par son ID
     */
    FactureDTO findById(Long id);

    /**
     * Récupère une facture par son numéro
     */
    FactureDTO findByNumero(String numero);

    /**
     * Récupère les factures d'un client
     */
    List<FactureDTO> findByClientId(Long clientId);

    /**
     * Récupère les factures par statut
     */
    List<FactureDTO> findByStatut(Facture.StatutFacture statut);

    /**
     * Crée une nouvelle facture directe (sans devis)
     */
    FactureDTO create(FactureDTO factureDTO);

    /**
     * Met à jour une facture (statut, mode de paiement)
     */
    FactureDTO update(Long id, FactureDTO factureDTO);

    /**
     * Marque une facture comme payée
     */
    FactureDTO marquerPayee(Long id, Facture.ModePaiement modePaiement);

    /**
     * Annule une facture
     */
    FactureDTO annuler(Long id);

    /**
     * Génère le numéro de facture
     */
    String genererNumeroFacture();
}
