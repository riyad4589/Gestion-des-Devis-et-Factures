package com.monentreprise.gestiondevisfactures.dto;

import com.monentreprise.gestiondevisfactures.entity.Facture;
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
 * DTO pour l'entité Facture
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FactureDTO {

    private Long id;
    private String numeroFacture;

    @NotNull(message = "L'ID du client est obligatoire")
    private Long clientId;
    
    private String clientNom;
    private String clientEmail;

    private Long devisOrigineId;
    private String devisOrigineNumero;

    private LocalDateTime dateFacture;
    private BigDecimal montantHT;
    private BigDecimal montantTVA;
    private BigDecimal montantTTC;
    private Facture.ModePaiement modePaiement;
    private Facture.StatutFacture statut;

    @Valid
    private List<FactureDetailDTO> lignes = new ArrayList<>();
}
