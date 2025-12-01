package com.monentreprise.gestiondevisfactures.service.impl;

import com.monentreprise.gestiondevisfactures.dto.DevisDTO;
import com.monentreprise.gestiondevisfactures.dto.DevisDetailDTO;
import com.monentreprise.gestiondevisfactures.dto.FactureDTO;
import com.monentreprise.gestiondevisfactures.entity.*;
import com.monentreprise.gestiondevisfactures.exception.BusinessException;
import com.monentreprise.gestiondevisfactures.exception.ResourceNotFoundException;
import com.monentreprise.gestiondevisfactures.mapper.DevisMapper;
import com.monentreprise.gestiondevisfactures.repository.ClientRepository;
import com.monentreprise.gestiondevisfactures.repository.DevisRepository;
import com.monentreprise.gestiondevisfactures.repository.ProduitRepository;
import com.monentreprise.gestiondevisfactures.service.DevisService;
import com.monentreprise.gestiondevisfactures.service.FactureService;
import com.monentreprise.gestiondevisfactures.service.ProduitService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du service de gestion des devis
 */
@Service
@Transactional
public class DevisServiceImpl implements DevisService {

    private final DevisRepository devisRepository;
    private final ClientRepository clientRepository;
    private final ProduitRepository produitRepository;
    private final DevisMapper devisMapper;
    private final FactureService factureService;
    private final ProduitService produitService;

    public DevisServiceImpl(DevisRepository devisRepository, 
                           ClientRepository clientRepository,
                           ProduitRepository produitRepository, 
                           DevisMapper devisMapper,
                           @Lazy FactureService factureService,
                           ProduitService produitService) {
        this.devisRepository = devisRepository;
        this.clientRepository = clientRepository;
        this.produitRepository = produitRepository;
        this.devisMapper = devisMapper;
        this.factureService = factureService;
        this.produitService = produitService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DevisDTO> findAll() {
        return devisRepository.findAll().stream()
                .map(devisMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DevisDTO findById(Long id) {
        Devis devis = devisRepository.findByIdWithLignes(id)
                .orElseThrow(() -> new ResourceNotFoundException("Devis", "id", id));
        return devisMapper.toDTO(devis);
    }

    @Override
    @Transactional(readOnly = true)
    public DevisDTO findByNumero(String numero) {
        Devis devis = devisRepository.findByNumeroDevis(numero)
                .orElseThrow(() -> new ResourceNotFoundException("Devis", "numero", numero));
        return devisMapper.toDTO(devis);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DevisDTO> findByClientId(Long clientId) {
        return devisRepository.findByClientIdWithLignes(clientId).stream()
                .map(devisMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DevisDTO create(DevisDTO devisDTO) {
        // Récupérer le client
        Client client = clientRepository.findById(devisDTO.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", devisDTO.getClientId()));

        // Créer le devis
        Devis devis = new Devis();
        devis.setClient(client);
        devis.setNumeroDevis(genererNumeroDevis());
        devis.setDateDevis(LocalDateTime.now());
        devis.setStatut(Devis.StatutDevis.EN_COURS);
        devis.setCommentaire(devisDTO.getCommentaire());

        // Ajouter les lignes
        if (devisDTO.getLignes() != null) {
            for (DevisDetailDTO ligneDTO : devisDTO.getLignes()) {
                DevisDetail ligne = creerLigneDevis(ligneDTO);
                devis.addLigne(ligne);
            }
        }

        // Calculer les totaux
        devis.recalculerTotaux();

        Devis savedDevis = devisRepository.save(devis);
        return devisMapper.toDTO(savedDevis);
    }

    @Override
    public DevisDTO update(Long id, DevisDTO devisDTO) {
        Devis devis = devisRepository.findByIdWithLignes(id)
                .orElseThrow(() -> new ResourceNotFoundException("Devis", "id", id));

        // Vérifier que le devis peut être modifié
        if (devis.getStatut() != Devis.StatutDevis.EN_COURS) {
            throw new BusinessException("Impossible de modifier un devis qui n'est pas en cours. Statut actuel : " + devis.getStatut());
        }

        // Mettre à jour le client si changé
        if (devisDTO.getClientId() != null && !devisDTO.getClientId().equals(devis.getClient().getId())) {
            Client client = clientRepository.findById(devisDTO.getClientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client", "id", devisDTO.getClientId()));
            devis.setClient(client);
        }

        devis.setCommentaire(devisDTO.getCommentaire());

        // Remplacer les lignes
        devis.getLignes().clear();
        if (devisDTO.getLignes() != null) {
            for (DevisDetailDTO ligneDTO : devisDTO.getLignes()) {
                DevisDetail ligne = creerLigneDevis(ligneDTO);
                devis.addLigne(ligne);
            }
        }

        // Recalculer les totaux
        devis.recalculerTotaux();

        Devis updatedDevis = devisRepository.save(devis);
        return devisMapper.toDTO(updatedDevis);
    }

    @Override
    public void delete(Long id) {
        Devis devis = devisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Devis", "id", id));

        if (devis.getStatut() == Devis.StatutDevis.TRANSFORME_EN_FACTURE) {
            throw new BusinessException("Impossible de supprimer un devis transformé en facture");
        }

        devisRepository.delete(devis);
    }

    @Override
    public DevisDTO valider(Long id) {
        Devis devis = devisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Devis", "id", id));

        if (devis.getStatut() != Devis.StatutDevis.EN_COURS) {
            throw new BusinessException("Seul un devis en cours peut être validé. Statut actuel : " + devis.getStatut());
        }

        devis.setStatut(Devis.StatutDevis.VALIDE);
        Devis validatedDevis = devisRepository.save(devis);
        return devisMapper.toDTO(validatedDevis);
    }

    @Override
    public DevisDTO annuler(Long id) {
        Devis devis = devisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Devis", "id", id));

        if (devis.getStatut() == Devis.StatutDevis.TRANSFORME_EN_FACTURE) {
            throw new BusinessException("Impossible d'annuler un devis déjà transformé en facture");
        }

        devis.setStatut(Devis.StatutDevis.ANNULE);
        Devis cancelledDevis = devisRepository.save(devis);
        return devisMapper.toDTO(cancelledDevis);
    }

    @Override
    public FactureDTO convertirEnFacture(Long devisId) {
        Devis devis = devisRepository.findByIdWithLignes(devisId)
                .orElseThrow(() -> new ResourceNotFoundException("Devis", "id", devisId));

        if (devis.getStatut() != Devis.StatutDevis.VALIDE) {
            throw new BusinessException("Seul un devis validé peut être converti en facture. Statut actuel : " + devis.getStatut());
        }

        // Vérifier les stocks
        for (DevisDetail ligne : devis.getLignes()) {
            Produit produit = ligne.getProduit();
            if (produit.getStock() < ligne.getQuantite()) {
                throw new BusinessException("Stock insuffisant pour le produit : " + produit.getNom() +
                        ". Stock disponible : " + produit.getStock() + ", quantité demandée : " + ligne.getQuantite());
            }
        }

        // Créer la facture
        FactureDTO factureDTO = new FactureDTO();
        factureDTO.setClientId(devis.getClient().getId());
        factureDTO.setDevisOrigineId(devis.getId());

        // Copier les lignes
        for (DevisDetail ligneDevis : devis.getLignes()) {
            com.monentreprise.gestiondevisfactures.dto.FactureDetailDTO ligneFacture = 
                new com.monentreprise.gestiondevisfactures.dto.FactureDetailDTO();
            ligneFacture.setProduitId(ligneDevis.getProduit().getId());
            ligneFacture.setQuantite(ligneDevis.getQuantite());
            ligneFacture.setPrixUnitaireHT(ligneDevis.getPrixUnitaireHT());
            ligneFacture.setTva(ligneDevis.getTva());
            factureDTO.getLignes().add(ligneFacture);
        }

        // Créer la facture
        FactureDTO createdFacture = factureService.create(factureDTO);

        // Décrémenter les stocks
        for (DevisDetail ligne : devis.getLignes()) {
            produitService.updateStock(ligne.getProduit().getId(), ligne.getQuantite());
        }

        // Mettre à jour le statut du devis
        devis.setStatut(Devis.StatutDevis.TRANSFORME_EN_FACTURE);
        devisRepository.save(devis);

        return createdFacture;
    }

    @Override
    public String genererNumeroDevis() {
        int annee = Year.now().getValue();
        Long count = devisRepository.countByAnnee(annee);
        return String.format("DEV-%d-%04d", annee, count + 1);
    }

    /**
     * Crée une ligne de devis à partir d'un DTO
     */
    private DevisDetail creerLigneDevis(DevisDetailDTO ligneDTO) {
        Produit produit = produitRepository.findById(ligneDTO.getProduitId())
                .orElseThrow(() -> new ResourceNotFoundException("Produit", "id", ligneDTO.getProduitId()));

        DevisDetail ligne = new DevisDetail();
        ligne.setProduit(produit);
        ligne.setQuantite(ligneDTO.getQuantite());
        ligne.setPrixUnitaireHT(ligneDTO.getPrixUnitaireHT() != null ? 
                ligneDTO.getPrixUnitaireHT() : produit.getPrixUnitaireHT());
        ligne.setTva(ligneDTO.getTva() != null ? ligneDTO.getTva() : new BigDecimal("20.00"));
        ligne.calculerTotaux();

        return ligne;
    }
}
