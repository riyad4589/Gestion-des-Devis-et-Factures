package com.monentreprise.gestiondevisfactures.repository;

import com.monentreprise.gestiondevisfactures.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité Client
 */
@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    /**
     * Recherche un client par email
     */
    Optional<Client> findByEmail(String email);

    /**
     * Vérifie si un email existe déjà
     */
    boolean existsByEmail(String email);

    /**
     * Recherche les clients par nom (contient, insensible à la casse)
     */
    List<Client> findByNomContainingIgnoreCase(String nom);

    /**
     * Recherche les clients actifs
     */
    List<Client> findByActifTrue();

    /**
     * Recherche les clients par nom ou email
     */
    @Query("SELECT c FROM Client c WHERE " +
           "LOWER(c.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Client> searchByNomOrEmail(@Param("search") String search);
}
