package com.monentreprise.gestiondevisfactures.service;

import com.monentreprise.gestiondevisfactures.dto.ProduitDTO;

import java.util.List;

/**
 * Interface du service de gestion des produits
 */
public interface ProduitService {

    /**
     * Récupère tous les produits
     */
    List<ProduitDTO> findAll();

    /**
     * Récupère les produits actifs
     */
    List<ProduitDTO> findAllActifs();

    /**
     * Récupère un produit par son ID
     */
    ProduitDTO findById(Long id);

    /**
     * Crée un nouveau produit
     */
    ProduitDTO create(ProduitDTO produitDTO);

    /**
     * Met à jour un produit existant
     */
    ProduitDTO update(Long id, ProduitDTO produitDTO);

    /**
     * Supprime (désactive) un produit
     */
    void delete(Long id);

    /**
     * Recherche des produits par nom et/ou catégorie
     */
    List<ProduitDTO> search(String nom, String categorie);

    /**
     * Récupère toutes les catégories
     */
    List<String> findAllCategories();

    /**
     * Met à jour le stock d'un produit
     */
    void updateStock(Long id, int quantite);
}
