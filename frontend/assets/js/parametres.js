/**
 * Paramètres - Page de configuration de l'application
 * Gère les paramètres utilisateur et entreprise
 */

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadEntreprise();
    setupEventListeners();
});

/**
 * Toggle la visibilité d'un champ mot de passe
 */
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('.material-symbols-outlined');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
    } else {
        input.type = 'password';
        icon.textContent = 'visibility';
    }
}

/**
 * Charge les informations du profil utilisateur depuis la BD
 */
async function loadUserProfile() {
    // Récupérer les données utilisateur depuis localStorage (définies lors de la connexion)
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.id || localStorage.getItem('userId');
    
    if (!userId) {
        console.warn('Aucun utilisateur connecté');
        displayUserFallback(userData);
        return;
    }

    try {
        // Charger les données fraîches depuis l'API
        const user = await API.Users.getById(userId);
        
        // Mettre à jour les affichages
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userRole = document.getElementById('user-role');
        const prenomInput = document.getElementById('prenom');
        const nomInput = document.getElementById('nom');
        
        const fullName = [user.prenom, user.nom].filter(Boolean).join(' ') || 'Utilisateur';
        
        if (userName) userName.textContent = fullName;
        if (userEmail) userEmail.textContent = user.email || '--';
        if (userRole) userRole.textContent = user.role || 'Administrateur';
        if (prenomInput) prenomInput.value = user.prenom || '';
        if (nomInput) nomInput.value = user.nom || '';
        
        // Remplir le champ email actuel
        const currentEmailInput = document.getElementById('current-email');
        if (currentEmailInput) currentEmailInput.value = user.email || '';
        
        // Stocker les données mises à jour
        localStorage.setItem('userData', JSON.stringify(user));
    } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        displayUserFallback(userData);
    }
}

/**
 * Affiche les données utilisateur de fallback
 */
function displayUserFallback(userData) {
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userRole = document.getElementById('user-role');
    const prenomInput = document.getElementById('prenom');
    const nomInput = document.getElementById('nom');
    
    const fullName = [userData.prenom, userData.nom].filter(Boolean).join(' ') || 'Utilisateur';
    
    if (userName) userName.textContent = fullName;
    if (userEmail) userEmail.textContent = userData.email || '--';
    if (userRole) userRole.textContent = userData.role || 'Administrateur';
    if (prenomInput) prenomInput.value = userData.prenom || '';
    if (nomInput) nomInput.value = userData.nom || '';
    
    // Remplir le champ email actuel
    const currentEmailInput = document.getElementById('current-email');
    if (currentEmailInput) currentEmailInput.value = userData.email || '';
}

/**
 * Charge les informations de l'entreprise depuis la BD
 */
async function loadEntreprise() {
    try {
        const entreprise = await API.Entreprise.get();
        if (entreprise) {
            document.getElementById('company-name').value = entreprise.nom || '';
            document.getElementById('company-address').value = entreprise.adresse || '';
            document.getElementById('company-ice').value = entreprise.ice || '';
            document.getElementById('company-if').value = entreprise.identifiantFiscal || '';
            document.getElementById('company-rc').value = entreprise.rc || '';
            document.getElementById('company-patente').value = entreprise.patente || '';
            document.getElementById('company-telephone').value = entreprise.telephone || '';
            document.getElementById('company-email').value = entreprise.email || '';
            
            // Charger le logo s'il existe
            if (entreprise.logo) {
                const logoPreview = document.getElementById('company-logo-preview');
                if (logoPreview) {
                    logoPreview.src = entreprise.logo;
                }
                // Stocker le logo dans localStorage pour le favicon
                localStorage.setItem('entrepriseLogo', entreprise.logo);
            }
            
            // Stocker l'ID si présent pour savoir si c'est une mise à jour
            if (entreprise.id) {
                document.getElementById('company-form')?.setAttribute('data-entreprise-id', entreprise.id);
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des informations entreprise:', error);
    }
}

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Formulaire entreprise
    const companyForm = document.getElementById('company-form');
    if (companyForm) {
        companyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveEntreprise();
        });
    }

    // Upload logo
    const logoInput = document.getElementById('company-logo');
    if (logoInput) {
        logoInput.addEventListener('change', handleLogoUpload);
    }

    // Formulaire profil
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProfile();
        });
    }

    // Formulaire mot de passe
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await changePassword();
        });
    }

    // Formulaire email
    const emailForm = document.getElementById('email-form');
    if (emailForm) {
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await changeEmail();
        });
    }

}

/**
 * Variable pour stocker le logo en base64
 */
let currentLogoBase64 = null;

/**
 * Gère l'upload du logo
 */
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier la taille (max 500KB)
    if (file.size > 500 * 1024) {
        showToast('L\'image ne doit pas dépasser 500KB', 'error');
        event.target.value = '';
        return;
    }

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
        showToast('Veuillez sélectionner une image valide', 'error');
        event.target.value = '';
        return;
    }

    // Convertir en base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        currentLogoBase64 = base64;
        
        // Afficher la prévisualisation
        const preview = document.getElementById('company-logo-preview');
        if (preview) {
            preview.src = base64;
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Sauvegarde les informations de l'entreprise dans la BD
 */
async function saveEntreprise() {
    const entrepriseData = {
        nom: document.getElementById('company-name').value,
        adresse: document.getElementById('company-address').value,
        ice: document.getElementById('company-ice').value,
        identifiantFiscal: document.getElementById('company-if').value,
        rc: document.getElementById('company-rc').value,
        patente: document.getElementById('company-patente').value,
        telephone: document.getElementById('company-telephone').value,
        email: document.getElementById('company-email').value
    };

    // Ajouter le logo s'il a été modifié
    if (currentLogoBase64) {
        entrepriseData.logo = currentLogoBase64;
    }

    try {
        // Essayer de mettre à jour d'abord, sinon créer
        try {
            await API.Entreprise.update(entrepriseData);
        } catch (e) {
            await API.Entreprise.save(entrepriseData);
        }
        
        // Mettre à jour le nom dans localStorage et le sidebar
        if (entrepriseData.nom) {
            localStorage.setItem('entrepriseNom', entrepriseData.nom);
            // Mettre à jour le sidebar dynamiquement
            if (typeof updateSidebarEntrepriseName === 'function') {
                updateSidebarEntrepriseName(entrepriseData.nom);
            } else {
                // Fallback: mettre à jour directement l'élément
                const sidebarName = document.getElementById('sidebar-entreprise-name');
                if (sidebarName) {
                    sidebarName.textContent = entrepriseData.nom;
                }
            }
            // Mettre à jour le titre de la page
            if (window.AppLoader && typeof window.AppLoader.updatePageTitle === 'function') {
                window.AppLoader.updatePageTitle();
            }
        }
        
        // Mettre à jour le logo dans localStorage et le favicon
        if (entrepriseData.logo) {
            localStorage.setItem('entrepriseLogo', entrepriseData.logo);
            // Mettre à jour le favicon dynamiquement
            if (window.AppLoader && typeof window.AppLoader.updateFavicon === 'function') {
                window.AppLoader.updateFavicon();
            }
            // Mettre à jour le logo dans le sidebar
            if (typeof updateSidebarLogo === 'function') {
                updateSidebarLogo(entrepriseData.logo);
            } else {
                // Fallback: mettre à jour directement l'élément
                const sidebarLogo = document.getElementById('sidebar-logo-container');
                if (sidebarLogo) {
                    sidebarLogo.innerHTML = `<img src="${entrepriseData.logo}" alt="Logo" class="w-8 h-8 rounded-lg object-cover">`;
                }
            }
        }
        
        showToast('Informations entreprise enregistrées avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showToast('Erreur lors de la sauvegarde des informations', 'error');
    }
}

/**
 * Sauvegarde le profil utilisateur dans la BD
 */
async function saveProfile() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.id || localStorage.getItem('userId');
    
    if (!userId) {
        showToast('Erreur: utilisateur non identifié. Veuillez vous reconnecter.', 'error');
        return;
    }

    const profileData = {
        prenom: document.getElementById('prenom').value,
        nom: document.getElementById('nom').value
    };

    try {
        const updatedUser = await API.Users.updateProfile(userId, profileData);
        
        // Mettre à jour le localStorage
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        
        // Mettre à jour l'affichage
        const fullName = [updatedUser.prenom, updatedUser.nom].filter(Boolean).join(' ') || 'Utilisateur';
        const userName = document.getElementById('user-name');
        if (userName) userName.textContent = fullName;
        
        showToast('Profil mis à jour avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        showToast('Erreur lors de la mise à jour du profil', 'error');
    }
}

/**
 * Change le mot de passe de l'utilisateur dans la BD
 */
async function changePassword() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.id || localStorage.getItem('userId');
    
    if (!userId) {
        showToast('Erreur: utilisateur non identifié. Veuillez vous reconnecter.', 'error');
        return;
    }

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('Les nouveaux mots de passe ne correspondent pas', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('Le nouveau mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }

    try {
        await API.Users.changePassword(userId, {
            currentPassword: currentPassword,
            newPassword: newPassword
        });
        
        // Vider les champs
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        showToast('Mot de passe modifié avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        showToast(error.message || 'Mot de passe actuel incorrect', 'error');
    }
}

/**
 * Change l'email de l'utilisateur dans la BD
 */
async function changeEmail() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.id || localStorage.getItem('userId');
    
    if (!userId) {
        showToast('Erreur: utilisateur non identifié. Veuillez vous reconnecter.', 'error');
        return;
    }

    const currentEmail = document.getElementById('current-email').value;
    const newEmail = document.getElementById('new-email').value;

    // Validations
    if (!newEmail) {
        showToast('Veuillez saisir le nouvel email', 'error');
        return;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        showToast('Veuillez saisir un email valide', 'error');
        return;
    }

    if (newEmail === currentEmail) {
        showToast('Le nouvel email doit être différent de l\'email actuel', 'error');
        return;
    }

    try {
        // Mettre à jour l'utilisateur avec le nouvel email
        const updatedUser = await API.Users.updateProfile(userId, { email: newEmail });
        
        // Mettre à jour le localStorage
        userData.email = newEmail;
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('userEmail', newEmail);
        
        // Mettre à jour l'affichage
        const userEmailDisplay = document.getElementById('user-email');
        if (userEmailDisplay) userEmailDisplay.textContent = newEmail;
        
        // Mettre à jour le champ email actuel
        document.getElementById('current-email').value = newEmail;
        
        // Vider le champ nouvel email
        document.getElementById('new-email').value = '';
        
        showToast('Email modifié avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors du changement d\'email:', error);
        showToast(error.message || 'Erreur lors du changement d\'email', 'error');
    }
}

/**
 * Affiche un toast
 */
function showToast(message, type = 'info') {
    if (window.Utils && window.Utils.showToast) {
        window.Utils.showToast(message, type);
        return;
    }

    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Export pour utilisation globale
window.SettingsPage = {
    loadUserProfile,
    loadEntreprise,
    saveEntreprise,
    saveProfile,
    changePassword,
    changeEmail
};
