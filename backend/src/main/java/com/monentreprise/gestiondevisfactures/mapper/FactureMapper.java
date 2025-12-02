package com.monentreprise.gestiondevisfactures.mapper;

import com.monentreprise.gestiondevisfactures.dto.FactureDTO;
import com.monentreprise.gestiondevisfactures.dto.FactureDetailDTO;
import com.monentreprise.gestiondevisfactures.entity.Facture;
import com.monentreprise.gestiondevisfactures.entity.FactureDetail;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Mapper pour convertir entre Facture et FactureDTO
 */
@Component
public class FactureMapper {

    /**
     * Convertit une entité Facture en DTO
     */
    public FactureDTO toDTO(Facture facture) {
        if (facture == null) {
            return null;
        }
        
        FactureDTO dto = new FactureDTO();
        dto.setId(facture.getId());
        dto.setNumeroFacture(facture.getNumeroFacture());
        dto.setDateFacture(facture.getDateFacture());
        dto.setMontantHT(facture.getMontantHT());
        dto.setMontantTVA(facture.getMontantTVA());
        dto.setMontantTTC(facture.getMontantTTC());
        dto.setModePaiement(facture.getModePaiement());
        dto.setStatut(facture.getStatut());
        
        if (facture.getClient() != null) {
            dto.setClientId(facture.getClient().getId());
            dto.setClientNom(facture.getClient().getNom());
            dto.setClientEmail(facture.getClient().getEmail());
            dto.setClientTelephone(facture.getClient().getTelephone());
            dto.setClientAdresse(facture.getClient().getAdresse());
        }
        
        if (facture.getDevisOrigine() != null) {
            dto.setDevisOrigineId(facture.getDevisOrigine().getId());
            dto.setDevisOrigineNumero(facture.getDevisOrigine().getNumeroDevis());
        }
        
        if (facture.getLignes() != null) {
            dto.setLignes(facture.getLignes().stream()
                    .map(this::toDetailDTO)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    /**
     * Convertit une ligne FactureDetail en DTO
     */
    public FactureDetailDTO toDetailDTO(FactureDetail detail) {
        if (detail == null) {
            return null;
        }
        
        FactureDetailDTO dto = new FactureDetailDTO();
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
     * Convertit un DTO FactureDetail en entité
     */
    public FactureDetail toDetailEntity(FactureDetailDTO dto) {
        if (dto == null) {
            return null;
        }
        
        FactureDetail detail = new FactureDetail();
        detail.setId(dto.getId());
        detail.setQuantite(dto.getQuantite());
        detail.setPrixUnitaireHT(dto.getPrixUnitaireHT());
        detail.setTva(dto.getTva());
        
        return detail;
    }
}
