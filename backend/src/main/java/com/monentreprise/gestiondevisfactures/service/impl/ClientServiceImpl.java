package com.monentreprise.gestiondevisfactures.service.impl;

import com.monentreprise.gestiondevisfactures.dto.ClientDTO;
import com.monentreprise.gestiondevisfactures.entity.Client;
import com.monentreprise.gestiondevisfactures.exception.BusinessException;
import com.monentreprise.gestiondevisfactures.exception.ResourceNotFoundException;
import com.monentreprise.gestiondevisfactures.mapper.ClientMapper;
import com.monentreprise.gestiondevisfactures.repository.ClientRepository;
import com.monentreprise.gestiondevisfactures.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du service de gestion des clients
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ClientDTO> findAll() {
        return clientRepository.findAll().stream()
                .map(clientMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDTO> findAllActifs() {
        return clientRepository.findByActifTrue().stream()
                .map(clientMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDTO findById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", id));
        return clientMapper.toDTO(client);
    }

    @Override
    public ClientDTO create(ClientDTO clientDTO) {
        // Vérifier si l'email existe déjà
        if (clientRepository.existsByEmail(clientDTO.getEmail())) {
            throw new BusinessException("Un client avec cet email existe déjà : " + clientDTO.getEmail());
        }

        Client client = clientMapper.toEntity(clientDTO);
        client.setActif(true);
        Client savedClient = clientRepository.save(client);
        return clientMapper.toDTO(savedClient);
    }

    @Override
    public ClientDTO update(Long id, ClientDTO clientDTO) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", id));

        // Vérifier si l'email modifié n'existe pas déjà pour un autre client
        if (!client.getEmail().equals(clientDTO.getEmail()) &&
                clientRepository.existsByEmail(clientDTO.getEmail())) {
            throw new BusinessException("Un client avec cet email existe déjà : " + clientDTO.getEmail());
        }

        clientMapper.updateEntityFromDTO(clientDTO, client);
        Client updatedClient = clientRepository.save(client);
        return clientMapper.toDTO(updatedClient);
    }

    @Override
    public void delete(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", id));
        
        // Soft delete - on désactive le client
        client.setActif(false);
        clientRepository.save(client);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDTO> searchByNom(String nom) {
        return clientRepository.findByNomContainingIgnoreCase(nom).stream()
                .map(clientMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDTO> search(String search) {
        return clientRepository.searchByNomOrEmail(search).stream()
                .map(clientMapper::toDTO)
                .collect(Collectors.toList());
    }
}
