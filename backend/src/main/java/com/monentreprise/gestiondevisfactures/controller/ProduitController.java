package com.monentreprise.gestiondevisfactures.controller;

import com.monentreprise.gestiondevisfactures.dto.ProduitDTO;
import com.monentreprise.gestiondevisfactures.service.ProduitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des produits
 */
@RestController
@RequestMapping("/api/produits")
@RequiredArgsConstructor
@Tag(name = "Produits", description = "API de gestion des produits")
public class ProduitController {

    private final ProduitService produitService;

    @GetMapping
    @Operation(summary = "Liste tous les produits")
    public ResponseEntity<List<ProduitDTO>> findAll() {
        return ResponseEntity.ok(produitService.findAll());
    }

    @GetMapping("/actifs")
    @Operation(summary = "Liste les produits actifs")
    public ResponseEntity<List<ProduitDTO>> findAllActifs() {
        return ResponseEntity.ok(produitService.findAllActifs());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère un produit par son ID")
    public ResponseEntity<ProduitDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(produitService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Crée un nouveau produit")
    public ResponseEntity<ProduitDTO> create(@Valid @RequestBody ProduitDTO produitDTO) {
        ProduitDTO created = produitService.create(produitDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour un produit existant")
    public ResponseEntity<ProduitDTO> update(@PathVariable Long id, @Valid @RequestBody ProduitDTO produitDTO) {
        return ResponseEntity.ok(produitService.update(id, produitDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime (désactive) un produit")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        produitService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Recherche des produits par nom et/ou catégorie")
    public ResponseEntity<List<ProduitDTO>> search(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String categorie) {
        return ResponseEntity.ok(produitService.search(nom, categorie));
    }

    @GetMapping("/categories")
    @Operation(summary = "Liste toutes les catégories de produits")
    public ResponseEntity<List<String>> findAllCategories() {
        return ResponseEntity.ok(produitService.findAllCategories());
    }
}
