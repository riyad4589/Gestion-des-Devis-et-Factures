package com.monentreprise.gestiondevisfactures.service.impl;

import com.monentreprise.gestiondevisfactures.dto.ProduitDTO;
import com.monentreprise.gestiondevisfactures.entity.Produit;
import com.monentreprise.gestiondevisfactures.exception.BusinessException;
import com.monentreprise.gestiondevisfactures.exception.ResourceNotFoundException;
import com.monentreprise.gestiondevisfactures.mapper.ProduitMapper;
import com.monentreprise.gestiondevisfactures.repository.ProduitRepository;
import com.monentreprise.gestiondevisfactures.service.ProduitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du service de gestion des produits
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProduitServiceImpl implements ProduitService {

    private final ProduitRepository produitRepository;
    private final ProduitMapper produitMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ProduitDTO> findAll() {
        return produitRepository.findAll().stream()
                .map(produitMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProduitDTO> findAllActifs() {
        return produitRepository.findByActifTrue().stream()
                .map(produitMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProduitDTO findById(Long id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", "id", id));
        return produitMapper.toDTO(produit);
    }

    @Override
    public ProduitDTO create(ProduitDTO produitDTO) {
        Produit produit = produitMapper.toEntity(produitDTO);
        produit.setActif(true);
        Produit savedProduit = produitRepository.save(produit);
        return produitMapper.toDTO(savedProduit);
    }

    @Override
    public ProduitDTO update(Long id, ProduitDTO produitDTO) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", "id", id));

        produitMapper.updateEntityFromDTO(produitDTO, produit);
        Produit updatedProduit = produitRepository.save(produit);
        return produitMapper.toDTO(updatedProduit);
    }

    @Override
    public void delete(Long id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", "id", id));
        
        // Suppression définitive de la base de données
        produitRepository.delete(produit);
        produitRepository.flush();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProduitDTO> search(String nom, String categorie) {
        return produitRepository.searchByNomAndCategorie(nom, categorie).stream()
                .map(produitMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> findAllCategories() {
        return produitRepository.findAllCategories();
    }

    @Override
    public void updateStock(Long id, int quantite) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", "id", id));
        
        int nouveauStock = produit.getStock() - quantite;
        if (nouveauStock < 0) {
            throw new BusinessException("Stock insuffisant pour le produit : " + produit.getNom() + 
                    ". Stock disponible : " + produit.getStock() + ", quantité demandée : " + quantite);
        }
        
        produit.setStock(nouveauStock);
        produitRepository.save(produit);
    }
}
