package com.monentreprise.gestiondevisfactures.controller;

import com.monentreprise.gestiondevisfactures.dto.StatistiquesDTO;
import com.monentreprise.gestiondevisfactures.service.StatistiquesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Year;

/**
 * Contrôleur REST pour les statistiques
 */
@RestController
@RequestMapping("/api/statistiques")
@RequiredArgsConstructor
@Tag(name = "Statistiques", description = "API des statistiques et tableaux de bord")
public class StatistiquesController {

    private final StatistiquesService statistiquesService;

    @GetMapping
    @Operation(summary = "Récupère les statistiques globales")
    public ResponseEntity<StatistiquesDTO> getStatistiquesGlobales() {
        return ResponseEntity.ok(statistiquesService.getStatistiquesGlobales());
    }

    @GetMapping("/ca")
    @Operation(summary = "Récupère le chiffre d'affaires")
    public ResponseEntity<StatistiquesDTO> getChiffreAffaires() {
        return ResponseEntity.ok(statistiquesService.getChiffreAffaires());
    }

    @GetMapping("/ca-par-mois")
    @Operation(summary = "Récupère le CA par mois pour une année")
    public ResponseEntity<StatistiquesDTO> getCAParMois(
            @RequestParam(required = false) Integer annee) {
        int year = annee != null ? annee : Year.now().getValue();
        return ResponseEntity.ok(statistiquesService.getCAParMois(year));
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Récupère les statistiques d'un client")
    public ResponseEntity<StatistiquesDTO> getStatistiquesClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(statistiquesService.getStatistiquesClient(clientId));
    }
}
