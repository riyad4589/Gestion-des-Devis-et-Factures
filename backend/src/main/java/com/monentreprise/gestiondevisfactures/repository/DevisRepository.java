package com.monentreprise.gestiondevisfactures.repository;

import com.monentreprise.gestiondevisfactures.entity.Devis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité Devis
 */
@Repository
public interface DevisRepository extends JpaRepository<Devis, Long> {

    /**
     * Recherche un devis par son numéro
     */
    Optional<Devis> findByNumeroDevis(String numeroDevis);

    /**
     * Recherche les devis d'un client
     */
    List<Devis> findByClientId(Long clientId);

    /**
     * Recherche les devis par statut
     */
    List<Devis> findByStatut(Devis.StatutDevis statut);

    /**
     * Recherche les devis entre deux dates
     */
    List<Devis> findByDateDevisBetween(LocalDateTime debut, LocalDateTime fin);

    /**
     * Compte les devis d'une année pour générer le numéro
     */
    @Query("SELECT COUNT(d) FROM Devis d WHERE YEAR(d.dateDevis) = :annee")
    Long countByAnnee(@Param("annee") int annee);

    /**
     * Recherche les devis avec leurs lignes (évite N+1)
     */
    @Query("SELECT DISTINCT d FROM Devis d LEFT JOIN FETCH d.lignes LEFT JOIN FETCH d.client WHERE d.id = :id")
    Optional<Devis> findByIdWithLignes(@Param("id") Long id);

    /**
     * Recherche les devis par client avec lignes
     */
    @Query("SELECT DISTINCT d FROM Devis d LEFT JOIN FETCH d.lignes WHERE d.client.id = :clientId ORDER BY d.dateDevis DESC")
    List<Devis> findByClientIdWithLignes(@Param("clientId") Long clientId);
}
