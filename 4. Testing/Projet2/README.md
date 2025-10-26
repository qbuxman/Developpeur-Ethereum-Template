# Projet 2 - Système de vote (tests)

## Contexte

À partir d'un smart contract donné (Voting.sol), réaliser les tests unitaires associés. Ces derniers devront couvrir les différentes étapes du contrat et vérifier que les events et revert fonctionnent correctement.

## Vue globale

Le fichier de test (```Voting.ts```) est dans le dossier ```4. Testing/Projet2/test/```.

Les tests sont divisés en plusieurs catégories (````describe````). Chaque describe comprend une fonction ```before``` qui va redeployer le contract et ajuster le statut du vote en fonction des besoins de la catégorie de test.

Les différentes catégories sont :

#### 1. Valeurs initiales des différentes variables du contrat

    Les tests vont vérifier que l'ensemble des variables soient correctement initialisées lors du déploiement du contrat

#### 2. Les getters

    Vérification que les getters ne peuvent être appelés que par les adresses autorisées et que les valeurs renvoyées sont correctes.

#### 3. Le workflow

    Vérification que seul le propriétaire du contrat peut modifier le statut et que les statuts se modifie correctement.
#### 4. Les votes

    Vérifie que les seules les personnes autorisées peuvent voter/dépouiller et que les votes soumis sont correctement comptabilisés.

    Vérifie que le dépouillement renvoie la proposition ayant reçu le plus de vote.
#### 5. Les emits

    Vérifie que chaque event est corretement envoyé au bon moment et avec les bon arguments.
#### 6. Un workflow complet de vote

    Imagine un workflow de vote de bout en bout.