package com.monentreprise.gestiondevisfactures.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant les informations de l'entreprise
 */
@Entity
@Table(name = "entreprise")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Entreprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "adresse", columnDefinition = "TEXT")
    private String adresse;

    @Column(name = "ice", length = 20)
    private String ice;

    @Column(name = "identifiant_fiscal", length = 20)
    private String identifiantFiscal;

    @Column(name = "rc", length = 50)
    private String rc;

    @Column(name = "patente", length = 50)
    private String patente;

    @Column(name = "telephone", length = 20)
    private String telephone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "logo", columnDefinition = "TEXT")
    private String logo;
}
