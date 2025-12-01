package com.monentreprise.gestiondevisfactures.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour les lignes de détail d'une facture
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FactureDetailDTO {

    private Long id;
    
    @NotNull(message = "L'ID du produit est obligatoire")
    private Long produitId;
    
    private String produitNom;

    @NotNull(message = "La quantité est obligatoire")
    @Positive(message = "La quantité doit être positive")
    private Integer quantite;

    @NotNull(message = "Le prix unitaire HT est obligatoire")
    private BigDecimal prixUnitaireHT;

    private BigDecimal tva = new BigDecimal("20.00");
    private BigDecimal totalLigneHT;
    private BigDecimal totalLigneTTC;
}
