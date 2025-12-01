package com.monentreprise.gestiondevisfactures.controller;

import com.monentreprise.gestiondevisfactures.dto.DevisDTO;
import com.monentreprise.gestiondevisfactures.dto.FactureDTO;
import com.monentreprise.gestiondevisfactures.service.DevisService;
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
 * Contrôleur REST pour la gestion des devis
 */
@RestController
@RequestMapping("/api/devis")
@RequiredArgsConstructor
@Tag(name = "Devis", description = "API de gestion des devis")
public class DevisController {

    private final DevisService devisService;
    private final PdfService pdfService;

    @GetMapping
    @Operation(summary = "Liste tous les devis")
    public ResponseEntity<List<DevisDTO>> findAll() {
        return ResponseEntity.ok(devisService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère un devis par son ID")
    public ResponseEntity<DevisDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(devisService.findById(id));
    }

    @GetMapping("/numero/{numero}")
    @Operation(summary = "Récupère un devis par son numéro")
    public ResponseEntity<DevisDTO> findByNumero(@PathVariable String numero) {
        return ResponseEntity.ok(devisService.findByNumero(numero));
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Liste les devis d'un client")
    public ResponseEntity<List<DevisDTO>> findByClientId(@PathVariable Long clientId) {
        return ResponseEntity.ok(devisService.findByClientId(clientId));
    }

    @PostMapping
    @Operation(summary = "Crée un nouveau devis")
    public ResponseEntity<DevisDTO> create(@Valid @RequestBody DevisDTO devisDTO) {
        DevisDTO created = devisService.create(devisDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour un devis existant (si en cours)")
    public ResponseEntity<DevisDTO> update(@PathVariable Long id, @Valid @RequestBody DevisDTO devisDTO) {
        return ResponseEntity.ok(devisService.update(id, devisDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime un devis")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        devisService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/valider")
    @Operation(summary = "Valide un devis")
    public ResponseEntity<DevisDTO> valider(@PathVariable Long id) {
        return ResponseEntity.ok(devisService.valider(id));
    }

    @PutMapping("/{id}/annuler")
    @Operation(summary = "Annule un devis")
    public ResponseEntity<DevisDTO> annuler(@PathVariable Long id) {
        return ResponseEntity.ok(devisService.annuler(id));
    }

    @PostMapping("/{id}/convertir-en-facture")
    @Operation(summary = "Convertit un devis validé en facture")
    public ResponseEntity<FactureDTO> convertirEnFacture(@PathVariable Long id) {
        FactureDTO facture = devisService.convertirEnFacture(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(facture);
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Télécharge le devis en PDF")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        byte[] pdfBytes = pdfService.genererPdfDevis(id);
        DevisDTO devis = devisService.findById(id);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", devis.getNumeroDevis() + ".pdf");
        headers.setContentLength(pdfBytes.length);
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
