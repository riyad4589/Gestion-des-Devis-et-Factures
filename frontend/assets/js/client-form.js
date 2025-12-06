/**
 * Client Form - Formulaire de création/modification de client
 * Gère le formulaire de la page modification_client.html
 */

let clientId = null;
let isEditMode = false;

document.addEventListener('DOMContentLoaded', () => {
    // Récupérer l'ID du client depuis l'URL si présent
    const urlParams = new URLSearchParams(window.location.search);
    clientId = urlParams.get('id');
    isEditMode = !!clientId;

    console.log('Mode édition client:', isEditMode, 'ID client:', clientId);

    updatePageTitle();
    setupForm();
    setupEventListeners();
    
    if (isEditMode) {
        loadClient();
    }
});

/**
 * Met à jour le titre de la page selon le mode
 */
function updatePageTitle() {
    const title = document.getElementById('page-title') || document.querySelector('h1, .page-title');
    if (title) {
        title.textContent = isEditMode ? 'Modifier le client' : 'Nouveau client';
    }

    // Mettre à jour le fil d'Ariane si présent
    const breadcrumb = document.getElementById('breadcrumb-action') || document.querySelector('.breadcrumb-current, nav span:last-child');
    if (breadcrumb) {
        breadcrumb.textContent = isEditMode ? 'Modifier le client' : 'Nouveau client';
    }
}

/**
 * Charge les données du client pour modification
 */
async function loadClient() {
    if (!clientId) {
        console.log('Aucun ID de client fourni - mode création');
        return;
    }

    console.log('Chargement du client avec ID:', clientId);

    try {
        // Attendre que l'API soit disponible
        if (!window.API || !window.API.Clients) {
            console.error('L\'API Clients n\'est pas disponible');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!window.API || !window.API.Clients) {
                throw new Error('API Clients indisponible');
            }
        }

        console.log('Récupération du client depuis l\'API...');
        const client = await window.API.Clients.getById(clientId);
        
        console.log('Client reçu:', client);
        
        if (!client) {
            throw new Error('Client non trouvé');
        }

        populateForm(client);
        updatePageTitle();
        console.log('Formulaire client chargé avec succès');
    } catch (error) {
        console.error('Erreur lors du chargement du client:', error);
        Utils.showToast('Erreur: ' + (error.message || 'Client introuvable'), 'error');
        setTimeout(() => {
            window.location.href = 'écran_clients_(liste).html';
        }, 2000);
    }
}

/**
 * Remplit le formulaire avec les données du client
 */
function populateForm(client) {
    const form = document.querySelector('form');
    if (!form) return;

    // Mapper les champs du formulaire
    const fieldMappings = {
        'nom': client.nom,
        'name': client.nom,
        'email': client.email,
        'telephone': client.telephone,
        'phone': client.telephone,
        'adresse': client.adresse,
        'address': client.adresse,
        'actif': client.actif,
        'active': client.actif
    };

    // Remplir les champs de texte
    Object.keys(fieldMappings).forEach(fieldName => {
        const input = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = fieldMappings[fieldName];
            } else {
                input.value = fieldMappings[fieldName] || '';
            }
        }
    });

    // Essayer de remplir par placeholder si les noms ne correspondent pas
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        const placeholder = (input.placeholder || '').toLowerCase();
        if (placeholder.includes('nom') && !input.value) {
            input.value = client.nom || '';
        } else if (placeholder.includes('email') && !input.value) {
            input.value = client.email || '';
        } else if ((placeholder.includes('téléphone') || placeholder.includes('telephone')) && !input.value) {
            input.value = client.telephone || '';
        } else if (placeholder.includes('adresse') && !input.value) {
            input.value = client.adresse || '';
        }
    });
}

/**
 * Configure le formulaire
 */
function setupForm() {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);

    // Validation en temps réel
    const emailInput = form.querySelector('[type="email"], [name="email"]');
    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
    }

    const phoneInput = form.querySelector('[name="telephone"], [name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
}

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Bouton annuler
    const cancelBtn = document.querySelector('button[type="button"]:not([type="submit"])');
    if (cancelBtn && (cancelBtn.textContent.includes('Annuler') || cancelBtn.textContent.includes('Cancel'))) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'écran_clients_(liste).html';
        });
    }

    // Trouver tous les boutons et ajouter les événements appropriés
    document.querySelectorAll('button').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('annuler') || text.includes('retour')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'écran_clients_(liste).html';
            });
        }
    });
}

/**
 * Gère la soumission du formulaire
 */
async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Valider le formulaire
    if (!validateForm(form)) {
        return;
    }

    // Récupérer les données du formulaire
    const formData = new FormData(form);
    const clientData = {
        nom: getFormValue(form, ['nom', 'name'], 'nom'),
        email: getFormValue(form, ['email'], 'email'),
        telephone: getFormValue(form, ['telephone', 'phone'], 'téléphone'),
        adresse: getFormValue(form, ['adresse', 'address'], 'adresse'),
        actif: getCheckboxValue(form, ['actif', 'active'])
    };

    // Désactiver le bouton pendant la soumission
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<svg class="animate-spin h-5 w-5 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Enregistrement...';
    }

    try {
        if (isEditMode) {
            await API.Clients.update(clientId, clientData);
            Utils.showToast('Client modifié avec succès', 'success');
        } else {
            await API.Clients.create(clientData);
            Utils.showToast('Client créé avec succès', 'success');
        }

        // Rediriger vers la liste après un délai
        setTimeout(() => {
            window.location.href = 'écran_clients_(liste).html';
        }, 1500);

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        Utils.showToast('Erreur lors de l\'enregistrement du client', 'error');
        
        // Réactiver le bouton
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = isEditMode ? 'Modifier' : 'Créer';
        }
    }
}

/**
 * Récupère la valeur d'un champ par différents noms possibles
 */
function getFormValue(form, names, placeholderHint) {
    // Chercher par nom
    for (const name of names) {
        const input = form.querySelector(`[name="${name}"], #${name}`);
        if (input && input.value) {
            return input.value.trim();
        }
    }

    // Chercher par placeholder
    if (placeholderHint) {
        const inputs = form.querySelectorAll('input, textarea');
        for (const input of inputs) {
            if (input.placeholder && input.placeholder.toLowerCase().includes(placeholderHint.toLowerCase())) {
                return input.value.trim();
            }
        }
    }

    return '';
}

/**
 * Récupère la valeur d'une checkbox
 */
function getCheckboxValue(form, names) {
    for (const name of names) {
        const checkbox = form.querySelector(`[name="${name}"][type="checkbox"], #${name}[type="checkbox"]`);
        if (checkbox) {
            return checkbox.checked;
        }
    }
    return true; // Par défaut actif
}

/**
 * Valide le formulaire
 */
function validateForm(form) {
    let isValid = true;
    const errors = [];

    // Vérifier le nom
    const nom = getFormValue(form, ['nom', 'name'], 'nom');
    if (!nom) {
        errors.push('Le nom est obligatoire');
        isValid = false;
    }

    // Vérifier l'email
    const email = getFormValue(form, ['email'], 'email');
    if (!email) {
        errors.push('L\'email est obligatoire');
        isValid = false;
    } else if (!isValidEmail(email)) {
        errors.push('L\'email n\'est pas valide');
        isValid = false;
    }

    if (errors.length > 0) {
        Utils.showToast(errors[0], 'error');
    }

    return isValid;
}

/**
 * Valide un email
 */
function validateEmail(e) {
    const input = e.target;
    const email = input.value.trim();
    
    if (email && !isValidEmail(email)) {
        input.classList.add('border-red-500');
        showFieldError(input, 'Email non valide');
    } else {
        input.classList.remove('border-red-500');
        hideFieldError(input);
    }
}

/**
 * Vérifie si un email est valide
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Formate le numéro de téléphone
 */
function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    // Format français: XX XX XX XX XX
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 2 === 0) {
            formatted += ' ';
        }
        formatted += value[i];
    }
    
    e.target.value = formatted;
}

/**
 * Affiche une erreur sur un champ
 */
function showFieldError(input, message) {
    // Supprimer l'erreur existante
    hideFieldError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    
    input.parentElement.appendChild(errorDiv);
}

/**
 * Masque l'erreur sur un champ
 */
function hideFieldError(input) {
    const error = input.parentElement.querySelector('.field-error');
    if (error) {
        error.remove();
    }
}

// Export pour utilisation globale
window.ClientForm = {
    loadClient,
    handleSubmit,
    validateForm
};
