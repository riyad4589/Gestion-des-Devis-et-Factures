package com.monentreprise.gestiondevisfactures.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour l'entité Client
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientDTO {

    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    private String telephone;
    private String adresse;
    private LocalDateTime dateCreation;
    private Boolean actif = true;
    
    // Statistiques optionnelles
    private Integer nombreDevis;
    private Integer nombreFactures;
}
