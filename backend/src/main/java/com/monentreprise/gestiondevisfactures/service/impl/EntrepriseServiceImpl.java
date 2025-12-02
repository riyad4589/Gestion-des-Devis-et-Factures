package com.monentreprise.gestiondevisfactures.service.impl;

import com.monentreprise.gestiondevisfactures.dto.EntrepriseDTO;
import com.monentreprise.gestiondevisfactures.entity.Entreprise;
import com.monentreprise.gestiondevisfactures.mapper.EntrepriseMapper;
import com.monentreprise.gestiondevisfactures.repository.EntrepriseRepository;
import com.monentreprise.gestiondevisfactures.service.EntrepriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Implémentation du service de gestion des informations de l'entreprise
 */
@Service
@RequiredArgsConstructor
@Transactional
public class EntrepriseServiceImpl implements EntrepriseService {

    private final EntrepriseRepository entrepriseRepository;
    private final EntrepriseMapper entrepriseMapper;

    @Override
    @Transactional(readOnly = true)
    public EntrepriseDTO getEntreprise() {
        Optional<Entreprise> entreprise = entrepriseRepository.findFirstByOrderByIdAsc();
        return entreprise.map(entrepriseMapper::toDTO).orElse(new EntrepriseDTO());
    }

    @Override
    public EntrepriseDTO saveEntreprise(EntrepriseDTO entrepriseDTO) {
        Optional<Entreprise> existingEntreprise = entrepriseRepository.findFirstByOrderByIdAsc();
        
        Entreprise entreprise;
        if (existingEntreprise.isPresent()) {
            // Mise à jour de l'entreprise existante
            entreprise = existingEntreprise.get();
            entrepriseMapper.updateEntityFromDTO(entrepriseDTO, entreprise);
        } else {
            // Création d'une nouvelle entreprise
            entreprise = entrepriseMapper.toEntity(entrepriseDTO);
        }
        
        Entreprise savedEntreprise = entrepriseRepository.save(entreprise);
        return entrepriseMapper.toDTO(savedEntreprise);
    }
}
