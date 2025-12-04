<a id="top"></a>

# 📋 GestFacture - Application de Gestion des Devis et Factures

<div align="center">

![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen?style=for-the-badge&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Aiven-blue?style=for-the-badge&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript&logoColor=black)

Application web complète pour la gestion des devis, factures, clients et produits d'une entreprise.

</div>

---

## 📑 Plan

<div align="center">

[![Aperçu](https://img.shields.io/badge/📸-Aperçu-blue?style=for-the-badge)](#-aperçu)
[![Fonctionnalités](https://img.shields.io/badge/✨-Fonctionnalités-green?style=for-the-badge)](#-fonctionnalités)
[![Technologies](https://img.shields.io/badge/🛠️-Technologies-orange?style=for-the-badge)](#️-technologies)
[![Structure](https://img.shields.io/badge/📁-Structure-purple?style=for-the-badge)](#-structure-du-projet)
[![Installation](https://img.shields.io/badge/🚀-Installation-red?style=for-the-badge)](#-installation-et-démarrage)
[![API](https://img.shields.io/badge/📡-API_REST-cyan?style=for-the-badge)](#-api-rest)
[![Données](https://img.shields.io/badge/📊-Modèle_Données-yellow?style=for-the-badge)](#-modèle-de-données)
[![Config](https://img.shields.io/badge/🔧-Configuration-gray?style=for-the-badge)](#-configuration)
[![Contributeurs](https://img.shields.io/badge/👤-Contributeurs-pink?style=for-the-badge)](#-contributeurs)

</div>

---

## 📸 Aperçu

L'application GestFacture propose une interface moderne et responsive avec :
- 🎨 Design épuré avec Tailwind CSS
- 🌙 Support du mode sombre
- 📱 Interface responsive
- 🔐 Système d'authentification

---

## ✨ Fonctionnalités

### 🔐 Authentification
- Connexion sécurisée avec email et mot de passe
- Gestion des utilisateurs (ADMIN/USER)
- Session persistante via localStorage
- Déconnexion sécurisée

### 👥 Gestion des Clients
- Création, modification et suppression de clients
- Recherche et filtrage par nom, email, statut
- Activation/désactivation des clients
- Historique des devis et factures par client

### 📦 Gestion des Produits
- Catalogue de produits avec gestion du stock
- Prix unitaire HT et catégorisation
- Suivi des quantités en stock
- Activation/désactivation des produits

### 📝 Gestion des Devis
- Création de devis avec lignes de produits
- Numérotation automatique
- Calcul automatique des montants HT, TVA et TTC
- Cycle de vie : En cours → Validé → Converti en facture / Annulé
- Export PDF des devis

### 🧾 Gestion des Factures
- Création directe ou depuis un devis
- Numérotation automatique
- Gestion des modes de paiement (Espèces, Chèque, Virement, CB, Prélèvement)
- Statuts : Non payée, Partiellement payée, Payée, Annulée
- Export PDF des factures

### 📊 Tableau de Bord & Statistiques
- Vue d'ensemble des indicateurs clés
- Nombre de clients, produits, devis et factures
- Chiffre d'affaires du mois
- Graphiques interactifs (Chart.js)
- Top produits et clients

### ⚙️ Paramètres
- Modification du profil utilisateur
- Changement de mot de passe
- Configuration de l'entreprise
- Basculement mode clair/sombre

---

## 🛠️ Technologies

### Backend
| Technologie | Version | Description |
|-------------|---------|-------------|
| Java | 17 | Langage de programmation |
| Spring Boot | 3.2.0 | Framework applicatif |
| Spring Data JPA | - | Accès aux données |
| MySQL (Aiven) | Cloud | Base de données |
| iText 7 | 7.2.5 | Génération PDF |
| SpringDoc OpenAPI | 2.3.0 | Documentation API (Swagger) |
| Lombok | - | Réduction du boilerplate |

### Frontend
| Technologie | Description |
|-------------|-------------|
| HTML5 / CSS3 | Structure et styles |
| Tailwind CSS | Framework CSS utilitaire |
| JavaScript ES6+ | Logique applicative (Vanilla) |
| Chart.js | Graphiques et visualisations |
| Material Symbols | Icônes Google |

---

## 📁 Structure du Projet

```
Gestion-des-Devis-et-Factures/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/monentreprise/gestiondevisfactures/
│   │       │   ├── config/           # Configurations (CORS, OpenAPI, Encodage)
│   │       │   ├── controller/       # Contrôleurs REST
│   │       │   │   ├── AuthController.java
│   │       │   │   ├── ClientController.java
│   │       │   │   ├── DevisController.java
│   │       │   │   ├── FactureController.java
│   │       │   │   ├── ProduitController.java
│   │       │   │   ├── EntrepriseController.java
│   │       │   │   └── StatistiquesController.java
│   │       │   ├── dto/              # Data Transfer Objects
│   │       │   ├── entity/           # Entités JPA
│   │       │   │   ├── Client.java
│   │       │   │   ├── Produit.java
│   │       │   │   ├── Devis.java
│   │       │   │   ├── DevisDetail.java
│   │       │   │   ├── Facture.java
│   │       │   │   ├── FactureDetail.java
│   │       │   │   ├── Entreprise.java
│   │       │   │   └── User.java
│   │       │   ├── exception/        # Gestion des exceptions
│   │       │   ├── mapper/           # Mappers Entity <-> DTO
│   │       │   ├── repository/       # Repositories Spring Data
│   │       │   ├── service/          # Services métier
│   │       │   │   └── impl/         # Implémentations
│   │       │   └── GestionDevisFacturesApplication.java
│   │       └── resources/
│   │           ├── application.properties
│   │           └── data.sql
│   └── pom.xml
│
└── frontend/
    ├── index.html                      # Redirection vers connexion
    ├── écran_connexion.html            # Page de connexion
    ├── dashboard.html                  # Tableau de bord
    ├── écran_clients_(liste).html      # Liste des clients
    ├── modification_client.html        # Formulaire client
    ├── écran_historique_client.html    # Historique client
    ├── écran_produits_(liste).html     # Liste des produits
    ├── modification_produit.html       # Formulaire produit
    ├── écran_liste_des_devis.html      # Liste des devis
    ├── écran_création_d'un_devis.html  # Formulaire devis
    ├── écran_détail_d'un_devis.html    # Détail devis
    ├── écran_factures_(liste).html     # Liste des factures
    ├── écran_création_facture.html     # Formulaire facture
    ├── écran_détail_facture.html       # Détail facture
    ├── écran_statistiques.html         # Statistiques
    ├── écran_paramètres.html           # Paramètres
    └── assets/
        └── js/
            ├── api.js                  # Configuration API & Utilitaires
            ├── auth.js                 # Authentification
            ├── sidebar.js              # Composant sidebar dynamique
            ├── navigation.js           # Navigation
            ├── app-loader.js           # Chargement de l'application
            ├── dashboard.js            # Logique dashboard
            ├── clients.js              # Gestion clients
            ├── client-form.js          # Formulaire client
            ├── client-history.js       # Historique client
            ├── produits.js             # Gestion produits
            ├── produit-form.js         # Formulaire produit
            ├── devis.js                # Gestion devis
            ├── devis-form.js           # Formulaire devis
            ├── devis-detail.js         # Détail devis
            ├── factures.js             # Gestion factures
            ├── facture-form.js         # Formulaire facture
            ├── facture-detail.js       # Détail facture
            ├── statistiques.js         # Statistiques & graphiques
            └── parametres.js           # Paramètres utilisateur/entreprise
```

---

## 🚀 Installation et Démarrage

### Prérequis
- ☕ Java JDK 17+
- 📦 Maven 3.8+
- 🌐 Navigateur web moderne

### Démarrage du Backend

```bash
cd backend
mvn spring-boot:run
```

Le serveur démarre sur `http://localhost:8080`

> ⚠️ **Note** : La base de données MySQL est hébergée sur Aiven Cloud et déjà configurée dans `application.properties`.

### Accès à l'API Documentation

Swagger UI : `http://localhost:8080/swagger-ui.html`

### Démarrage du Frontend

**Option 1 : Avec Python**
```bash
cd frontend1
python -m http.server 5500
```

**Option 2 : Avec Node.js**
```bash
cd frontend1
npx serve -l 5500
```

**Option 3 : Extension VS Code Live Server**
- Installer l'extension "Live Server"
- Ouvrir `frontend1/écran_connexion.html`
- Clic droit → "Open with Live Server"

### 🐳 Démarrage avec Docker

L'application peut être lancée via Docker pour un déploiement simplifié.

#### Prérequis Docker
- 🐳 Docker Desktop installé et lancé
- 📦 Docker Compose

#### Fichiers Docker

**docker-compose.yml** - Configuration de l'orchestration :
```yaml
version: "3.9"

services:
  backend:
    build: ./backend
    container_name: gestfacture-backend
    ports:
      - "8080:8080"
    environment:
      DB_URL: "jdbc:mysql://..."
      DB_USERNAME: "avnadmin"
      DB_PASSWORD: "***"
```

**backend/Dockerfile** - Build multi-stage optimisé :
```dockerfile
# Étape 1 : Build Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

# Étape 2 : Runtime
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

#### Commandes Docker

| Commande | Description |
|----------|-------------|
| `docker compose up --build` | Construire et démarrer l'application |
| `docker compose up -d` | Démarrer en arrière-plan (mode détaché) |
| `docker compose down` | Arrêter et supprimer les conteneurs |
| `docker compose logs -f` | Afficher les logs en temps réel |
| `docker compose ps` | Lister les conteneurs en cours |
| `docker compose build --no-cache` | Reconstruire sans cache |

#### Démarrage rapide avec Docker

```bash
# Cloner le projet
git clone https://github.com/riyad4589/Gestion-des-Devis-et-Factures.git
cd Gestion-des-Devis-et-Factures

# Construire et lancer le backend
docker compose up --build

# Ou en mode détaché
docker compose up -d --build
```

Le backend sera accessible sur `http://localhost:8080`

#### Commandes utiles

```bash
# Voir les logs du backend
docker logs gestfacture-backend

# Suivre les logs en temps réel
docker logs -f gestfacture-backend

# Accéder au shell du conteneur
docker exec -it gestfacture-backend /bin/sh

# Redémarrer le conteneur
docker compose restart

# Arrêter proprement
docker compose down
```

### 🔑 Identifiants par défaut

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@gmail.com` | admin1234 | ADMIN |

---

## 📡 API REST

### Endpoints Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Connexion utilisateur |
| POST | `/api/auth/change-password` | Changer le mot de passe |
| GET | `/api/auth/users` | Liste des utilisateurs |
| POST | `/api/auth/users` | Créer un utilisateur |
| PUT | `/api/auth/users/{id}` | Modifier un utilisateur |
| DELETE | `/api/auth/users/{id}` | Supprimer un utilisateur |

### Endpoints Clients

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/clients` | Liste tous les clients |
| GET | `/api/clients/{id}` | Détails d'un client |
| POST | `/api/clients` | Créer un client |
| PUT | `/api/clients/{id}` | Modifier un client |
| DELETE | `/api/clients/{id}` | Supprimer un client |

### Endpoints Produits

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/produits` | Liste tous les produits |
| GET | `/api/produits/{id}` | Détails d'un produit |
| POST | `/api/produits` | Créer un produit |
| PUT | `/api/produits/{id}` | Modifier un produit |
| DELETE | `/api/produits/{id}` | Supprimer un produit |

### Endpoints Devis

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/devis` | Liste tous les devis |
| GET | `/api/devis/{id}` | Détails d'un devis |
| POST | `/api/devis` | Créer un devis |
| PUT | `/api/devis/{id}` | Modifier un devis |
| PUT | `/api/devis/{id}/valider` | Valider un devis |
| PUT | `/api/devis/{id}/annuler` | Annuler un devis |
| POST | `/api/devis/{id}/convertir-en-facture` | Convertir en facture |
| GET | `/api/devis/{id}/pdf` | Télécharger le PDF |

### Endpoints Factures

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/factures` | Liste toutes les factures |
| GET | `/api/factures/{id}` | Détails d'une facture |
| POST | `/api/factures` | Créer une facture |
| PUT | `/api/factures/{id}` | Modifier une facture |
| PUT | `/api/factures/{id}/payer` | Marquer comme payée |
| PUT | `/api/factures/{id}/annuler` | Annuler une facture |
| GET | `/api/factures/{id}/pdf` | Télécharger le PDF |

### Endpoints Statistiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/statistiques` | Statistiques globales |

### Endpoints Entreprise

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/entreprise` | Informations de l'entreprise |
| PUT | `/api/entreprise` | Modifier l'entreprise |

---

## 📊 Modèle de Données

### User (Utilisateur)

| Champ | Type | Description |
|-------|------|-------------|
| id | Long | Identifiant unique |
| email | String | Email unique (obligatoire) |
| password | String | Mot de passe |
| nom | String | Nom |
| prenom | String | Prénom |
| role | String | Rôle (ADMIN/USER) |
| actif | Boolean | Statut actif |
| dateCreation | LocalDateTime | Date de création |
| derniereConnexion | LocalDateTime | Dernière connexion |

### Client
| Champ | Type | Description |
|-------|------|-------------|
| id | Long | Identifiant unique |
| nom | String | Nom du client (obligatoire) |
| email | String | Email unique (obligatoire) |
| telephone | String | Numéro de téléphone |
| adresse | String | Adresse complète |
| actif | Boolean | Statut du client |
| dateCreation | LocalDateTime | Date de création |

### Produit
| Champ | Type | Description |
|-------|------|-------------|
| id | Long | Identifiant unique |
| nom | String | Nom du produit (obligatoire) |
| description | String | Description |
| prixUnitaireHT | BigDecimal | Prix HT (obligatoire) |
| stock | Integer | Quantité en stock |
| categorie | String | Catégorie |
| actif | Boolean | Statut du produit |

### Devis
| Champ | Type | Description |
|-------|------|-------------|
| id | Long | Identifiant unique |
| numeroDevis | String | Numéro unique (auto-généré) |
| client | Client | Client associé |
| dateDevis | LocalDateTime | Date de création |
| totalHT | BigDecimal | Total HT |
| totalTVA | BigDecimal | Total TVA |
| totalTTC | BigDecimal | Total TTC |
| statut | StatutDevis | EN_COURS, VALIDE, TRANSFORME_EN_FACTURE, ANNULE |
| commentaire | String | Commentaire |
| lignes | `List<DevisDetail>` | Lignes du devis |

### Facture
| Champ | Type | Description |
|-------|------|-------------|
| id | Long | Identifiant unique |
| numeroFacture | String | Numéro unique (auto-généré) |
| client | Client | Client associé |
| devisOrigine | Devis | Devis d'origine (optionnel) |
| dateFacture | LocalDateTime | Date de création |
| montantHT | BigDecimal | Total HT |
| montantTVA | BigDecimal | Total TVA |
| montantTTC | BigDecimal | Total TTC |
| modePaiement | ModePaiement | ESPECES, CHEQUE, VIREMENT, CB, PRELEVEMENT |
| statut | StatutFacture | NON_PAYEE, PARTIELLEMENT_PAYEE, PAYEE, ANNULEE |
| lignes | `List<FactureDetail>` | Lignes de la facture |

### Entreprise

| Champ | Type | Description |
|-------|------|-------------|
| id | Long | Identifiant unique |
| nom | String | Nom de l'entreprise |
| adresse | String | Adresse |
| codePostal | String | Code postal |
| ville | String | Ville |
| telephone | String | Téléphone |
| email | String | Email |
| siret | String | Numéro SIRET |
| logo | String | URL du logo (Base64 ou URL) |

---

## 🔧 Configuration

### Configuration CORS

L'application accepte les requêtes depuis :
- `http://localhost:5500` (Live Server)
- `http://localhost:3000`
- `http://localhost:4200`
- `http://localhost:8080`
- `http://127.0.0.1:5500`

Configuration dans `CorsConfig.java`.

### Configuration Base de Données

La base de données MySQL est hébergée sur **Aiven Cloud** et est pré-configurée dans le projet.

- **Encodage** : UTF-8 (utf8mb4_unicode_ci) pour supporter tous les caractères spéciaux
- **Collation** : utf8mb4_unicode_ci
- Configuration dans `application.properties` et `EncodingConfig.java`

---

## 👤 Contributeurs

<p align="center">
<table align="center">
<tr>
<td align="center" width="300">
<a href="https://github.com/riyad4589">
<img src="https://github.com/riyad4589.png" width="150px;" style="border-radius: 50%;" alt="Mohamed Riyad MAJGHIROU"/><br /><br />
<b style="font-size: 18px;">Mohamed Riyad MAJGHIROU</b>
</a><br /><br />
<a href="mailto:riyadmaj10@gmail.com">📧 Email</a> •
<a href="https://www.linkedin.com/in/mohamed-riyad-majghirou-5b62aa388/">💼 LinkedIn</a>
</td>
<td align="center" width="300">
<a href="https://github.com/Azzammoo10">
<img src="https://github.com/Azzammoo10.png" width="150px;" style="border-radius: 50%;" alt="Mohamed AZZAM"/><br /><br />
<b style="font-size: 18px;">Mohamed AZZAM</b>
</a><br /><br />
<a href="mailto:azzam.moo10@gmail.com">📧 Email</a> •
<a href="https://www.linkedin.com/in/mohamed-azzam-93115823a/">💼 LinkedIn</a>
</td>
</tr>
</table>
</p>

<div align="center">


[![Retour en haut](https://img.shields.io/badge/⬆️-Retour_en_haut-blue?style=for-the-badge)](#top)

</div>


