package com.monentreprise.gestiondevisfactures.mapper;

import com.monentreprise.gestiondevisfactures.dto.EntrepriseDTO;
import com.monentreprise.gestiondevisfactures.entity.Entreprise;
import org.springframework.stereotype.Component;

/**
 * Mapper pour convertir entre Entreprise et EntrepriseDTO
 */
@Component
public class EntrepriseMapper {

    /**
     * Convertit une entité Entreprise en DTO
     */
    public EntrepriseDTO toDTO(Entreprise entreprise) {
        if (entreprise == null) {
            return null;
        }

        EntrepriseDTO dto = new EntrepriseDTO();
        dto.setId(entreprise.getId());
        dto.setNom(entreprise.getNom());
        dto.setAdresse(entreprise.getAdresse());
        dto.setIce(entreprise.getIce());
        dto.setIdentifiantFiscal(entreprise.getIdentifiantFiscal());
        dto.setRc(entreprise.getRc());
        dto.setPatente(entreprise.getPatente());
        dto.setTelephone(entreprise.getTelephone());
        dto.setEmail(entreprise.getEmail());
        return dto;
    }

    /**
     * Convertit un DTO en entité Entreprise
     */
    public Entreprise toEntity(EntrepriseDTO dto) {
        if (dto == null) {
            return null;
        }

        Entreprise entreprise = new Entreprise();
        entreprise.setId(dto.getId());
        entreprise.setNom(dto.getNom());
        entreprise.setAdresse(dto.getAdresse());
        entreprise.setIce(dto.getIce());
        entreprise.setIdentifiantFiscal(dto.getIdentifiantFiscal());
        entreprise.setRc(dto.getRc());
        entreprise.setPatente(dto.getPatente());
        entreprise.setTelephone(dto.getTelephone());
        entreprise.setEmail(dto.getEmail());
        return entreprise;
    }

    /**
     * Met à jour une entité existante à partir d'un DTO
     */
    public void updateEntityFromDTO(EntrepriseDTO dto, Entreprise entreprise) {
        if (dto == null || entreprise == null) {
            return;
        }

        entreprise.setNom(dto.getNom());
        entreprise.setAdresse(dto.getAdresse());
        entreprise.setIce(dto.getIce());
        entreprise.setIdentifiantFiscal(dto.getIdentifiantFiscal());
        entreprise.setRc(dto.getRc());
        entreprise.setPatente(dto.getPatente());
        entreprise.setTelephone(dto.getTelephone());
        entreprise.setEmail(dto.getEmail());
    }
}
