package com.monentreprise.gestiondevisfactures.controller;

import com.monentreprise.gestiondevisfactures.dto.ClientDTO;
import com.monentreprise.gestiondevisfactures.service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des clients
 */
@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@Tag(name = "Clients", description = "API de gestion des clients")
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    @Operation(summary = "Liste tous les clients")
    public ResponseEntity<List<ClientDTO>> findAll() {
        return ResponseEntity.ok(clientService.findAll());
    }

    @GetMapping("/actifs")
    @Operation(summary = "Liste les clients actifs")
    public ResponseEntity<List<ClientDTO>> findAllActifs() {
        return ResponseEntity.ok(clientService.findAllActifs());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère un client par son ID")
    public ResponseEntity<ClientDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Crée un nouveau client")
    public ResponseEntity<ClientDTO> create(@Valid @RequestBody ClientDTO clientDTO) {
        ClientDTO created = clientService.create(clientDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour un client existant")
    public ResponseEntity<ClientDTO> update(@PathVariable Long id, @Valid @RequestBody ClientDTO clientDTO) {
        return ResponseEntity.ok(clientService.update(id, clientDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime (désactive) un client")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Recherche des clients par nom ou email")
    public ResponseEntity<List<ClientDTO>> search(@RequestParam(required = false) String nom,
                                                  @RequestParam(required = false) String q) {
        if (q != null && !q.isEmpty()) {
            return ResponseEntity.ok(clientService.search(q));
        } else if (nom != null && !nom.isEmpty()) {
            return ResponseEntity.ok(clientService.searchByNom(nom));
        }
        return ResponseEntity.ok(clientService.findAll());
    }
}
