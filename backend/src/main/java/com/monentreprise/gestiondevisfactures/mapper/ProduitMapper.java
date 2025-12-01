package com.monentreprise.gestiondevisfactures.mapper;

import com.monentreprise.gestiondevisfactures.dto.ProduitDTO;
import com.monentreprise.gestiondevisfactures.entity.Produit;
import org.springframework.stereotype.Component;

/**
 * Mapper pour convertir entre Produit et ProduitDTO
 */
@Component
public class ProduitMapper {

    /**
     * Convertit une entité Produit en DTO
     */
    public ProduitDTO toDTO(Produit produit) {
        if (produit == null) {
            return null;
        }
        
        ProduitDTO dto = new ProduitDTO();
        dto.setId(produit.getId());
        dto.setNom(produit.getNom());
        dto.setDescription(produit.getDescription());
        dto.setPrixUnitaireHT(produit.getPrixUnitaireHT());
        dto.setStock(produit.getStock());
        dto.setCategorie(produit.getCategorie());
        dto.setActif(produit.getActif());
        
        return dto;
    }

    /**
     * Convertit un DTO en entité Produit
     */
    public Produit toEntity(ProduitDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Produit produit = new Produit();
        produit.setId(dto.getId());
        produit.setNom(dto.getNom());
        produit.setDescription(dto.getDescription());
        produit.setPrixUnitaireHT(dto.getPrixUnitaireHT());
        produit.setStock(dto.getStock() != null ? dto.getStock() : 0);
        produit.setCategorie(dto.getCategorie());
        produit.setActif(dto.getActif() != null ? dto.getActif() : true);
        
        return produit;
    }

    /**
     * Met à jour une entité Produit à partir d'un DTO
     */
    public void updateEntityFromDTO(ProduitDTO dto, Produit produit) {
        if (dto == null || produit == null) {
            return;
        }
        
        produit.setNom(dto.getNom());
        produit.setDescription(dto.getDescription());
        produit.setPrixUnitaireHT(dto.getPrixUnitaireHT());
        produit.setStock(dto.getStock());
        produit.setCategorie(dto.getCategorie());
        if (dto.getActif() != null) {
            produit.setActif(dto.getActif());
        }
    }
}
