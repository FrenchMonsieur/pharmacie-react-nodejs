-- =============================================================
-- Jeu de données de test
-- Projet : E-boutique GSB (Galaxy Swiss Bourdin)
-- À lancer APRÈS creation_base_eboutique.sql
--
-- Les prix et le stock sont inventés pour les tests.
-- Taux de TVA utilisés (France) : 2,10 % pour les médicaments
-- remboursables, 10 % pour les non remboursables.
-- =============================================================

USE gsb_eboutique;


-- -------------------------------------------------------------
-- CATEGORIES
-- "Ophtalmologie" reste volontairement vide : le cahier des
-- charges dit qu'une catégorie peut exister sans produit.
-- -------------------------------------------------------------
INSERT INTO categorie (id_cat, nom, description) VALUES
(1,  'Douleur et fièvre',         'Antalgiques et antipyrétiques'),
(2,  'Anti-inflammatoires',       'Traitements de la douleur et de l''inflammation'),
(3,  'Digestion',                 'Troubles digestifs : diarrhée, brûlures d''estomac, spasmes'),
(4,  'ORL et respiratoire',       'Toux, maux de gorge, rhume, asthme'),
(5,  'Allergies',                 'Antihistaminiques'),
(6,  'Dermatologie et antiseptiques', 'Soins de la peau et désinfection'),
(7,  'Cardiologie et circulation','Cœur, cholestérol, circulation veineuse'),
(8,  'Antibiotiques',             'Traitements des infections bactériennes'),
(9,  'Diabète et hormones',       'Diabète, thyroïde'),
(10, 'Ophtalmologie',             'Soins des yeux');


-- -------------------------------------------------------------
-- UTILISATEURS
-- Mot de passe de TOUS les comptes : Gsb2026!
-- (haché avec bcrypt, compatible avec le paquet bcrypt de Node)
-- -------------------------------------------------------------
INSERT INTO utilisateur (id_uti, nom, email, mot_de_passe, role, adresse, premiere_connexion) VALUES
(1, 'Administrateur GSB',   'admin@gsb.fr',           '$2b$10$.Bj3RByYnWrT2RVM6OAUJeM2HiV0aWTq0EMT4GkX00v.uFBbnfDH.', 'admin',         '12 rue de la Paix, 75002 Paris',            0),
(2, 'Laboratoire Helios',   'contact@helios-lab.fr',  '$2b$10$.Bj3RByYnWrT2RVM6OAUJeM2HiV0aWTq0EMT4GkX00v.uFBbnfDH.', 'fournisseur',   '45 avenue Jean Jaurès, 69007 Lyon',         0),
(3, 'Pharmalis',            'contact@pharmalis.fr',   '$2b$10$.Bj3RByYnWrT2RVM6OAUJeM2HiV0aWTq0EMT4GkX00v.uFBbnfDH.', 'fournisseur',   '8 boulevard de la Liberté, 59000 Lille',    0),
(4, 'Dr Claire Martin',     'claire.martin@medecin.fr','$2b$10$.Bj3RByYnWrT2RVM6OAUJeM2HiV0aWTq0EMT4GkX00v.uFBbnfDH.', 'professionnel', '3 place du Marché, 92100 Boulogne-Billancourt', 1),
(5, 'Pharmacie du Centre',  'pharmacie.centre@pharma.fr','$2b$10$.Bj3RByYnWrT2RVM6OAUJeM2HiV0aWTq0EMT4GkX00v.uFBbnfDH.', 'professionnel', '27 rue Victor Hugo, 93100 Montreuil',     1);


-- -------------------------------------------------------------
-- MEDICAMENTS
-- id_uti = qui a proposé le produit (1 = admin, 2 et 3 = fournisseurs)
-- La plupart sont validés ; quelques-uns sont "en attente" ou
-- "refusé" pour tester la validation par l'administrateur.
-- -------------------------------------------------------------
INSERT INTO medicament
(id_med, id_cat, id_uti, reference, nom, description, image, principe_actif, dosage, forme, prix_ht, taux_tva, stock, statut_validation) VALUES

-- Douleur et fièvre
(1,  1, 1, 'MED-0001', 'Doliprane',      'Traitement des douleurs et de la fièvre chez l''adulte. Boîte de 8 comprimés.',              'doliprane-1000.jpg',  'Paracétamol', '1000 mg', 'Comprimé',                     1.70,  2.10, 500, 'validé'),
(2,  1, 1, 'MED-0002', 'Dafalgan',        'Douleurs légères à modérées et fièvre. Boîte de 16 gélules.',                                'dafalgan-500.jpg',    'Paracétamol', '500 mg',  'Gélule',                       1.60,  2.10, 350, 'validé'),
(3,  1, 2, 'MED-0003', 'Efferalgan',         'Douleurs et fièvre, forme effervescente à dissoudre dans l''eau. Boîte de 8 comprimés.',     'efferalgan-1g.jpg',   'Paracétamol', '1 g',     'Comprimé effervescent',        1.80,  2.10, 280, 'validé'),
(4,  1, 2, 'MED-0004', 'Aspégic',        'Douleurs, fièvre et états grippaux. Boîte de 20 sachets.',                                   'aspegic-1000.jpg',    'Acétylsalicylate de lysine', '1000 mg', 'Poudre pour solution buvable', 2.90, 2.10, 150, 'validé'),

-- Anti-inflammatoires
(5,  2, 1, 'MED-0005', 'Advil',           'Douleurs légères à modérées, fièvre. Boîte de 20 comprimés enrobés.',                        'advil-200.jpg',       'Ibuprofène', '200 mg',  'Comprimé enrobé',              3.40, 10.00, 300, 'validé'),
(6,  2, 3, 'MED-0006', 'Nurofen',         'Douleurs modérées, migraines, règles douloureuses. Boîte de 12 comprimés.',                  'nurofen-400.jpg',     'Ibuprofène', '400 mg',  'Comprimé pelliculé',           3.90, 10.00, 220, 'validé'),
(7,  2, 3, 'MED-0007', 'Voltarenactigo',     'Douleurs musculaires et articulaires, application locale. Tube de 50 g.',                    'voltarenactigo.jpg',  'Diclofénac', '1 %',     'Gel',                          4.80, 10.00, 180, 'validé'),

-- Digestion
(8,  3, 1, 'MED-0008', 'Spasfon',                'Douleurs spasmodiques de l''intestin et des voies biliaires. Boîte de 30 comprimés.',        'spasfon.jpg',         'Phloroglucinol', '80 mg', 'Comprimé enrobé',           2.60,  2.10, 260, 'validé'),
(9,  3, 1, 'MED-0009', 'Smecta',                 'Traitement de la diarrhée aiguë. Boîte de 30 sachets.',                                      'smecta.jpg',          'Diosmectite', '3 g',     'Poudre pour suspension buvable', 3.50, 2.10, 240, 'validé'),
(10, 3, 2, 'MED-0010', 'Imodium',           'Traitement de courte durée de la diarrhée aiguë. Boîte de 20 gélules.',                      'imodium-2.jpg',       'Lopéramide', '2 mg',    'Gélule',                       3.20, 10.00, 190, 'validé'),
(11, 3, 2, 'MED-0011', 'Gaviscon',               'Brûlures d''estomac et remontées acides. Flacon de 250 ml.',                                 'gaviscon.jpg',        'Alginate de sodium, bicarbonate de sodium', '500 mg / 267 mg pour 10 ml', 'Suspension buvable', 3.90, 10.00, 140, 'validé'),
(12, 3, 3, 'MED-0012', 'Oméprazole',       'Reflux gastro-œsophagien et ulcères. Boîte de 28 gélules.',                                  'omeprazole-20.jpg',   'Oméprazole', '20 mg',   'Gélule gastro-résistante',     4.10,  2.10, 200, 'validé'),

-- ORL et respiratoire
(13, 4, 1, 'MED-0013', 'Toplexil',               'Toux sèche et toux d''irritation. Flacon de 150 ml.',                                        'toplexil.jpg',        'Oxomémazine', '0,33 mg/ml', 'Sirop',                     2.90, 10.00, 120, 'validé'),
(14, 4, 2, 'MED-0014', 'Strepsils Miel Citron',  'Maux de gorge peu intenses. Boîte de 24 pastilles.',                                         'strepsils.jpg',       'Amylmétacrésol, alcool dichlorobenzylique', '0,6 mg / 1,2 mg', 'Pastille', 3.60, 10.00, 210, 'validé'),
(15, 4, 3, 'MED-0015', 'Rhinadvil',              'Rhume avec nez bouché et maux de tête. Boîte de 20 comprimés.',                              'rhinadvil.jpg',       'Ibuprofène, pseudoéphédrine', '200 mg / 30 mg', 'Comprimé enrobé', 4.20, 10.00, 0, 'validé'),
(16, 4, 1, 'MED-0016', 'Ventoline',       'Traitement de la crise d''asthme. Flacon pressurisé de 200 doses.',                          'ventoline.jpg',       'Salbutamol', '100 µg/dose', 'Suspension pour inhalation', 3.80, 2.10, 160, 'validé'),

-- Allergies
(17, 5, 2, 'MED-0017', 'Aerius',            'Rhinite allergique et urticaire. Boîte de 30 comprimés.',                                    'aerius-5.jpg',        'Desloratadine', '5 mg',  'Comprimé pelliculé',           5.20,  2.10, 170, 'validé'),
(18, 5, 3, 'MED-0018', 'Cétirizine',       'Rhinite allergique saisonnière ou permanente. Boîte de 15 comprimés.',                       'cetirizine-10.jpg',   'Cétirizine', '10 mg',   'Comprimé pelliculé',           2.40,  2.10, 230, 'validé'),
(19, 5, 3, 'MED-0019', 'Loratadine',       'Symptômes de la rhinite allergique. Boîte de 15 comprimés.',                                 'loratadine-10.jpg',   'Loratadine', '10 mg',   'Comprimé',                     2.30, 10.00, 90,  'en attente'),

-- Dermatologie et antiseptiques
(20, 6, 1, 'MED-0020', 'Biseptine',              'Antiseptique pour plaies superficielles. Flacon de 250 ml.',                                 'biseptine.jpg',       'Chlorhexidine, chlorure de benzalkonium, alcool benzylique', '0,25 g / 0,025 g / 4 ml pour 100 ml', 'Solution pour application cutanée', 4.30, 10.00, 150, 'validé'),
(21, 6, 2, 'MED-0021', 'Bétadine dermique', 'Antiseptique pour la peau et les plaies. Flacon de 125 ml.',                                 'betadine.jpg',        'Povidone iodée', '10 %', 'Solution pour application cutanée', 2.80, 2.10, 130, 'validé'),
(22, 6, 3, 'MED-0022', 'Dexeryl',                'Peau sèche, brûlures superficielles. Tube de 250 g.',                                        'dexeryl.jpg',         'Glycérol, vaseline, paraffine', '15 % / 8 % / 2 %', 'Crème', 3.70, 2.10, 110, 'en attente'),

-- Cardiologie et circulation
(23, 7, 1, 'MED-0023', 'Kardegic',         'Prévention des accidents cardiovasculaires. Boîte de 30 sachets.',                           'kardegic-75.jpg',     'Acétylsalicylate de lysine', '75 mg', 'Poudre pour solution buvable', 2.50, 2.10, 300, 'validé'),
(24, 7, 2, 'MED-0024', 'Atorvastatine',    'Baisse du cholestérol. Boîte de 30 comprimés.',                                              'atorvastatine-20.jpg','Atorvastatine', '20 mg', 'Comprimé pelliculé',          6.90,  2.10, 180, 'validé'),
(25, 7, 3, 'MED-0025', 'Daflon',          'Insuffisance veineuse : jambes lourdes. Boîte de 30 comprimés.',                             'daflon-500.jpg',      'Fraction flavonoïque purifiée micronisée', '500 mg', 'Comprimé pelliculé', 5.40, 10.00, 75, 'refusé'),

-- Antibiotiques
(26, 8, 1, 'MED-0026', 'Amoxicilline',    'Infections bactériennes. Boîte de 12 gélules. Sur ordonnance.',                              'amoxicilline-500.jpg','Amoxicilline', '500 mg', 'Gélule',                      2.20,  2.10, 260, 'validé'),
(27, 8, 2, 'MED-0027', 'Augmentin',   'Infections bactériennes. Boîte de 8 sachets. Sur ordonnance.',                               'augmentin.jpg',       'Amoxicilline, acide clavulanique', '1 g / 125 mg', 'Poudre pour suspension buvable', 4.60, 2.10, 140, 'validé'),

-- Diabète et hormones
(28, 9, 1, 'MED-0028', 'Metformine',     'Traitement du diabète de type 2. Boîte de 30 comprimés. Sur ordonnance.',                    'metformine-1000.jpg', 'Metformine', '1000 mg', 'Comprimé pelliculé',           2.70,  2.10, 220, 'validé'),
(29, 9, 3, 'MED-0029', 'Lévothyroxine',    'Hypothyroïdie. Boîte de 30 comprimés. Sur ordonnance.',                                      'levothyroxine-75.jpg','Lévothyroxine sodique', '75 µg', 'Comprimé sécable',      2.10,  2.10, 200, 'en attente');
