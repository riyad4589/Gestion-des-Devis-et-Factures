package com.monentreprise.gestiondevisfactures.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * DTO pour les statistiques
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatistiquesDTO {

    private BigDecimal chiffreAffaireTotal = BigDecimal.ZERO;
    private BigDecimal chiffreAffaireMois = BigDecimal.ZERO;
    private BigDecimal chiffreAffaireAnnee = BigDecimal.ZERO;
    
    private Integer nombreClients = 0;
    private Integer nombreClientsActifs = 0;
    private Integer nombreProduits = 0;
    private Integer nombreProduitsActifs = 0;
    
    private Integer nombreDevis = 0;
    private Integer nombreDevisEnCours = 0;
    private Integer nombreDevisValides = 0;
    private Integer nombreDevisTransformes = 0;
    
    private Integer nombreFactures = 0;
    private Integer nombreFacturesPayees = 0;
    private Integer nombreFacturesNonPayees = 0;
    
    // CA par mois (clé = numéro du mois 1-12)
    private Map<Integer, BigDecimal> caParMois = new HashMap<>();
    
    // Statistiques par client
    private Long clientId;
    private String clientNom;
    private BigDecimal caClient = BigDecimal.ZERO;
    private Integer nombreDevisClient = 0;
    private Integer nombreFacturesClient = 0;
}
