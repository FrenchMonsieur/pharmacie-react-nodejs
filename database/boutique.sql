-- =============================================================
-- Script de création de la base de données
-- Projet : E-boutique GSB (Galaxy Swiss Bourdin)
-- SGBD   : MySQL 8 / MariaDB
-- =============================================================

-- Création de la base (encodage utf8mb4 pour gérer les accents)
CREATE DATABASE IF NOT EXISTS gsb_eboutique
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gsb_eboutique;

-- Suppression des tables si elles existent déjà, pour pouvoir
-- relancer le script. Ordre inverse de la création, à cause
-- des clés étrangères. ATTENTION : supprime aussi les données.
DROP TABLE IF EXISTS historique;
DROP TABLE IF EXISTS contenir;
DROP TABLE IF EXISTS commande;
DROP TABLE IF EXISTS medicament;
DROP TABLE IF EXISTS utilisateur;
DROP TABLE IF EXISTS categorie;


-- -------------------------------------------------------------
-- CATEGORIE : les catégories de produits
-- -------------------------------------------------------------
CREATE TABLE categorie (
    id_cat      INT AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(80) NOT NULL UNIQUE,
    description TEXT
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- UTILISATEUR : tous les comptes (professionnel de santé,
-- fournisseur, administrateur), distingués par leur rôle
-- -------------------------------------------------------------
CREATE TABLE utilisateur (
    id_uti               INT AUTO_INCREMENT PRIMARY KEY,
    nom                  VARCHAR(100) NOT NULL,
    email                VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe_hash    VARCHAR(255) NOT NULL,
    role                 VARCHAR(30)  NOT NULL,
    adresse              VARCHAR(255) NOT NULL,
    premiere_connexion   TINYINT(1)   NOT NULL DEFAULT 1,
    date_creation_compte DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif                TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- MEDICAMENT : les produits du catalogue
-- id_uti = le compte qui a proposé le produit (fournisseur ou admin)
-- -------------------------------------------------------------
CREATE TABLE medicament (
    id_med            INT AUTO_INCREMENT PRIMARY KEY,
    id_cat            INT            NOT NULL,
    id_uti            INT            NOT NULL,
    reference         VARCHAR(50)    NOT NULL UNIQUE,
    nom               VARCHAR(120)   NOT NULL,
    description       TEXT           NOT NULL,
    image             VARCHAR(255)   NOT NULL,
    principe_actif    VARCHAR(150)   NOT NULL,
    dosage            VARCHAR(80)    NOT NULL,
    forme             VARCHAR(60)    NOT NULL,
    prix_ht           DECIMAL(10,2)  NOT NULL,
    taux_tva          DECIMAL(5,2)   NOT NULL,
    stock             INT            NOT NULL DEFAULT 0,
    statut_validation VARCHAR(20)    NOT NULL DEFAULT 'en attente',
    actif             TINYINT(1)     NOT NULL DEFAULT 1,

    CONSTRAINT fk_med_cat FOREIGN KEY (id_cat) REFERENCES categorie(id_cat),
    CONSTRAINT fk_med_uti FOREIGN KEY (id_uti) REFERENCES utilisateur(id_uti)
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- COMMANDE : une commande passée par un utilisateur
-- -------------------------------------------------------------
CREATE TABLE commande (
    id_com             INT AUTO_INCREMENT PRIMARY KEY,
    id_uti             INT          NOT NULL,
    reference_commande VARCHAR(50)  NOT NULL UNIQUE,
    date_commande      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut             VARCHAR(30)  NOT NULL DEFAULT 'en attente',
    adresse_livraison  VARCHAR(255) NOT NULL,

    CONSTRAINT fk_com_uti FOREIGN KEY (id_uti) REFERENCES utilisateur(id_uti)
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- CONTENIR : les lignes d'une commande (lien commande <-> médicament)
-- Prix HT et taux de TVA figés au moment de l'achat
-- Clé primaire composée : un médicament une seule fois par commande
-- -------------------------------------------------------------
CREATE TABLE contenir (
    id_med        INT           NOT NULL,
    id_com        INT           NOT NULL,
    quantite      INT           NOT NULL,
    prix_ht_fige  DECIMAL(10,2) NOT NULL,
    taux_tva_fige DECIMAL(5,2)  NOT NULL,

    CONSTRAINT pk_con     PRIMARY KEY (id_med, id_com),
    CONSTRAINT fk_con_med FOREIGN KEY (id_med) REFERENCES medicament(id_med),
    CONSTRAINT fk_con_com FOREIGN KEY (id_com) REFERENCES commande(id_com)
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- HISTORIQUE : chaque changement de statut d'une commande
-- -------------------------------------------------------------
CREATE TABLE historique (
    id_his         INT AUTO_INCREMENT PRIMARY KEY,
    id_com         INT         NOT NULL,
    `date`         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    action         VARCHAR(50) NOT NULL,
    ancien_statut  VARCHAR(30),
    nouveau_statut VARCHAR(30),
    commentaire    TEXT,

    CONSTRAINT fk_his_com FOREIGN KEY (id_com) REFERENCES commande(id_com)
) ENGINE = InnoDB;