-- Données initiales pour la base de données

-- Insertion des clients
INSERT INTO clients (nom, email, telephone, adresse, date_creation, actif) VALUES
('Dupont SARL', 'contact@dupont-sarl.fr', '01 23 45 67 89', '15 Rue de la Paix, 75002 Paris', NOW(), true),
('Martin & Fils', 'info@martin-fils.com', '04 56 78 90 12', '28 Avenue des Champs, 69001 Lyon', NOW(), true),
('Tech Solutions', 'contact@techsolutions.fr', '03 21 54 87 96', '5 Boulevard Innovation, 31000 Toulouse', NOW(), true),
('Garage Central', 'garage.central@email.com', '05 61 23 45 67', '120 Route Nationale, 33000 Bordeaux', NOW(), true),
('Restaurant Le Gourmet', 'reservation@legourmet.fr', '01 98 76 54 32', '8 Place du Marché, 75004 Paris', NOW(), true);

-- Insertion des produits
INSERT INTO produits (nom, description, prix_unitaire_ht, stock, categorie, actif) VALUES
('Ordinateur portable HP', 'HP ProBook 450 G8 - Intel Core i5 - 8Go RAM - 256Go SSD', 699.00, 15, 'Informatique', true),
('Écran 27 pouces Dell', 'Dell UltraSharp U2722D - QHD - USB-C', 449.00, 20, 'Informatique', true),
('Clavier sans fil Logitech', 'Logitech MX Keys - Rétroéclairé', 109.00, 50, 'Accessoires', true),
('Souris ergonomique', 'Logitech MX Master 3', 99.00, 45, 'Accessoires', true),
('Imprimante laser HP', 'HP LaserJet Pro M404dn', 289.00, 10, 'Bureautique', true),
('Câble HDMI 2m', 'Câble HDMI 2.0 haute vitesse', 12.00, 100, 'Accessoires', true),
('Hub USB-C', 'Hub 7 ports USB-C avec alimentation', 45.00, 30, 'Accessoires', true),
('Webcam HD Logitech', 'Logitech C920 HD Pro', 79.00, 25, 'Visioconférence', true),
('Casque audio sans fil', 'Jabra Evolve2 75', 299.00, 12, 'Audio', true),
('Station d accueil', 'Station d accueil USB-C universelle', 199.00, 8, 'Accessoires', true);
