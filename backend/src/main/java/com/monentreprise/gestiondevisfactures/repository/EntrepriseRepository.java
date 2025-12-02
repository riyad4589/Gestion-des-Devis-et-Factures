package com.monentreprise.gestiondevisfactures.repository;

import com.monentreprise.gestiondevisfactures.entity.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour l'entité Entreprise
 */
@Repository
public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
    
    /**
     * Récupère la première entreprise (il n'y en a qu'une)
     */
    Optional<Entreprise> findFirstByOrderByIdAsc();
}
