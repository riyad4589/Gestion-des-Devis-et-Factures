package com.monentreprise.gestiondevisfactures.controller;

import com.monentreprise.gestiondevisfactures.dto.FactureDTO;
import com.monentreprise.gestiondevisfactures.entity.Facture;
import com.monentreprise.gestiondevisfactures.service.FactureService;
import com.monentreprise.gestiondevisfactures.service.PdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des factures
 */
@RestController
@RequestMapping("/api/factures")
@RequiredArgsConstructor
@Tag(name = "Factures", description = "API de gestion des factures")
public class FactureController {

    private final FactureService factureService;
    private final PdfService pdfService;

    @GetMapping
    @Operation(summary = "Liste toutes les factures")
    public ResponseEntity<List<FactureDTO>> findAll() {
        return ResponseEntity.ok(factureService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère une facture par son ID")
    public ResponseEntity<FactureDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(factureService.findById(id));
    }

    @GetMapping("/numero/{numero}")
    @Operation(summary = "Récupère une facture par son numéro")
    public ResponseEntity<FactureDTO> findByNumero(@PathVariable String numero) {
        return ResponseEntity.ok(factureService.findByNumero(numero));
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Liste les factures d'un client")
    public ResponseEntity<List<FactureDTO>> findByClientId(@PathVariable Long clientId) {
        return ResponseEntity.ok(factureService.findByClientId(clientId));
    }

    @GetMapping("/statut/{statut}")
    @Operation(summary = "Liste les factures par statut")
    public ResponseEntity<List<FactureDTO>> findByStatut(@PathVariable Facture.StatutFacture statut) {
        return ResponseEntity.ok(factureService.findByStatut(statut));
    }

    @PostMapping
    @Operation(summary = "Crée une nouvelle facture directe (sans devis)")
    public ResponseEntity<FactureDTO> create(@Valid @RequestBody FactureDTO factureDTO) {
        FactureDTO created = factureService.create(factureDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour une facture (statut, mode de paiement)")
    public ResponseEntity<FactureDTO> update(@PathVariable Long id, @Valid @RequestBody FactureDTO factureDTO) {
        return ResponseEntity.ok(factureService.update(id, factureDTO));
    }

    @PutMapping("/{id}/payer")
    @Operation(summary = "Marque une facture comme payée")
    public ResponseEntity<FactureDTO> marquerPayee(
            @PathVariable Long id,
            @RequestParam(required = false) Facture.ModePaiement modePaiement) {
        return ResponseEntity.ok(factureService.marquerPayee(id, modePaiement));
    }

    @PutMapping("/{id}/annuler")
    @Operation(summary = "Annule une facture")
    public ResponseEntity<FactureDTO> annuler(@PathVariable Long id) {
        return ResponseEntity.ok(factureService.annuler(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime définitivement une facture")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        factureService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Télécharge la facture en PDF")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        byte[] pdfBytes = pdfService.genererPdfFacture(id);
        FactureDTO facture = factureService.findById(id);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", facture.getNumeroFacture() + ".pdf");
        headers.setContentLength(pdfBytes.length);
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
