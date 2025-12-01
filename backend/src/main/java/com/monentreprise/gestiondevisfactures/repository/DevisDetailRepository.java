package com.monentreprise.gestiondevisfactures.repository;

import com.monentreprise.gestiondevisfactures.entity.DevisDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité DevisDetail
 */
@Repository
public interface DevisDetailRepository extends JpaRepository<DevisDetail, Long> {

    /**
     * Recherche les lignes d'un devis
     */
    List<DevisDetail> findByDevisId(Long devisId);

    /**
     * Supprime les lignes d'un devis
     */
    void deleteByDevisId(Long devisId);
}
