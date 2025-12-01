package com.monentreprise.gestiondevisfactures.service;

import com.monentreprise.gestiondevisfactures.dto.StatistiquesDTO;

/**
 * Interface du service de statistiques
 */
public interface StatistiquesService {

    /**
     * Récupère les statistiques globales
     */
    StatistiquesDTO getStatistiquesGlobales();

    /**
     * Récupère le chiffre d'affaires total
     */
    StatistiquesDTO getChiffreAffaires();

    /**
     * Récupère le CA par mois pour une année
     */
    StatistiquesDTO getCAParMois(int annee);

    /**
     * Récupère les statistiques d'un client
     */
    StatistiquesDTO getStatistiquesClient(Long clientId);
}
