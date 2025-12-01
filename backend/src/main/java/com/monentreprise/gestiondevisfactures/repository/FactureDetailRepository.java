package com.monentreprise.gestiondevisfactures.repository;

import com.monentreprise.gestiondevisfactures.entity.FactureDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité FactureDetail
 */
@Repository
public interface FactureDetailRepository extends JpaRepository<FactureDetail, Long> {

    /**
     * Recherche les lignes d'une facture
     */
    List<FactureDetail> findByFactureId(Long factureId);

    /**
     * Supprime les lignes d'une facture
     */
    void deleteByFactureId(Long factureId);
}
