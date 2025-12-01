-- Données initiales pour la base de données (Maroc)

-- Insertion des clients marocains
INSERT INTO clients (nom, email, telephone, adresse, date_creation, actif) VALUES
('Société Hassan & Frères', 'contact@hassanfreres.ma', '+212 522 34 56 78', '25 Boulevard Mohammed V, Casablanca 20000', '2024-01-15', true),
('SARL El Amrani Tech', 'info@elamranitech.ma', '+212 537 12 34 56', '18 Avenue Hassan II, Rabat 10000', '2024-02-01', true),
('Entreprise Benali Construction', 'benali@construction.ma', '+212 524 98 76 54', '45 Rue Ibn Battouta, Marrakech 40000', '2024-02-20', true),
('Garage Central Fès', 'garagecentral@email.ma', '+212 535 67 89 01', '120 Route de Meknès, Fès 30000', '2024-03-05', true),
('Restaurant Dar Tajine', 'reservation@dartajine.ma', '+212 528 45 67 89', '8 Place Jemaa el-Fna, Marrakech 40000', '2024-03-15', true),
('Cabinet Juridique Idrissi', 'cabinet@idrissi-avocats.ma', '+212 539 23 45 67', '55 Avenue Mohammed VI, Tanger 90000', '2024-04-01', true),
('Pharmacie El Moutawakil', 'pharmacie@elmoutawakil.ma', '+212 523 78 90 12', '12 Rue Moulay Youssef, Agadir 80000', '2024-04-10', true),
('Atelier Menuiserie Berrada', 'atelier@berrada.ma', '+212 536 11 22 33', '30 Zone Industrielle, Oujda 60000', '2024-04-25', true);

-- Insertion des produits
INSERT INTO produits (nom, description, prix_unitaire_ht, stock, categorie, actif) VALUES
('Ordinateur portable HP', 'HP ProBook 450 G8 - Intel Core i5 - 8Go RAM - 256Go SSD', 6990.00, 15, 'Informatique', true),
('Écran 27 pouces Dell', 'Dell UltraSharp U2722D - QHD - USB-C', 4490.00, 20, 'Informatique', true),
('Clavier sans fil Logitech', 'Logitech MX Keys - Rétroéclairé', 1090.00, 50, 'Accessoires', true),
('Souris ergonomique', 'Logitech MX Master 3', 990.00, 45, 'Accessoires', true),
('Imprimante laser HP', 'HP LaserJet Pro M404dn', 2890.00, 10, 'Bureautique', true),
('Câble HDMI 2m', 'Câble HDMI 2.0 haute vitesse', 120.00, 100, 'Accessoires', true),
('Hub USB-C', 'Hub 7 ports USB-C avec alimentation', 450.00, 30, 'Accessoires', true),
('Webcam HD Logitech', 'Logitech C920 HD Pro', 790.00, 25, 'Visioconférence', true),
('Casque audio sans fil', 'Jabra Evolve2 75', 2990.00, 12, 'Audio', true),
('Station d accueil', 'Station d accueil USB-C universelle', 1990.00, 8, 'Accessoires', true),
('Licence Microsoft 365', 'Abonnement annuel Microsoft 365 Business', 1200.00, 999, 'Licence', true),
('Service maintenance', 'Contrat de maintenance informatique mensuel', 500.00, 999, 'Service', true);

-- Insertion des devis pour Client 1 (Hassan & Frères)
INSERT INTO devis (numero, client_id, date_creation, date_validite, montant_ht, taux_tva, montant_ttc, statut, notes) VALUES
('DEV-2024-001', 1, '2024-01-20', '2024-02-20', 8080.00, 20.00, 9696.00, 'VALIDE', 'Devis pour équipement informatique'),
('DEV-2024-002', 1, '2024-03-15', '2024-04-15', 3980.00, 20.00, 4776.00, 'ENVOYE', 'Devis pour accessoires bureautique');

-- Insertion des devis pour Client 2 (El Amrani Tech)
INSERT INTO devis (numero, client_id, date_creation, date_validite, montant_ht, taux_tva, montant_ttc, statut, notes) VALUES
('DEV-2024-003', 2, '2024-02-10', '2024-03-10', 14970.00, 20.00, 17964.00, 'VALIDE', 'Équipement complet poste de travail'),
('DEV-2024-004', 2, '2024-04-01', '2024-05-01', 7200.00, 20.00, 8640.00, 'EN_COURS', 'Licences et services');

-- Insertion des devis pour Client 3 (Benali Construction)
INSERT INTO devis (numero, client_id, date_creation, date_validite, montant_ht, taux_tva, montant_ttc, statut, notes) VALUES
('DEV-2024-005', 3, '2024-02-25', '2024-03-25', 11370.00, 20.00, 13644.00, 'VALIDE', 'Matériel informatique chantier'),
('DEV-2024-006', 3, '2024-04-20', '2024-05-20', 5780.00, 20.00, 6936.00, 'REFUSE', 'Devis équipement supplémentaire');

-- Insertion des devis pour Client 4 (Garage Central Fès)
INSERT INTO devis (numero, client_id, date_creation, date_validite, montant_ht, taux_tva, montant_ttc, statut, notes) VALUES
('DEV-2024-007', 4, '2024-03-10', '2024-04-10', 4580.00, 20.00, 5496.00, 'VALIDE', 'Poste de gestion garage');

-- Insertion des devis pour Client 5 (Dar Tajine)
INSERT INTO devis (numero, client_id, date_creation, date_validite, montant_ht, taux_tva, montant_ttc, statut, notes) VALUES
('DEV-2024-008', 5, '2024-03-20', '2024-04-20', 2090.00, 20.00, 2508.00, 'ENVOYE', 'Système de caisse');

-- Lignes de devis pour DEV-2024-001
INSERT INTO lignes_devis (devis_id, produit_id, description, quantite, prix_unitaire_ht, montant_ht) VALUES
(1, 1, 'Ordinateur portable HP ProBook', 1, 6990.00, 6990.00),
(1, 4, 'Souris ergonomique Logitech', 1, 990.00, 990.00),
(1, 6, 'Câble HDMI 2m', 1, 100.00, 100.00);

-- Lignes de devis pour DEV-2024-002
INSERT INTO lignes_devis (devis_id, produit_id, description, quantite, prix_unitaire_ht, montant_ht) VALUES
(2, 3, 'Clavier sans fil Logitech', 2, 1090.00, 2180.00),
(2, 7, 'Hub USB-C', 4, 450.00, 1800.00);

-- Lignes de devis pour DEV-2024-003
INSERT INTO lignes_devis (devis_id, produit_id, description, quantite, prix_unitaire_ht, montant_ht) VALUES
(3, 1, 'Ordinateur portable HP', 2, 6990.00, 13980.00),
(3, 4, 'Souris ergonomique', 2, 990.00, 1980.00);

-- Lignes de devis pour DEV-2024-005
INSERT INTO lignes_devis (devis_id, produit_id, description, quantite, prix_unitaire_ht, montant_ht) VALUES
(5, 1, 'Ordinateur portable HP', 1, 6990.00, 6990.00),
(5, 2, 'Écran 27 pouces Dell', 1, 4490.00, 4490.00);

-- Lignes de devis pour DEV-2024-007
INSERT INTO lignes_devis (devis_id, produit_id, description, quantite, prix_unitaire_ht, montant_ht) VALUES
(7, 1, 'Ordinateur portable HP', 1, 6990.00, 6990.00);

-- Insertion des factures pour Client 1 (Hassan & Frères)
INSERT INTO factures (numero, client_id, devis_id, date_emission, date_echeance, montant_ht, taux_tva, montant_ttc, statut_paiement, notes) VALUES
('FAC-2024-001', 1, 1, '2024-02-25', '2024-03-25', 8080.00, 20.00, 9696.00, 'PAYEE', 'Facture équipement informatique'),
('FAC-2024-002', 1, NULL, '2024-04-10', '2024-05-10', 6000.00, 20.00, 7200.00, 'EN_ATTENTE', 'Facture services maintenance');

-- Insertion des factures pour Client 2 (El Amrani Tech)
INSERT INTO factures (numero, client_id, devis_id, date_emission, date_echeance, montant_ht, taux_tva, montant_ttc, statut_paiement, notes) VALUES
('FAC-2024-003', 2, 3, '2024-03-15', '2024-04-15', 14970.00, 20.00, 17964.00, 'PAYEE', 'Facture postes de travail'),
('FAC-2024-004', 2, NULL, '2024-04-20', '2024-05-20', 2400.00, 20.00, 2880.00, 'EN_RETARD', 'Facture licences logiciels');

-- Insertion des factures pour Client 3 (Benali Construction)
INSERT INTO factures (numero, client_id, devis_id, date_emission, date_echeance, montant_ht, taux_tva, montant_ttc, statut_paiement, notes) VALUES
('FAC-2024-005', 3, 5, '2024-03-30', '2024-04-30', 11370.00, 20.00, 13644.00, 'PAYEE', 'Facture matériel chantier'),
('FAC-2024-006', 3, NULL, '2024-05-01', '2024-06-01', 3500.00, 20.00, 4200.00, 'EN_ATTENTE', 'Facture consommables');

-- Insertion des factures pour Client 4 (Garage Central Fès)
INSERT INTO factures (numero, client_id, devis_id, date_emission, date_echeance, montant_ht, taux_tva, montant_ttc, statut_paiement, notes) VALUES
('FAC-2024-007', 4, 7, '2024-04-15', '2024-05-15', 4580.00, 20.00, 5496.00, 'EN_ATTENTE', 'Facture poste de gestion');

-- Insertion des factures pour Client 6 (Cabinet Idrissi) - sans devis associé
INSERT INTO factures (numero, client_id, devis_id, date_emission, date_echeance, montant_ht, taux_tva, montant_ttc, statut_paiement, notes) VALUES
('FAC-2024-008', 6, NULL, '2024-04-25', '2024-05-25', 1990.00, 20.00, 2388.00, 'PAYEE', 'Facture station d accueil');

-- Lignes de factures pour FAC-2024-001
INSERT INTO lignes_facture (facture_id, produit_id, description, quantite, prix_unitaire_ht, montant_ht) VALUES
(1, 1, 'Ordinateur portable HP ProBook', 1, 6990.00, 6990.00),
(1, 4, 'Souris ergonomique Logitech', 1, 990.00, 990.00),
(1, 6, 'Câble HDMI 2m', 1, 100.00, 100.00);

-- Lignes de factures pour FAC-2024-002
INSERT INTO lignes_facture (facture_id, produit_id, description, quantite, prix_unitaire_ht, montant_ht) VALUES
(2, 12, 'Service maintenance', 12, 500.00, 6000.00);

-- Lignes de factures pour FAC-2024-003
INSERT INTO lignes_facture (facture_id, produit_id, description, quantite, prix_unitaire_ht, montant_ht) VALUES
(3, 1, 'Ordinateur portable HP', 2, 6990.00, 13980.00),
(3, 4, 'Souris ergonomique', 2, 495.00, 990.00);

-- Lignes de factures pour FAC-2024-005
INSERT INTO lignes_facture (facture_id, produit_id, description, quantite, prix_unitaire_ht, montant_ht) VALUES
(5, 1, 'Ordinateur portable HP', 1, 6990.00, 6990.00),
(5, 2, 'Écran 27 pouces Dell', 1, 4490.00, 4490.00);

-- Lignes de factures pour FAC-2024-007
INSERT INTO lignes_facture (facture_id, produit_id, description, quantite, prix_unitaire_ht, montant_ht) VALUES
(7, 1, 'Ordinateur portable HP', 1, 6990.00, 6990.00);

-- Lignes de factures pour FAC-2024-008
INSERT INTO lignes_facture (facture_id, produit_id, description, quantite, prix_unitaire_ht, montant_ht) VALUES
(8, 10, 'Station d accueil USB-C', 1, 1990.00, 1990.00);
