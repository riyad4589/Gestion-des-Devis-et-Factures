package com.monentreprise.gestiondevisfactures.service;

import com.monentreprise.gestiondevisfactures.dto.DevisDTO;
import com.monentreprise.gestiondevisfactures.dto.FactureDTO;

import java.util.List;

/**
 * Interface du service de gestion des devis
 */
public interface DevisService {

    /**
     * Récupère tous les devis
     */
    List<DevisDTO> findAll();

    /**
     * Récupère un devis par son ID
     */
    DevisDTO findById(Long id);

    /**
     * Récupère un devis par son numéro
     */
    DevisDTO findByNumero(String numero);

    /**
     * Récupère les devis d'un client
     */
    List<DevisDTO> findByClientId(Long clientId);

    /**
     * Crée un nouveau devis
     */
    DevisDTO create(DevisDTO devisDTO);

    /**
     * Met à jour un devis existant
     */
    DevisDTO update(Long id, DevisDTO devisDTO);

    /**
     * Supprime un devis
     */
    void delete(Long id);

    /**
     * Valide un devis
     */
    DevisDTO valider(Long id);

    /**
     * Annule un devis
     */
    DevisDTO annuler(Long id);

    /**
     * Convertit un devis en facture
     */
    FactureDTO convertirEnFacture(Long devisId);

    /**
     * Génère le numéro de devis
     */
    String genererNumeroDevis();
}
