-- Script pour insérer 5 devis et 5 factures avec leurs lignes de détails
-- Import exemple MySQL (ancienne version) : mysql --user user --password=pass --host localhost --port 3306 database < insert_devis_factures.sql

-- =====================================================
-- INSERTION DES 5 DEVIS
-- =====================================================

-- Devis 1: Pour Riyad SARL (client_id=26) - Équipement informatique complet
INSERT INTO devis (numero_devis, client_id, date_devis, total_ht, total_tva, total_ttc, statut, commentaire)
VALUES ('DEV-2025-001', 26, '2025-11-15 10:00:00', 1356.00, 271.20, 1627.20, 'VALIDE', 'Équipement informatique pour nouveau bureau');

-- Devis 2: Pour Martin & Fila (client_id=27) - Accessoires bureautique
INSERT INTO devis (numero_devis, client_id, date_devis, total_ht, total_tva, total_ttc, statut, commentaire)
VALUES ('DEV-2025-002', 27, '2025-11-18 14:30:00', 496.00, 99.20, 595.20, 'EN_COURS', 'Accessoires pour salle de réunion');

-- Devis 3: Pour Tech Solutions (client_id=28) - Pack développeur
INSERT INTO devis (numero_devis, client_id, date_devis, total_ht, total_tva, total_ttc, statut, commentaire)
VALUES ('DEV-2025-003', 28, '2025-11-20 09:15:00', 2543.00, 508.60, 3051.60, 'VALIDE', 'Pack complet pour développeur senior');

-- Devis 4: Pour Garage Central (client_id=29) - Poste de gestion
INSERT INTO devis (numero_devis, client_id, date_devis, total_ht, total_tva, total_ttc, statut, commentaire)
VALUES ('DEV-2025-004', 29, '2025-11-22 11:00:00', 947.00, 189.40, 1136.40, 'EN_COURS', 'Poste informatique pour gestion atelier');

-- Devis 5: Pour Restaurant Le Gourmet (client_id=30) - Système de caisse
INSERT INTO devis (numero_devis, client_id, date_devis, total_ht, total_tva, total_ttc, statut, commentaire)
VALUES ('DEV-2025-005', 30, '2025-11-25 16:45:00', 1137.00, 227.40, 1364.40, 'VALIDE', 'Matériel pour point de vente');

-- =====================================================
-- INSERTION DES LIGNES DE DEVIS
-- =====================================================

-- Lignes pour DEV-2025-001 (devis_id sera récupéré)
SET @devis1_id = (SELECT id FROM devis WHERE numero_devis = 'DEV-2025-001');
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
(@devis1_id, 1, 1, 699.00, 20.00, 699.00, 838.80),    -- Ordinateur portable HP
(@devis1_id, 2, 1, 449.00, 20.00, 449.00, 538.80),    -- Écran 27 pouces
(@devis1_id, 3, 1, 109.00, 20.00, 109.00, 130.80),    -- Clavier sans fil
(@devis1_id, 4, 1, 99.00, 20.00, 99.00, 118.80);      -- Souris ergonomique

-- Lignes pour DEV-2025-002
SET @devis2_id = (SELECT id FROM devis WHERE numero_devis = 'DEV-2025-002');
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
(@devis2_id, 8, 2, 79.00, 20.00, 158.00, 189.60),     -- 2x Webcam HD
(@devis2_id, 9, 1, 299.00, 20.00, 299.00, 358.80),    -- Casque audio
(@devis2_id, 6, 3, 12.00, 20.00, 36.00, 43.20),       -- 3x Câble HDMI
(@devis2_id, 7, 1, 45.00, 20.00, 45.00, 54.00);       -- Hub USB-C

-- Lignes pour DEV-2025-003
SET @devis3_id = (SELECT id FROM devis WHERE numero_devis = 'DEV-2025-003');
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
(@devis3_id, 11, 2, 699.00, 20.00, 1398.00, 1677.60), -- 2x Ordinateur portable
(@devis3_id, 12, 2, 449.00, 20.00, 898.00, 1077.60),  -- 2x Écran
(@devis3_id, 13, 2, 109.00, 20.00, 218.00, 261.60),   -- 2x Clavier
(@devis3_id, 7, 1, 45.00, 20.00, 45.00, 54.00);       -- Hub USB-C

-- Lignes pour DEV-2025-004
SET @devis4_id = (SELECT id FROM devis WHERE numero_devis = 'DEV-2025-004');
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
(@devis4_id, 1, 1, 699.00, 20.00, 699.00, 838.80),    -- Ordinateur portable
(@devis4_id, 5, 1, 289.00, 20.00, 289.00, 346.80);    -- Imprimante laser

-- Lignes pour DEV-2025-005
SET @devis5_id = (SELECT id FROM devis WHERE numero_devis = 'DEV-2025-005');
INSERT INTO devis_details (devis_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
(@devis5_id, 1, 1, 699.00, 20.00, 699.00, 838.80),    -- Ordinateur portable
(@devis5_id, 5, 1, 289.00, 20.00, 289.00, 346.80),    -- Imprimante
(@devis5_id, 8, 1, 79.00, 20.00, 79.00, 94.80),       -- Webcam
(@devis5_id, 6, 2, 12.00, 20.00, 24.00, 28.80),       -- 2x Câble HDMI
(@devis5_id, 7, 1, 45.00, 20.00, 45.00, 54.00);       -- Hub USB-C

-- =====================================================
-- INSERTION DES 5 FACTURES
-- =====================================================

-- Facture 1: Pour Riyad SARL - Basée sur DEV-2025-001
SET @devis1_id = (SELECT id FROM devis WHERE numero_devis = 'DEV-2025-001');
INSERT INTO factures (numero_facture, client_id, devis_origine_id, date_facture, montant_ht, montant_tva, montant_ttc, mode_paiement, statut)
VALUES ('FAC-2025-001', 26, @devis1_id, '2025-11-20 10:00:00', 1356.00, 271.20, 1627.20, 'VIREMENT', 'PAYEE');

-- Mettre à jour le statut du devis d'origine
UPDATE devis SET statut = 'TRANSFORME_EN_FACTURE' WHERE id = @devis1_id;

-- Facture 2: Pour Martin & Fila - Sans devis d'origine
INSERT INTO factures (numero_facture, client_id, devis_origine_id, date_facture, montant_ht, montant_tva, montant_ttc, mode_paiement, statut)
VALUES ('FAC-2025-002', 27, NULL, '2025-11-22 15:00:00', 378.00, 75.60, 453.60, 'CB', 'NON_PAYEE');

-- Facture 3: Pour Tech Solutions - Basée sur DEV-2025-003
SET @devis3_id = (SELECT id FROM devis WHERE numero_devis = 'DEV-2025-003');
INSERT INTO factures (numero_facture, client_id, devis_origine_id, date_facture, montant_ht, montant_tva, montant_ttc, mode_paiement, statut)
VALUES ('FAC-2025-003', 28, @devis3_id, '2025-11-25 09:30:00', 2543.00, 508.60, 3051.60, 'VIREMENT', 'PAYEE');

-- Mettre à jour le statut du devis d'origine
UPDATE devis SET statut = 'TRANSFORME_EN_FACTURE' WHERE id = @devis3_id;

-- Facture 4: Pour Garage Central - Sans devis
INSERT INTO factures (numero_facture, client_id, devis_origine_id, date_facture, montant_ht, montant_tva, montant_ttc, mode_paiement, statut)
VALUES ('FAC-2025-004', 29, NULL, '2025-11-28 11:30:00', 587.00, 117.40, 704.40, 'CHEQUE', 'PARTIELLEMENT_PAYEE');

-- Facture 5: Pour Restaurant Le Gourmet - Basée sur DEV-2025-005
SET @devis5_id = (SELECT id FROM devis WHERE numero_devis = 'DEV-2025-005');
INSERT INTO factures (numero_facture, client_id, devis_origine_id, date_facture, montant_ht, montant_tva, montant_ttc, mode_paiement, statut)
VALUES ('FAC-2025-005', 30, @devis5_id, '2025-11-30 17:00:00', 1137.00, 227.40, 1364.40, 'ESPECES', 'NON_PAYEE');

-- Mettre à jour le statut du devis d'origine
UPDATE devis SET statut = 'TRANSFORME_EN_FACTURE' WHERE id = @devis5_id;

-- =====================================================
-- INSERTION DES LIGNES DE FACTURES
-- =====================================================

-- Lignes pour FAC-2025-001
SET @facture1_id = (SELECT id FROM factures WHERE numero_facture = 'FAC-2025-001');
INSERT INTO facture_details (facture_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
(@facture1_id, 1, 1, 699.00, 20.00, 699.00, 838.80),
(@facture1_id, 2, 1, 449.00, 20.00, 449.00, 538.80),
(@facture1_id, 3, 1, 109.00, 20.00, 109.00, 130.80),
(@facture1_id, 4, 1, 99.00, 20.00, 99.00, 118.80);

-- Lignes pour FAC-2025-002
SET @facture2_id = (SELECT id FROM factures WHERE numero_facture = 'FAC-2025-002');
INSERT INTO facture_details (facture_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
(@facture2_id, 9, 1, 299.00, 20.00, 299.00, 358.80),
(@facture2_id, 8, 1, 79.00, 20.00, 79.00, 94.80);

-- Lignes pour FAC-2025-003
SET @facture3_id = (SELECT id FROM factures WHERE numero_facture = 'FAC-2025-003');
INSERT INTO facture_details (facture_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
(@facture3_id, 11, 2, 699.00, 20.00, 1398.00, 1677.60),
(@facture3_id, 12, 2, 449.00, 20.00, 898.00, 1077.60),
(@facture3_id, 13, 2, 109.00, 20.00, 218.00, 261.60),
(@facture3_id, 7, 1, 45.00, 20.00, 45.00, 54.00);

-- Lignes pour FAC-2025-004
SET @facture4_id = (SELECT id FROM factures WHERE numero_facture = 'FAC-2025-004');
INSERT INTO facture_details (facture_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
(@facture4_id, 5, 1, 289.00, 20.00, 289.00, 346.80),
(@facture4_id, 9, 1, 299.00, 20.00, 299.00, 358.80);

-- Lignes pour FAC-2025-005
SET @facture5_id = (SELECT id FROM factures WHERE numero_facture = 'FAC-2025-005');
INSERT INTO facture_details (facture_id, produit_id, quantite, prix_unitaire_ht, tva, total_ligne_ht, total_ligne_ttc)
VALUES 
(@facture5_id, 1, 1, 699.00, 20.00, 699.00, 838.80),
(@facture5_id, 5, 1, 289.00, 20.00, 289.00, 346.80),
(@facture5_id, 8, 1, 79.00, 20.00, 79.00, 94.80),
(@facture5_id, 6, 2, 12.00, 20.00, 24.00, 28.80),
(@facture5_id, 7, 1, 45.00, 20.00, 45.00, 54.00);

-- Vérification finale
SELECT 'DEVIS CRÉÉS:' AS info;
SELECT id, numero_devis, client_id, total_ttc, statut FROM devis ORDER BY id;

SELECT 'FACTURES CRÉÉES:' AS info;
SELECT id, numero_facture, client_id, montant_ttc, statut FROM factures ORDER BY id;
