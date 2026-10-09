# 🎓 Tableau de bord de suivi des modules — CPNE INGES

Un outil interactif et dynamique conçu pour accompagner le suivi de la progression, la gestion des objectifs de cours et l'organisation de l'agenda scolaire dans le cadre de la formation en Informatique de gestion au CPNE.

---

## 📌 Présentation du projet

Ce projet permet d'afficher et de gérer dynamiquement les modules de cours à partir d'un fichier JSON (`donnees.json`). L'application propose une interface fluide intégrant le calcul de progression par module, un visualiseur PDF en **Mode Focus**, ainsi qu'un système d'**interaction par commandes vocales**.

---

## ✨ Fonctionnalités principales

* **📊 Suivi de progression automatique** : 
  * Cochez vos objectifs au fur et à mesure.
  * Calcul de l'avancement en pourcentage avec barre de progression dynamique.
  * Sauvegarde automatique de votre état de progression dans le navigateur (`localStorage`).

* **🔍 Mode Focus & Visualiseur PDF** :
  * Affichage de la documentation de cours directement dans un visualiseur PDF dédié.
  * Isolation du module étudié et défilement fluide vers le document.

* **🎙️ Commandes vocales (Web Speech API)** :
  * **Navigation** : Défilement vers l'agenda, retour au haut ou au bas de page.
  * **Thème** : Basculez entre le *mode sombre* et le *mode clair* à la voix.
  * **Recherche & Focus** : Dites *"Affiche module [nom]"* pour mettre en surbrillance un cours, ou *"PDF [nom]"* pour ouvrir directement son document.

* **⚙️ Générateur dynamique** :
  * Gestion centralisée des données dans `donnees.json` générées automatiquement via `generateur.js`.
  * Prise en charge automatique des nouveaux badges de cours sans modifier le code principal.

---

## 🛠️ Technologies utilisées

* **HTML5 / CSS3** : Structure et mise en page responsive.
* **JavaScript (ES6+)** : Logique dynamique, manipulation du DOM, `fetch` et `localStorage`.
* **Web Speech API** : Reconnaissance vocale native pour le contrôle mains libres.
* **JSON** : Structure des données des cours, objectifs et emplois du temps.

---

## 📁 Structure du projet

```text
.
├── index.html        # Interface utilisateur principale
├── script.js         # Logique applicative, événements et commandes vocales
├── generateur.js     # Script de génération du fichier de données
├── donnees.json      # Base de données JSON des modules et de l'agenda
└── README.md         # Documentation du projet