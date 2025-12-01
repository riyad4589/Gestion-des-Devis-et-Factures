package com.monentreprise.gestiondevisfactures.repository;

import com.monentreprise.gestiondevisfactures.entity.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité Facture
 */
@Repository
public interface FactureRepository extends JpaRepository<Facture, Long> {

    /**
     * Recherche une facture par son numéro
     */
    Optional<Facture> findByNumeroFacture(String numeroFacture);

    /**
     * Recherche les factures d'un client
     */
    List<Facture> findByClientId(Long clientId);

    /**
     * Recherche les factures par statut
     */
    List<Facture> findByStatut(Facture.StatutFacture statut);

    /**
     * Recherche les factures entre deux dates
     */
    List<Facture> findByDateFactureBetween(LocalDateTime debut, LocalDateTime fin);

    /**
     * Compte les factures d'une année pour générer le numéro
     */
    @Query("SELECT COUNT(f) FROM Facture f WHERE YEAR(f.dateFacture) = :annee")
    Long countByAnnee(@Param("annee") int annee);

    /**
     * Calcule le CA total des factures payées
     */
    @Query("SELECT COALESCE(SUM(f.montantTTC), 0) FROM Facture f WHERE f.statut = 'PAYEE'")
    BigDecimal calculateTotalCA();

    /**
     * Calcule le CA des factures payées sur une période
     */
    @Query("SELECT COALESCE(SUM(f.montantTTC), 0) FROM Facture f WHERE f.statut = 'PAYEE' AND f.dateFacture BETWEEN :debut AND :fin")
    BigDecimal calculateCAByPeriode(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    /**
     * Calcule le CA par mois pour une année donnée
     */
    @Query("SELECT MONTH(f.dateFacture) as mois, COALESCE(SUM(f.montantTTC), 0) as ca " +
           "FROM Facture f WHERE f.statut = 'PAYEE' AND YEAR(f.dateFacture) = :annee " +
           "GROUP BY MONTH(f.dateFacture) ORDER BY MONTH(f.dateFacture)")
    List<Object[]> calculateCAByMois(@Param("annee") int annee);

    /**
     * Recherche les factures avec leurs lignes (évite N+1)
     */
    @Query("SELECT DISTINCT f FROM Facture f LEFT JOIN FETCH f.lignes LEFT JOIN FETCH f.client WHERE f.id = :id")
    Optional<Facture> findByIdWithLignes(@Param("id") Long id);

    /**
     * Compte les factures par statut
     */
    @Query("SELECT f.statut, COUNT(f) FROM Facture f GROUP BY f.statut")
    List<Object[]> countByStatut();

    /**
     * Calcule le CA d'un client (factures payées)
     */
    @Query("SELECT COALESCE(SUM(f.montantTTC), 0) FROM Facture f WHERE f.client.id = :clientId AND f.statut = 'PAYEE'")
    BigDecimal calculateCAByClient(@Param("clientId") Long clientId);
}
