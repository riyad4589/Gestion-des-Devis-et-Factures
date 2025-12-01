package com.monentreprise.gestiondevisfactures.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant une facture
 */
@Entity
@Table(name = "factures")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_facture", nullable = false, unique = true)
    private String numeroFacture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "devis_origine_id")
    private Devis devisOrigine;

    @CreationTimestamp
    @Column(name = "date_facture", updatable = false)
    private LocalDateTime dateFacture;

    @Column(name = "montant_ht", precision = 12, scale = 2)
    private BigDecimal montantHT = BigDecimal.ZERO;

    @Column(name = "montant_tva", precision = 12, scale = 2)
    private BigDecimal montantTVA = BigDecimal.ZERO;

    @Column(name = "montant_ttc", precision = 12, scale = 2)
    private BigDecimal montantTTC = BigDecimal.ZERO;

    @Column(name = "mode_paiement")
    @Enumerated(EnumType.STRING)
    private ModePaiement modePaiement;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatutFacture statut = StatutFacture.NON_PAYEE;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FactureDetail> lignes = new ArrayList<>();

    /**
     * Enumération des modes de paiement
     */
    public enum ModePaiement {
        ESPECES,
        CHEQUE,
        VIREMENT,
        CB,
        PRELEVEMENT
    }

    /**
     * Enumération des statuts de facture
     */
    public enum StatutFacture {
        NON_PAYEE,
        PARTIELLEMENT_PAYEE,
        PAYEE,
        ANNULEE
    }

    /**
     * Ajoute une ligne à la facture
     */
    public void addLigne(FactureDetail ligne) {
        lignes.add(ligne);
        ligne.setFacture(this);
    }

    /**
     * Supprime une ligne de la facture
     */
    public void removeLigne(FactureDetail ligne) {
        lignes.remove(ligne);
        ligne.setFacture(null);
    }

    /**
     * Recalcule les totaux de la facture
     */
    public void recalculerTotaux() {
        this.montantHT = BigDecimal.ZERO;
        this.montantTVA = BigDecimal.ZERO;
        this.montantTTC = BigDecimal.ZERO;

        for (FactureDetail ligne : lignes) {
            ligne.calculerTotaux();
            this.montantHT = this.montantHT.add(ligne.getTotalLigneHT());
            BigDecimal tvaLigne = ligne.getTotalLigneTTC().subtract(ligne.getTotalLigneHT());
            this.montantTVA = this.montantTVA.add(tvaLigne);
            this.montantTTC = this.montantTTC.add(ligne.getTotalLigneTTC());
        }
    }
}
