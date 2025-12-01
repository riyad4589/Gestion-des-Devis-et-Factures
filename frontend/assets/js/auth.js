/**
 * Auth - Gestion de l'authentification
 * Gère la connexion et la déconnexion avec le backend
 */

const AUTH_API_URL = '/api/auth';

document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si déjà connecté
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;
    
    if (isLoggedIn && currentPage.includes('connexion')) {
        // Déjà connecté, rediriger vers le dashboard
        window.location.href = 'dashboard.html';
        return;
    }

    setupLoginForm();
    setupEventListeners();
});

/**
 * Configure le formulaire de connexion
 */
function setupLoginForm() {
    // Chercher le formulaire ou le bouton de connexion
    const form = document.querySelector('form');
    const loginBtn = document.getElementById('login-btn') || document.querySelector('button:not(#toggle-password)');
    
    if (form) {
        form.addEventListener('submit', handleLogin);
    } else if (loginBtn) {
        // Si pas de formulaire, ajouter l'événement au bouton
        loginBtn.addEventListener('click', handleLoginClick);
    }

    // Gérer le bouton "Se souvenir de moi"
    const rememberMe = document.querySelector('[type="checkbox"]');
    if (rememberMe) {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            const emailInput = document.querySelector('input[type="email"], input[placeholder*="email"]');
            if (emailInput) {
                emailInput.value = savedEmail;
                rememberMe.checked = true;
            }
        }
    }
}

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Lien mot de passe oublié
    document.querySelectorAll('a').forEach(link => {
        if (link.textContent.toLowerCase().includes('oublié')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showForgotPasswordModal();
            });
        }
    });
}

/**
 * Gère le clic sur le bouton de connexion (sans formulaire)
 */
async function handleLoginClick(e) {
    e.preventDefault();
    
    const emailInput = document.querySelector('input[type="email"], input[placeholder*="email"]');
    const passwordInput = document.getElementById('password-input') || document.querySelector('input[type="password"]');
    const rememberMe = document.querySelector('[type="checkbox"]');
    
    const email = emailInput?.value?.trim();
    const password = passwordInput?.value;
    
    await performLogin(email, password, rememberMe?.checked, e.target);
}

/**
 * Gère la soumission du formulaire de connexion
 */
async function handleLogin(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"], button');

    // Récupérer les valeurs
    const emailInput = form.querySelector('input[type="email"], input[placeholder*="email"]');
    const passwordInput = form.querySelector('input[type="password"]');
    const rememberMe = form.querySelector('[type="checkbox"]');

    const email = emailInput?.value?.trim();
    const password = passwordInput?.value;

    await performLogin(email, password, rememberMe?.checked, submitBtn);
}

/**
 * Effectue la connexion avec l'API
 */
async function performLogin(email, password, rememberMe, submitBtn) {
    // Validation
    if (!email || !password) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }

    // Sauvegarder le texte original du bouton
    const originalText = submitBtn?.innerHTML || 'Connexion';

    // Désactiver le bouton
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<svg class="animate-spin h-5 w-5 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Connexion...';
    }

    try {
        // Appel API réel au backend
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Sauvegarder l'état de connexion
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userName', data.user.prenom || data.user.nom || email.split('@')[0]);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userId', data.user.id);

            // Se souvenir de l'email si demandé
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            showToast('Connexion réussie !', 'success');

            // Rediriger vers le dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } else {
            throw new Error(data.message || 'Email ou mot de passe incorrect');
        }

    } catch (error) {
        console.error('Erreur de connexion:', error);
        
        // Si l'API n'est pas disponible, afficher un message approprié
        if (error.message.includes('fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
            showToast('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.', 'error');
        } else {
            showToast(error.message || 'Erreur de connexion', 'error');
        }
        
        // Réactiver le bouton
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

/**
 * Déconnexion de l'utilisateur
 */
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    
    showToast('Déconnexion réussie', 'success');
    
    setTimeout(() => {
        window.location.href = 'écran_connexion.html';
    }, 500);
}

/**
 * Vérifie si l'utilisateur est connecté
 */
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'écran_connexion.html';
        return false;
    }
    return true;
}

/**
 * Récupère les informations de l'utilisateur connecté
 */
function getCurrentUser() {
    return {
        id: localStorage.getItem('userId'),
        email: localStorage.getItem('userEmail'),
        name: localStorage.getItem('userName'),
        role: localStorage.getItem('userRole')
    };
}

/**
 * Affiche le modal de mot de passe oublié
 */
function showForgotPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mot de passe oublié</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
                Contactez l'administrateur pour réinitialiser votre mot de passe.
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Email admin: admin@gmail.com
            </p>
            <div class="flex justify-end">
                <button onclick="this.closest('.fixed').remove()" 
                    class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                    Fermer
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/**
 * Affiche un toast de notification
 */
function showToast(message, type = 'info') {
    // Supprimer les anciens toasts
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast-notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
    
    // Couleurs selon le type
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    toast.classList.add(...(colors[type] || colors.info).split(' '));
    toast.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl">
                ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'}
            </span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);
    
    // Suppression automatique
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Exposer les fonctions globalement
window.logout = logout;
window.checkAuth = checkAuth;
window.getCurrentUser = getCurrentUser;
