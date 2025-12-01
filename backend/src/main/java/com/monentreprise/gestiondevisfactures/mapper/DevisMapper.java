package com.monentreprise.gestiondevisfactures.mapper;

import com.monentreprise.gestiondevisfactures.dto.DevisDTO;
import com.monentreprise.gestiondevisfactures.dto.DevisDetailDTO;
import com.monentreprise.gestiondevisfactures.entity.Devis;
import com.monentreprise.gestiondevisfactures.entity.DevisDetail;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Mapper pour convertir entre Devis et DevisDTO
 */
@Component
public class DevisMapper {

    /**
     * Convertit une entité Devis en DTO
     */
    public DevisDTO toDTO(Devis devis) {
        if (devis == null) {
            return null;
        }
        
        DevisDTO dto = new DevisDTO();
        dto.setId(devis.getId());
        dto.setNumeroDevis(devis.getNumeroDevis());
        dto.setDateDevis(devis.getDateDevis());
        dto.setTotalHT(devis.getTotalHT());
        dto.setTotalTVA(devis.getTotalTVA());
        dto.setTotalTTC(devis.getTotalTTC());
        dto.setStatut(devis.getStatut());
        dto.setCommentaire(devis.getCommentaire());
        
        if (devis.getClient() != null) {
            dto.setClientId(devis.getClient().getId());
            dto.setClientNom(devis.getClient().getNom());
            dto.setClientEmail(devis.getClient().getEmail());
        }
        
        if (devis.getLignes() != null) {
            dto.setLignes(devis.getLignes().stream()
                    .map(this::toDetailDTO)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    /**
     * Convertit une ligne DevisDetail en DTO
     */
    public DevisDetailDTO toDetailDTO(DevisDetail detail) {
        if (detail == null) {
            return null;
        }
        
        DevisDetailDTO dto = new DevisDetailDTO();
        dto.setId(detail.getId());
        dto.setQuantite(detail.getQuantite());
        dto.setPrixUnitaireHT(detail.getPrixUnitaireHT());
        dto.setTva(detail.getTva());
        dto.setTotalLigneHT(detail.getTotalLigneHT());
        dto.setTotalLigneTTC(detail.getTotalLigneTTC());
        
        if (detail.getProduit() != null) {
            dto.setProduitId(detail.getProduit().getId());
            dto.setProduitNom(detail.getProduit().getNom());
        }
        
        return dto;
    }

    /**
     * Convertit un DTO DevisDetail en entité
     */
    public DevisDetail toDetailEntity(DevisDetailDTO dto) {
        if (dto == null) {
            return null;
        }
        
        DevisDetail detail = new DevisDetail();
        detail.setId(dto.getId());
        detail.setQuantite(dto.getQuantite());
        detail.setPrixUnitaireHT(dto.getPrixUnitaireHT());
        detail.setTva(dto.getTva());
        
        return detail;
    }
}
