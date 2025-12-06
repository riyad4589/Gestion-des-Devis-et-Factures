/**
 * Produit Form - Formulaire de création/modification de produit
 * Gère le formulaire de la page modification_produit.html
 */

let produitId = null;
let isEditMode = false;

// Catégories prédéfinies
const CATEGORIES = [
    'Service',
    'Produit',
    'Consulting',
    'Formation',
    'Maintenance',
    'Licence',
    'Abonnement',
    'Autre'
];

document.addEventListener('DOMContentLoaded', () => {
    // Récupérer l'ID du produit depuis l'URL si présent
    const urlParams = new URLSearchParams(window.location.search);
    produitId = urlParams.get('id');
    isEditMode = !!produitId;

    console.log('Mode édition:', isEditMode, 'ID produit:', produitId);

    updatePageTitle();
    setupCategorySelect();
    setupForm();
    setupEventListeners();
    
    if (isEditMode) {
        // Attendre que les scripts externes (api.js) soient chargés
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadProduit);
        } else {
            loadProduit();
        }
    }
});

/**
 * Met à jour le titre de la page selon le mode
 */
function updatePageTitle() {
    const title = document.getElementById('page-title') || document.querySelector('h1, .page-title');
    if (title) {
        title.textContent = isEditMode ? 'Modifier le produit' : 'Nouveau produit';
    }

    // Mettre à jour le fil d'Ariane si présent
    const breadcrumb = document.getElementById('breadcrumb-action') || document.querySelector('.breadcrumb-current, nav span:last-child');
    if (breadcrumb) {
        breadcrumb.textContent = isEditMode ? 'Modifier le produit' : 'Nouveau produit';
    }
}

/**
 * Configure le sélecteur de catégorie
 */
function setupCategorySelect() {
    const select = document.querySelector('select[name="categorie"], #categorie, select');
    if (select && select.options.length <= 1) {
        // Ajouter les options de catégorie
        CATEGORIES.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
    }
}

/**
 * Charge les données du produit pour modification
 */
async function loadProduit() {
    if (!produitId) {
        console.log('Aucun ID de produit fourni - mode création');
        return;
    }

    console.log('Chargement du produit avec ID:', produitId);

    try {
        // Attendre que l'API soit disponible
        if (!window.API || !window.API.Produits) {
            console.error('L\'API Produits n\'est pas disponible');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!window.API || !window.API.Produits) {
                throw new Error('API Produits indisponible');
            }
        }

        console.log('Récupération du produit depuis l\'API...');
        const produit = await window.API.Produits.getById(produitId);
        
        console.log('Produit reçu:', produit);
        
        if (!produit) {
            throw new Error('Produit non trouvé');
        }

        populateForm(produit);
        updatePageTitle();
        console.log('Formulaire chargé avec succès');
    } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
        Utils.showToast('Erreur: ' + (error.message || 'Produit introuvable'), 'error');
        setTimeout(() => {
            window.location.href = 'écran_produits_(liste).html';
        }, 2000);
    }
}

/**
 * Remplit le formulaire avec les données du produit
 */
function populateForm(produit) {
    const form = document.querySelector('form');
    if (!form) return;

    // Stocker l'ID du produit dans le champ caché
    const produitIdInput = document.getElementById('produit-id');
    if (produitIdInput) {
        produitIdInput.value = produit.id;
    }

    // Remplir directement par ID (plus fiable)
    const fields = {
        'nom': produit.nom,
        'description': produit.description,
        'categorie': produit.categorie,
        'prixUnitaireHT': produit.prixUnitaireHT ? parseFloat(produit.prixUnitaireHT).toFixed(2) : '',
        'stock': produit.stock || 0,
        'actif': produit.actif
    };

    // Remplir les champs par ID
    Object.entries(fields).forEach(([fieldId, value]) => {
        const input = document.getElementById(fieldId);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = value === true || value === 'true';
            } else {
                input.value = value || '';
            }
            // Déclencher les événements pour la validation
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new Event('change'));
        }
    });

    console.log('Formulaire pré-rempli avec les données du produit:', produit);
}

/**
 * Configure le formulaire
 */
function setupForm() {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);

    // Validation du prix en temps réel
    const priceInput = form.querySelector('[name="prixUnitaireHT"], [name="prix"], [name="price"]');
    if (priceInput) {
        priceInput.addEventListener('input', (e) => {
            // Permettre uniquement les chiffres et le point décimal
            e.target.value = e.target.value.replace(/[^0-9.]/g, '');
        });
    }

    // Validation du stock en temps réel
    const stockInput = form.querySelector('[name="stock"]');
    if (stockInput) {
        stockInput.addEventListener('input', (e) => {
            // Permettre uniquement les chiffres
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }
}

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Bouton annuler
    document.querySelectorAll('button').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('annuler') || text.includes('retour')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'écran_produits_(liste).html';
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
    const produitData = {
        nom: getFormValue(form, ['nom', 'name'], 'nom'),
        description: getFormValue(form, ['description'], 'description'),
        prixUnitaireHT: parseFloat(getFormValue(form, ['prixUnitaireHT', 'prix', 'price'], 'prix')) || 0,
        stock: parseInt(getFormValue(form, ['stock'], 'stock')) || 0,
        categorie: getFormValue(form, ['categorie', 'category'], 'catégorie'),
        actif: getCheckboxValue(form, ['actif', 'active'])
    };

    // Désactiver le bouton pendant la soumission
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<svg class="animate-spin h-5 w-5 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Enregistrement...';
    }

    try {
        if (isEditMode) {
            await API.Produits.update(produitId, produitData);
            Utils.showToast('Produit modifié avec succès', 'success');
        } else {
            await API.Produits.create(produitData);
            Utils.showToast('Produit créé avec succès', 'success');
        }

        // Rediriger vers la liste après un délai
        setTimeout(() => {
            window.location.href = 'écran_produits_(liste).html';
        }, 1500);

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        Utils.showToast('Erreur lors de l\'enregistrement du produit', 'error');
        
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

    // Chercher par placeholder ou label
    if (placeholderHint) {
        const inputs = form.querySelectorAll('input, textarea, select');
        for (const input of inputs) {
            const placeholder = (input.placeholder || '').toLowerCase();
            const label = input.previousElementSibling?.textContent?.toLowerCase() || '';
            
            if (placeholder.includes(placeholderHint.toLowerCase()) || label.includes(placeholderHint.toLowerCase())) {
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

    // Vérifier le prix
    const prix = getFormValue(form, ['prixUnitaireHT', 'prix', 'price'], 'prix');
    if (!prix) {
        errors.push('Le prix est obligatoire');
        isValid = false;
    } else if (isNaN(parseFloat(prix)) || parseFloat(prix) < 0) {
        errors.push('Le prix doit être un nombre positif');
        isValid = false;
    }

    if (errors.length > 0) {
        Utils.showToast(errors[0], 'error');
    }

    return isValid;
}

// Export pour utilisation globale
window.ProduitForm = {
    loadProduit,
    handleSubmit,
    validateForm
};
