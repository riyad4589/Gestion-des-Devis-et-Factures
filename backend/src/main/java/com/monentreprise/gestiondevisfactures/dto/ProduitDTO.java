package com.monentreprise.gestiondevisfactures.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour l'entité Produit
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProduitDTO {

    private Long id;

    @NotBlank(message = "Le nom du produit est obligatoire")
    private String nom;

    private String description;

    @NotNull(message = "Le prix unitaire HT est obligatoire")
    @PositiveOrZero(message = "Le prix unitaire doit être positif ou nul")
    private BigDecimal prixUnitaireHT;

    @NotNull(message = "Le stock est obligatoire")
    @PositiveOrZero(message = "Le stock doit être positif ou nul")
    private Integer stock = 0;

    private String categorie;
    private Boolean actif = true;
}
