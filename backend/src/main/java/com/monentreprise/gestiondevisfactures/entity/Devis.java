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
 * Entité représentant un devis
 */
@Entity
@Table(name = "devis")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Devis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_devis", nullable = false, unique = true)
    private String numeroDevis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @CreationTimestamp
    @Column(name = "date_devis", updatable = false)
    private LocalDateTime dateDevis;

    @Column(name = "total_ht", precision = 12, scale = 2)
    private BigDecimal totalHT = BigDecimal.ZERO;

    @Column(name = "total_tva", precision = 12, scale = 2)
    private BigDecimal totalTVA = BigDecimal.ZERO;

    @Column(name = "total_ttc", precision = 12, scale = 2)
    private BigDecimal totalTTC = BigDecimal.ZERO;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatutDevis statut = StatutDevis.EN_COURS;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @OneToMany(mappedBy = "devis", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DevisDetail> lignes = new ArrayList<>();

    /**
     * Enumération des statuts possibles d'un devis
     */
    public enum StatutDevis {
        EN_COURS,
        VALIDE,
        TRANSFORME_EN_FACTURE,
        ANNULE
    }

    /**
     * Ajoute une ligne au devis
     */
    public void addLigne(DevisDetail ligne) {
        lignes.add(ligne);
        ligne.setDevis(this);
    }

    /**
     * Supprime une ligne du devis
     */
    public void removeLigne(DevisDetail ligne) {
        lignes.remove(ligne);
        ligne.setDevis(null);
    }

    /**
     * Recalcule les totaux du devis
     */
    public void recalculerTotaux() {
        this.totalHT = BigDecimal.ZERO;
        this.totalTVA = BigDecimal.ZERO;
        this.totalTTC = BigDecimal.ZERO;

        for (DevisDetail ligne : lignes) {
            ligne.calculerTotaux();
            this.totalHT = this.totalHT.add(ligne.getTotalLigneHT());
            BigDecimal tvaLigne = ligne.getTotalLigneTTC().subtract(ligne.getTotalLigneHT());
            this.totalTVA = this.totalTVA.add(tvaLigne);
            this.totalTTC = this.totalTTC.add(ligne.getTotalLigneTTC());
        }
    }
}
