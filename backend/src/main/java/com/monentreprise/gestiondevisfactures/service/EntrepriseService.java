package com.monentreprise.gestiondevisfactures.service;

import com.monentreprise.gestiondevisfactures.dto.EntrepriseDTO;

/**
 * Service pour la gestion des informations de l'entreprise
 */
public interface EntrepriseService {

    /**
     * Récupère les informations de l'entreprise
     */
    EntrepriseDTO getEntreprise();

    /**
     * Crée ou met à jour les informations de l'entreprise
     */
    EntrepriseDTO saveEntreprise(EntrepriseDTO entrepriseDTO);
}
