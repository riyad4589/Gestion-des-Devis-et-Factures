package com.monentreprise.gestiondevisfactures.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Entité représentant une ligne de détail d'une facture
 */
@Entity
@Table(name = "facture_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FactureDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facture_id", nullable = false)
    private Facture facture;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @NotNull(message = "La quantité est obligatoire")
    @Positive(message = "La quantité doit être positive")
    @Column(nullable = false)
    private Integer quantite;

    @NotNull(message = "Le prix unitaire HT est obligatoire")
    @Column(name = "prix_unitaire_ht", nullable = false, precision = 10, scale = 2)
    private BigDecimal prixUnitaireHT;

    @Column(precision = 5, scale = 2)
    private BigDecimal tva = new BigDecimal("20.00");

    @Column(name = "total_ligne_ht", precision = 12, scale = 2)
    private BigDecimal totalLigneHT = BigDecimal.ZERO;

    @Column(name = "total_ligne_ttc", precision = 12, scale = 2)
    private BigDecimal totalLigneTTC = BigDecimal.ZERO;

    /**
     * Calcule les totaux de la ligne
     */
    public void calculerTotaux() {
        if (prixUnitaireHT != null && quantite != null) {
            this.totalLigneHT = prixUnitaireHT.multiply(BigDecimal.valueOf(quantite));
            
            if (tva != null) {
                BigDecimal coeffTVA = BigDecimal.ONE.add(tva.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                this.totalLigneTTC = totalLigneHT.multiply(coeffTVA).setScale(2, RoundingMode.HALF_UP);
            } else {
                this.totalLigneTTC = totalLigneHT;
            }
        }
    }
}
