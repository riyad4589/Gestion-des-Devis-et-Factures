package com.monentreprise.gestiondevisfactures.service.impl;

import com.monentreprise.gestiondevisfactures.dto.FactureDTO;
import com.monentreprise.gestiondevisfactures.dto.FactureDetailDTO;
import com.monentreprise.gestiondevisfactures.entity.*;
import com.monentreprise.gestiondevisfactures.exception.BusinessException;
import com.monentreprise.gestiondevisfactures.exception.ResourceNotFoundException;
import com.monentreprise.gestiondevisfactures.mapper.FactureMapper;
import com.monentreprise.gestiondevisfactures.repository.ClientRepository;
import com.monentreprise.gestiondevisfactures.repository.DevisRepository;
import com.monentreprise.gestiondevisfactures.repository.FactureRepository;
import com.monentreprise.gestiondevisfactures.repository.ProduitRepository;
import com.monentreprise.gestiondevisfactures.service.FactureService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du service de gestion des factures
 */
@Service
@RequiredArgsConstructor
@Transactional
public class FactureServiceImpl implements FactureService {

    private final FactureRepository factureRepository;
    private final ClientRepository clientRepository;
    private final DevisRepository devisRepository;
    private final ProduitRepository produitRepository;
    private final FactureMapper factureMapper;

    @Override
    @Transactional(readOnly = true)
    public List<FactureDTO> findAll() {
        return factureRepository.findAll().stream()
                .map(factureMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FactureDTO findById(Long id) {
        Facture facture = factureRepository.findByIdWithLignes(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facture", "id", id));
        return factureMapper.toDTO(facture);
    }

    @Override
    @Transactional(readOnly = true)
    public FactureDTO findByNumero(String numero) {
        Facture facture = factureRepository.findByNumeroFacture(numero)
                .orElseThrow(() -> new ResourceNotFoundException("Facture", "numero", numero));
        return factureMapper.toDTO(facture);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FactureDTO> findByClientId(Long clientId) {
        return factureRepository.findByClientId(clientId).stream()
                .map(factureMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FactureDTO> findByStatut(Facture.StatutFacture statut) {
        return factureRepository.findByStatut(statut).stream()
                .map(factureMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FactureDTO create(FactureDTO factureDTO) {
        // Récupérer le client
        Client client = clientRepository.findById(factureDTO.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", factureDTO.getClientId()));

        // Créer la facture
        Facture facture = new Facture();
        facture.setClient(client);
        facture.setNumeroFacture(genererNumeroFacture());
        facture.setDateFacture(LocalDateTime.now());
        facture.setStatut(Facture.StatutFacture.NON_PAYEE);
        facture.setModePaiement(factureDTO.getModePaiement());

        // Lier au devis d'origine si présent
        if (factureDTO.getDevisOrigineId() != null) {
            Devis devis = devisRepository.findById(factureDTO.getDevisOrigineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Devis", "id", factureDTO.getDevisOrigineId()));
            facture.setDevisOrigine(devis);
        }

        // Ajouter les lignes
        if (factureDTO.getLignes() != null) {
            for (FactureDetailDTO ligneDTO : factureDTO.getLignes()) {
                FactureDetail ligne = creerLigneFacture(ligneDTO);
                facture.addLigne(ligne);
            }
        }

        // Calculer les totaux
        facture.recalculerTotaux();

        Facture savedFacture = factureRepository.save(facture);
        return factureMapper.toDTO(savedFacture);
    }

    @Override
    public FactureDTO update(Long id, FactureDTO factureDTO) {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facture", "id", id));

        // On ne peut modifier que le statut et le mode de paiement
        if (factureDTO.getStatut() != null) {
            facture.setStatut(factureDTO.getStatut());
        }
        if (factureDTO.getModePaiement() != null) {
            facture.setModePaiement(factureDTO.getModePaiement());
        }

        Facture updatedFacture = factureRepository.save(facture);
        return factureMapper.toDTO(updatedFacture);
    }

    @Override
    public FactureDTO marquerPayee(Long id, Facture.ModePaiement modePaiement) {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facture", "id", id));

        if (facture.getStatut() == Facture.StatutFacture.ANNULEE) {
            throw new BusinessException("Impossible de marquer une facture annulée comme payée");
        }

        facture.setStatut(Facture.StatutFacture.PAYEE);
        if (modePaiement != null) {
            facture.setModePaiement(modePaiement);
        }

        Facture updatedFacture = factureRepository.save(facture);
        return factureMapper.toDTO(updatedFacture);
    }

    @Override
    public FactureDTO annuler(Long id) {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facture", "id", id));

        if (facture.getStatut() == Facture.StatutFacture.PAYEE) {
            throw new BusinessException("Impossible d'annuler une facture déjà payée");
        }

        facture.setStatut(Facture.StatutFacture.ANNULEE);
        Facture cancelledFacture = factureRepository.save(facture);
        return factureMapper.toDTO(cancelledFacture);
    }

    @Override
    public String genererNumeroFacture() {
        int annee = Year.now().getValue();
        Long count = factureRepository.countByAnnee(annee);
        return String.format("FAC-%d-%04d", annee, count + 1);
    }

    /**
     * Crée une ligne de facture à partir d'un DTO
     */
    private FactureDetail creerLigneFacture(FactureDetailDTO ligneDTO) {
        Produit produit = produitRepository.findById(ligneDTO.getProduitId())
                .orElseThrow(() -> new ResourceNotFoundException("Produit", "id", ligneDTO.getProduitId()));

        FactureDetail ligne = new FactureDetail();
        ligne.setProduit(produit);
        ligne.setQuantite(ligneDTO.getQuantite());
        ligne.setPrixUnitaireHT(ligneDTO.getPrixUnitaireHT() != null ? 
                ligneDTO.getPrixUnitaireHT() : produit.getPrixUnitaireHT());
        ligne.setTva(ligneDTO.getTva() != null ? ligneDTO.getTva() : new BigDecimal("20.00"));
        ligne.calculerTotaux();

        return ligne;
    }

    @Override
    public void delete(Long id) {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facture", "id", id));

        // Hard delete - suppression définitive de la base de données
        factureRepository.delete(facture);
    }
}
