package com.monentreprise.gestiondevisfactures.service;

import com.monentreprise.gestiondevisfactures.dto.LoginRequest;
import com.monentreprise.gestiondevisfactures.dto.LoginResponse;
import com.monentreprise.gestiondevisfactures.dto.UserDTO;
import com.monentreprise.gestiondevisfactures.entity.User;
import com.monentreprise.gestiondevisfactures.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Initialise l'utilisateur admin par défaut au démarrage
     */
    @PostConstruct
    public void initDefaultUser() {
        if (!userRepository.existsByEmail("admin@gmail.com")) {
            User admin = new User();
            admin.setEmail("admin@gmail.com");
            admin.setPassword("admin123");
            admin.setNom("Admin");
            admin.setPrenom("System");
            admin.setRole("ADMIN");
            admin.setActif(true);
            userRepository.save(admin);
            System.out.println("✅ Utilisateur admin créé : admin@gmail.com / admin123");
        }
    }

    /**
     * Authentifie un utilisateur
     */
    public LoginResponse authenticate(LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
        
        if (userOpt.isEmpty()) {
            return new LoginResponse(false, "Email ou mot de passe incorrect");
        }

        User user = userOpt.get();
        
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            return new LoginResponse(false, "Email ou mot de passe incorrect");
        }

        if (!user.getActif()) {
            return new LoginResponse(false, "Ce compte est désactivé");
        }

        // Mettre à jour la dernière connexion
        user.setDerniereConnexion(LocalDateTime.now());
        userRepository.save(user);

        UserDTO userDTO = convertToDTO(user);
        return new LoginResponse(true, "Connexion réussie", userDTO);
    }

    /**
     * Récupère tous les utilisateurs
     */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un utilisateur par ID
     */
    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id).map(this::convertToDTO);
    }

    /**
     * Récupère un utilisateur par email
     */
    public Optional<UserDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(this::convertToDTO);
    }

    /**
     * Crée un nouvel utilisateur
     */
    public UserDTO createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    /**
     * Met à jour un utilisateur
     * Note: Le rôle et le statut actif ne sont modifiés que si explicitement fournis
     * et différents de la valeur par défaut (pour éviter les écrasements accidentels)
     */
    public UserDTO updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (userDetails.getNom() != null) user.setNom(userDetails.getNom());
        if (userDetails.getPrenom() != null) user.setPrenom(userDetails.getPrenom());
        if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(userDetails.getPassword());
        }
        // Ne pas écraser le rôle avec la valeur par défaut "USER"
        // Le rôle ne doit être modifié que si explicitement demandé avec une valeur différente
        // Pour changer le rôle, utiliser une API admin dédiée ou envoyer explicitement le rôle
        
        // Ne pas modifier actif automatiquement (géré séparément)

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    /**
     * Supprime un utilisateur
     */
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * Change le mot de passe d'un utilisateur
     */
    public void changePassword(Long id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier le mot de passe actuel
        if (!user.getPassword().equals(currentPassword)) {
            throw new RuntimeException("Mot de passe actuel incorrect");
        }

        // Valider le nouveau mot de passe
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Le nouveau mot de passe doit contenir au moins 6 caractères");
        }

        // Mettre à jour le mot de passe
        user.setPassword(newPassword);
        userRepository.save(user);
    }

    /**
     * Convertit une entité User en DTO
     */
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setRole(user.getRole());
        dto.setActif(user.getActif());
        dto.setDateCreation(user.getDateCreation());
        dto.setDerniereConnexion(user.getDerniereConnexion());
        return dto;
    }
}
