package com.monentreprise.gestiondevisfactures.controller;

import com.monentreprise.gestiondevisfactures.dto.EntrepriseDTO;
import com.monentreprise.gestiondevisfactures.service.EntrepriseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour la gestion des informations de l'entreprise
 */
@RestController
@RequestMapping("/api/entreprise")
@RequiredArgsConstructor
@Tag(name = "Entreprise", description = "API de gestion des informations de l'entreprise")
public class EntrepriseController {

    private final EntrepriseService entrepriseService;

    @GetMapping
    @Operation(summary = "Récupère les informations de l'entreprise")
    public ResponseEntity<EntrepriseDTO> getEntreprise() {
        return ResponseEntity.ok(entrepriseService.getEntreprise());
    }

    @PostMapping
    @Operation(summary = "Crée ou met à jour les informations de l'entreprise")
    public ResponseEntity<EntrepriseDTO> saveEntreprise(@RequestBody EntrepriseDTO entrepriseDTO) {
        return ResponseEntity.ok(entrepriseService.saveEntreprise(entrepriseDTO));
    }

    @PutMapping
    @Operation(summary = "Met à jour les informations de l'entreprise")
    public ResponseEntity<EntrepriseDTO> updateEntreprise(@RequestBody EntrepriseDTO entrepriseDTO) {
        return ResponseEntity.ok(entrepriseService.saveEntreprise(entrepriseDTO));
    }
}
