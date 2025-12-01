package com.monentreprise.gestiondevisfactures.mapper;

import com.monentreprise.gestiondevisfactures.dto.ClientDTO;
import com.monentreprise.gestiondevisfactures.entity.Client;
import org.springframework.stereotype.Component;

/**
 * Mapper pour convertir entre Client et ClientDTO
 */
@Component
public class ClientMapper {

    /**
     * Convertit une entité Client en DTO
     */
    public ClientDTO toDTO(Client client) {
        if (client == null) {
            return null;
        }
        
        ClientDTO dto = new ClientDTO();
        dto.setId(client.getId());
        dto.setNom(client.getNom());
        dto.setEmail(client.getEmail());
        dto.setTelephone(client.getTelephone());
        dto.setAdresse(client.getAdresse());
        dto.setDateCreation(client.getDateCreation());
        dto.setActif(client.getActif());
        
        // Comptage des devis et factures si disponibles
        if (client.getDevis() != null) {
            dto.setNombreDevis(client.getDevis().size());
        }
        if (client.getFactures() != null) {
            dto.setNombreFactures(client.getFactures().size());
        }
        
        return dto;
    }

    /**
     * Convertit un DTO en entité Client
     */
    public Client toEntity(ClientDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Client client = new Client();
        client.setId(dto.getId());
        client.setNom(dto.getNom());
        client.setEmail(dto.getEmail());
        client.setTelephone(dto.getTelephone());
        client.setAdresse(dto.getAdresse());
        client.setActif(dto.getActif() != null ? dto.getActif() : true);
        
        return client;
    }

    /**
     * Met à jour une entité Client à partir d'un DTO
     */
    public void updateEntityFromDTO(ClientDTO dto, Client client) {
        if (dto == null || client == null) {
            return;
        }
        
        client.setNom(dto.getNom());
        client.setEmail(dto.getEmail());
        client.setTelephone(dto.getTelephone());
        client.setAdresse(dto.getAdresse());
        if (dto.getActif() != null) {
            client.setActif(dto.getActif());
        }
    }
}
