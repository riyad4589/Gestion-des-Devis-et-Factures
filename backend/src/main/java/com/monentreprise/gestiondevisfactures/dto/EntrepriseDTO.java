package com.monentreprise.gestiondevisfactures.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour l'entité Entreprise
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntrepriseDTO {

    private Long id;
    private String nom;
    private String adresse;
    private String ice;
    private String identifiantFiscal;
    private String rc;
    private String patente;
    private String telephone;
    private String email;
}
