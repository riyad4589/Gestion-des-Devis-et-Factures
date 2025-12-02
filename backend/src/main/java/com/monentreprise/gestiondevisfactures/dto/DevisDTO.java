package com.monentreprise.gestiondevisfactures.dto;

import com.monentreprise.gestiondevisfactures.entity.Devis;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO pour l'entité Devis
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DevisDTO {

    private Long id;
    private String numeroDevis;

    @NotNull(message = "L'ID du client est obligatoire")
    private Long clientId;
    
    private String clientNom;
    private String clientEmail;
    private String clientTelephone;
    private String clientAdresse;

    private LocalDateTime dateDevis;
    private BigDecimal totalHT;
    private BigDecimal totalTVA;
    private BigDecimal totalTTC;
    private Devis.StatutDevis statut;
    private String commentaire;

    @Valid
    private List<DevisDetailDTO> lignes = new ArrayList<>();
}
