package com.monentreprise.gestiondevisfactures.service;

import com.monentreprise.gestiondevisfactures.dto.ClientDTO;

import java.util.List;

/**
 * Interface du service de gestion des clients
 */
public interface ClientService {

    /**
     * Récupère tous les clients
     */
    List<ClientDTO> findAll();

    /**
     * Récupère les clients actifs
     */
    List<ClientDTO> findAllActifs();

    /**
     * Récupère un client par son ID
     */
    ClientDTO findById(Long id);

    /**
     * Crée un nouveau client
     */
    ClientDTO create(ClientDTO clientDTO);

    /**
     * Met à jour un client existant
     */
    ClientDTO update(Long id, ClientDTO clientDTO);

    /**
     * Supprime (désactive) un client
     */
    void delete(Long id);

    /**
     * Recherche des clients par nom
     */
    List<ClientDTO> searchByNom(String nom);

    /**
     * Recherche des clients par nom ou email
     */
    List<ClientDTO> search(String search);
}
