-- ========================================
-- DONNÉES DE TEST - Gestion Devis Factures
-- ========================================
-- Exécuter ce script pour peupler la base avec des données variées

-- =====================================================
-- 1. INSERTION DES UTILISATEURS (Users)
-- =====================================================

INSERT INTO users (email, password, nom, prenom, role, actif, date_creation, derniere_connexion)
VALUES 
    ('admin@gmail.com', 'admin1234', 'ADMIN', 'Super', 'ADMIN', true, NOW(), NOW()),
    ('john.doe@example.com', 'password123', 'Doe', 'John', 'USER', true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'),
    ('marie.dupont@example.com', 'pass456', 'Dupont', 'Marie', 'USER', true, NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day'),
    ('user.inactif@example.com', 'pass789', 'Inactive', 'User', 'USER', false, NOW() - INTERVAL '30 days', NULL);

-- =====================================================
-- 2. INSERTION DE L'ENTREPRISE (Entreprise)
-- =====================================================

INSERT INTO entreprise (nom, adresse, code_postal, ville, telephone, email, siret, logo)
VALUES 
    ('Tech Solutions SARL', '123 Avenue de la République', '75001', 'Paris', '01.23.45.67.89', 'contact@techsolutions.fr', '12345678901234', 'logo_tech.png');

-- =====================================================
-- 3. INSERTION DES CLIENTS (Clients)
-- =====================================================

INSERT INTO clients (nom, email, telephone, adresse, date_creation, actif)
VALUES 
    ('Client 1 - Entreprise A', 'entreprise.a@example.com', '01.11.22.33.44', '10 Rue de la Paix, 75000 Paris', NOW(), true),
    ('Client 2 - SARL Martin', 'martin@example.com', '01.22.33.44.55', '50 Boulevard Saint-Germain, 75006 Paris', NOW() - INTERVAL '10 days', true),
    ('Client 3 - Tech Solutions', 'tech@example.com', '02.33.44.55.66', '100 Rue de Rivoli, 75004 Paris', NOW() - INTERVAL '20 days', true),
    ('Client 4 - Garage Central', 'garage.central@example.com', '03.44.55.66.77', '200 Avenue des Champs, 75008 Paris', NOW() - INTERVAL '30 days', true),
    ('Client 5 - Restaurant Le Gourmet', 'restaurant@example.com', '04.55.66.77.88', '300 Rue de Rivoli, 75001 Paris', NOW() - INTERVAL '40 days', true),
    ('Client 6 - Pharmacie Générale', 'pharmacie@example.com', '05.66.77.88.99', '400 Boulevard Haussman, 75009 Paris', NOW() - INTERVAL '50 days', true),
    ('Client 7 - Salon de Beauté', 'salon@example.com', '06.77.88.99.00', '500 Rue de la Reine, 75002 Paris', NOW() - INTERVAL '60 days', false); -- Client inactif

-- =====================================================
-- 4. INSERTION DES PRODUITS (Produits)
-- =====================================================

INSERT INTO produits (nom, description, prix_unitaire_ht, stock, categorie, actif)
VALUES 
    -- Catégorie: Informatique
    ('Ordinateur portable HP 15"', 'Portable performant pour professionnel', 699.00, 10, 'Informatique', true),
    ('Écran 27 pouces LED', 'Écran haute résolution pour bureaux', 449.00, 15, 'Informatique', true),
    ('Clavier sans fil AZERTY', 'Clavier ergonomique sans fil', 109.00, 30, 'Informatique', true),
    ('Souris ergonomique', 'Souris optique avec poignée ergonomique', 99.00, 25, 'Informatique', true),
    
    -- Catégorie: Accessoires
    ('Câble HDMI 2m', 'Câble HDMI haute qualité', 24.99, 100, 'Accessoires', true),
    ('Adaptateur USB-C', 'Adaptateur multiport USB-C', 49.99, 50, 'Accessoires', true),
    ('Batterie externe 20000mAh', 'Batterie de secours rapide', 79.99, 20, 'Accessoires', true),
    
    -- Catégorie: Fournitures
    ('Bloc de 500 feuilles A4', 'Papier A4 80g blanc', 5.99, 200, 'Fournitures', true),
    ('Stylos lot de 12', 'Stylos bille bleu, noir, rouge', 8.99, 100, 'Fournitures', true),
    ('Classeur 4 anneaux', 'Classeur A4 standard', 12.99, 75, 'Fournitures', true),
    
    -- Catégorie: Logiciels
    ('Licence Microsoft Office 365', 'Suite bureautique complète 1 an', 149.99, 40, 'Logiciels', true),
    ('Antivirus Norton 360', 'Protection antivirus premium', 99.99, 30, 'Logiciels', true),
    
    -- Produit inactif
    ('Ancien produit obsolète', 'Produit retiré de la vente', 199.00, 0, 'Obsolète', false);

-- =====================================================
-- 5. INSERTION DES DEVIS (Devis)
-- =====================================================

INSERT INTO devis (numero_devis, client_id, date_devis, total_ht, total_tva, total_ttc, statut, commentaire)
VALUES 
    -- Devis actifs
    ('DEV-2025-001', 1, NOW() - INTERVAL '15 days', 1356.00, 271.20, 1627.20, 'VALIDE', 'Équipement informatique pour nouveau bureau'),
    ('DEV-2025-002', 2, NOW() - INTERVAL '10 days', 496.00, 99.20, 595.20, 'EN_COURS', 'Accessoires pour salle de réunion'),
    ('DEV-2025-003', 3, NOW() - INTERVAL '5 days', 2543.00, 508.60, 3051.60, 'VALIDE', 'Pack complet pour développeur senior'),
    ('DEV-2025-004', 4, NOW() - INTERVAL '3 days', 947.00, 189.40, 1136.40, 'EN_COURS', 'Poste informatique pour gestion atelier'),
    ('DEV-2025-005', 5, NOW() - INTERVAL '1 day', 1137.00, 227.40, 1364.40, 'VALIDE', 'Matériel pour point de vente'),
    
    -- Devis transformés en facture
    ('DEV-2025-006', 1, NOW() - INTERVAL '30 days', 599.00, 119.80, 718.80, 'TRANSFORME_EN_FACTURE', 'Mise à niveau système'),
    ('DEV-2025-007', 6, NOW() - INTERVAL '25 days', 250.00, 50.00, 300.00, 'TRANSFORME_EN_FACTURE', 'Fournitures administratives'),
    
    -- Devis annulés
    ('DEV-2025-008', 7, NOW() - INTERVAL '20 days', 1500.00, 300.00, 1800.00, 'ANNULE', 'Annulé par le client');

-- =====================================================
-- 6. INSERTION DES LIGNES DE DEVIS (DevisDetails)
-- =====================================================

-- Lignes pour DEV-2025-001
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (1, 1, 1, 699.00, 20.00, 699.00, 838.80),
    (1, 2, 1, 449.00, 20.00, 449.00, 538.80),
    (1, 3, 1, 109.00, 20.00, 109.00, 130.80),
    (1, 4, 1, 99.00, 20.00, 99.00, 118.80);

-- Lignes pour DEV-2025-002
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (2, 5, 5, 24.99, 20.00, 124.95, 149.94),
    (2, 6, 3, 49.99, 20.00, 149.97, 179.96),
    (2, 7, 2, 79.99, 20.00, 159.98, 191.98),
    (2, 9, 1, 8.99, 20.00, 8.99, 10.79);

-- Lignes pour DEV-2025-003
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (3, 1, 2, 699.00, 20.00, 1398.00, 1677.60),
    (3, 11, 1, 149.99, 20.00, 149.99, 179.99),
    (3, 12, 1, 99.99, 20.00, 99.99, 119.99);

-- Lignes pour DEV-2025-004
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (4, 1, 1, 699.00, 20.00, 699.00, 838.80),
    (4, 10, 2, 12.99, 20.00, 25.98, 31.18),
    (4, 8, 5, 5.99, 20.00, 29.95, 35.94),
    (4, 9, 2, 8.99, 20.00, 17.98, 21.58),
    (4, 6, 1, 49.99, 20.00, 49.99, 59.99),
    (4, 5, 3, 24.99, 20.00, 74.97, 89.96);

-- Lignes pour DEV-2025-005
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (5, 2, 2, 449.00, 20.00, 898.00, 1077.60),
    (5, 5, 10, 24.99, 20.00, 249.90, 299.88);

-- Lignes pour DEV-2025-006 (Transformé)
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (6, 11, 2, 149.99, 20.00, 299.98, 359.98),
    (6, 12, 1, 99.99, 20.00, 99.99, 119.99),
    (6, 7, 1, 79.99, 20.00, 79.99, 95.99);

-- Lignes pour DEV-2025-007 (Transformé)
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (7, 8, 20, 5.99, 20.00, 119.80, 143.76),
    (7, 9, 10, 8.99, 20.00, 89.90, 107.88),
    (7, 10, 5, 12.99, 20.00, 64.95, 77.94);

-- Lignes pour DEV-2025-008 (Annulé)
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (8, 1, 2, 699.00, 20.00, 1398.00, 1677.60),
    (8, 2, 1, 449.00, 20.00, 449.00, 538.80);

-- =====================================================
-- 7. INSERTION DES FACTURES (Factures)
-- =====================================================

INSERT INTO factures (numero_facture, client_id, devis_origine_id, date_facture, montant_ht, montant_tva, montant_ttc, mode_paiement, statut)
VALUES 
    -- Factures créées depuis des devis
    ('FAC-2025-001', 1, 6, NOW() - INTERVAL '28 days', 599.00, 119.80, 718.80, 'VIREMENT', 'PAYEE'),
    ('FAC-2025-002', 6, 7, NOW() - INTERVAL '23 days', 250.00, 50.00, 300.00, 'CHEQUE', 'PAYEE'),
    
    -- Factures directes (sans devis)
    ('FAC-2025-003', 2, NULL, NOW() - INTERVAL '10 days', 1200.00, 240.00, 1440.00, 'ESPECES', 'PAYEE'),
    ('FAC-2025-004', 3, NULL, NOW() - INTERVAL '7 days', 850.00, 170.00, 1020.00, 'CB', 'PARTIELLEMENT_PAYEE'),
    ('FAC-2025-005', 4, NULL, NOW() - INTERVAL '5 days', 1600.00, 320.00, 1920.00, 'PRELEVEMENT', 'NON_PAYEE'),
    ('FAC-2025-006', 5, NULL, NOW() - INTERVAL '3 days', 500.00, 100.00, 600.00, 'CHEQUE', 'NON_PAYEE'),
    
    -- Facture annulée
    ('FAC-2025-007', 1, NULL, NOW() - INTERVAL '15 days', 300.00, 60.00, 360.00, 'VIREMENT', 'ANNULEE');

-- =====================================================
-- 8. INSERTION DES LIGNES DE FACTURE (FactureDetails)
-- =====================================================

-- Lignes pour FAC-2025-001 (depuis DEV-2025-006)
INSERT INTO facture_details (facture_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (1, 11, 2, 149.99, 20.00, 299.98, 359.98),
    (1, 12, 1, 99.99, 20.00, 99.99, 119.99),
    (1, 7, 1, 79.99, 20.00, 79.99, 95.99);

-- Lignes pour FAC-2025-002 (depuis DEV-2025-007)
INSERT INTO facture_details (facture_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (2, 8, 20, 5.99, 20.00, 119.80, 143.76),
    (2, 9, 10, 8.99, 20.00, 89.90, 107.88),
    (2, 10, 5, 12.99, 20.00, 64.95, 77.94);

-- Lignes pour FAC-2025-003
INSERT INTO facture_details (facture_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (3, 1, 1, 699.00, 20.00, 699.00, 838.80),
    (3, 2, 1, 449.00, 20.00, 449.00, 538.80),
    (3, 6, 1, 49.99, 20.00, 49.99, 59.99);

-- Lignes pour FAC-2025-004
INSERT INTO facture_details (facture_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (4, 3, 5, 109.00, 20.00, 545.00, 654.00),
    (4, 4, 3, 99.00, 20.00, 297.00, 356.40),
    (4, 5, 2, 24.99, 20.00, 49.98, 59.98);

-- Lignes pour FAC-2025-005
INSERT INTO facture_details (facture_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (5, 1, 2, 699.00, 20.00, 1398.00, 1677.60),
    (5, 7, 1, 79.99, 20.00, 79.99, 95.99);

-- Lignes pour FAC-2025-006
INSERT INTO facture_details (facture_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (6, 8, 50, 5.99, 20.00, 299.50, 359.40),
    (6, 9, 20, 8.99, 20.00, 179.80, 215.76);

-- Lignes pour FAC-2025-007 (Annulée)
INSERT INTO facture_details (facture_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
    (7, 5, 10, 24.99, 20.00, 249.90, 299.88);

-- =====================================================
-- RÉSUMÉ DES DONNÉES INSÉRÉES
-- =====================================================
-- Users: 4 (1 ADMIN, 2 USER actifs, 1 USER inactif)
-- Entreprise: 1
-- Clients: 7 (6 actifs, 1 inactif)
-- Produits: 13 (12 actifs, 1 inactif)
-- Devis: 8 (2 EN_COURS, 3 VALIDE, 2 TRANSFORME_EN_FACTURE, 1 ANNULE)
-- DevisDetails: 22 lignes
-- Factures: 7 (5 payées/partiellement payées, 1 non payée, 1 annulée)
-- FactureDetails: 15 lignes
-- =====================================================
