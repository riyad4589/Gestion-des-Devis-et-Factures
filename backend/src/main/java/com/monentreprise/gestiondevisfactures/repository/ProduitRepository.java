package com.monentreprise.gestiondevisfactures.repository;

import com.monentreprise.gestiondevisfactures.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité Produit
 */
@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

    /**
     * Recherche les produits par nom (contient, insensible à la casse)
     */
    List<Produit> findByNomContainingIgnoreCase(String nom);

    /**
     * Recherche les produits par catégorie
     */
    List<Produit> findByCategorieIgnoreCase(String categorie);

    /**
     * Recherche les produits actifs
     */
    List<Produit> findByActifTrue();

    /**
     * Recherche les produits avec stock disponible
     */
    List<Produit> findByStockGreaterThan(Integer stock);

    /**
     * Recherche les produits par nom et/ou catégorie
     */
    @Query("SELECT p FROM Produit p WHERE " +
           "(:nom IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', :nom, '%'))) AND " +
           "(:categorie IS NULL OR LOWER(p.categorie) LIKE LOWER(CONCAT('%', :categorie, '%')))")
    List<Produit> searchByNomAndCategorie(@Param("nom") String nom, @Param("categorie") String categorie);

    /**
     * Récupère toutes les catégories distinctes
     */
    @Query("SELECT DISTINCT p.categorie FROM Produit p WHERE p.categorie IS NOT NULL ORDER BY p.categorie")
    List<String> findAllCategories();
}
