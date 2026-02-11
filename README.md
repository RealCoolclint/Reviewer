# Reviewer — Version Web

Application de **validation vidéo** en HTML / JavaScript, utilisable dans le navigateur et déployable sur GitHub Pages.

## Fonctionnalités

- Lecture vidéo (glisser-déposer ou sélection de fichier)
- Overlay PNG (calque image par-dessus la vidéo)
- **Commentaires avec timecodes** : notes au temps courant ou sur un segment (point IN / OUT)
- **Capture d’écran** pour illustrer une note
- Catégories de notes : Montage, Édito, Coquille
- Export des notes en **texte** ou en **HTML avec images**
- VU-mètre audio
- Raccourcis clavier (Espace, flèches, N, C, I, O, F, etc.)
- Thème clair / sombre (sauvegardé en local)

## Utilisation locale

1. Ouvrir `index.html` dans un navigateur (double-clic ou « Ouvrir avec »).
2. Ou servir le dossier avec un serveur HTTP :
   ```bash
   cd web
   npx serve .
   # ou: python3 -m http.server 8080
   ```
3. Charger une vidéo (fichier ou glisser-déposer), ajouter des notes, exporter si besoin.

## Déploiement sur GitHub Pages

1. Créer un dépôt GitHub (ex. `reviewer-video`).
2. Copier le contenu du dossier `web/` à la **racine** du dépôt (ou dans un dossier, ex. `docs/`).
3. Sur GitHub : **Settings → Pages** :
   - **Source** : Deploy from a branch
   - **Branch** : `main` (ou `master`)
   - **Folder** : `/ (root)` si les fichiers sont à la racine, sinon `/docs`
4. Sauvegarder. L’app sera disponible à :  
   `https://<username>.github.io/<repo>/`  
   (ou `https://<username>.github.io/<repo>/docs/` si vous avez utilisé le dossier `docs`).

## Structure

- `index.html` — Page principale
- `styles.css` — Styles (thème, layout, composants)
- `app.js` — Logique (lecture, notes, export, VU-mètre, raccourcis)

## Suite

- Amélioration de l’interface
- Fonctions de collaboration (partage de projets / notes)
- Automatisations (export, templates, etc.)

## Licence

MIT (ou celle du projet parent).
