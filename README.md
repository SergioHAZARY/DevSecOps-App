# DevSecOps App — *Apprends, Pratique, Sécurise*

Plateforme d'apprentissage **DevSecOps** de type W3Schools, **100 % bilingue (français / anglais)**, moderne et interactive, qui mène du **débutant au Pro puis à l'Expert**. Chaque extrait de code est **copiable et exécutable** dans le navigateur, chaque leçon finit par un **quiz**, et chaque module délivre un **certificat PDF**.

> **Learn DevSecOps from A to Z**, offline-first, from beginner to expert — Linux, networking, Python, Bash, Terraform, Docker, Kubernetes, secure CI/CD, OWASP, and an ethical offensive-&-defensive hacking module.

- 🌐 **9 modules**, ~50 cours, ~290+ leçons prévues (débutant → expert)
- 💻 **Playground** : Python, JavaScript, TypeScript, SQL, JSON, YAML et HTML tournent **dans le navigateur** (Pyodide, sql.js, Monaco)
- 🧪 **Vulnérable vs Sécurisé** sur chaque sujet sensible, avec l'attaque **et** la correction
- 📶 **100 % hors-ligne** (PWA + application Android) — pensé pour les coupures d'électricité et d'internet
- 📱 **Application Android** installable, qui se **met à jour automatiquement** sans réinstallation
- 🔎 Recherche globale **Ctrl + K**, mode **clair / sombre**, progression et certificats en **localStorage**
- 🔐 Le projet **applique ses propres leçons** : pipeline GitHub Actions avec Gitleaks, Trivy et CodeQL

---

## 1. Démarrage rapide

```bash
# Prérequis : Node.js >= 20
npm install
npm run dev          # http://localhost:3000  (redirige vers /fr)
```

Build de production (export statique dans `out/`) :

```bash
npm run build        # génère le contenu, les icônes, le site et le service worker
npx serve out        # sert le site statique localement
```

Scripts utiles :

| Script | Rôle |
|---|---|
| `npm run content` | Compile les leçons `content/**/*.yaml` → `data/lessons/*` + index de recherche |
| `npm run content:check` | **Valide** toutes les leçons (structure, langages, quiz) sans rien écrire |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint (config Next.js) |
| `npm run build` | Build complet (contenu + icônes + export statique + service worker) |

---

## 2. Stack technique

- **Next.js 16** (App Router, **export statique** `output: "export"`) + **React 19** + **TypeScript**
- **Tailwind CSS** + composants type **shadcn/ui** (Radix UI)
- **Monaco Editor** pour « Try it Yourself », **Shiki** pour la coloration au build
- **Pyodide** (Python), **sql.js** (SQLite), Web Workers pour JS/TS — exécution **sandboxée**, rien n'est envoyé à un serveur
- **cmdk** (recherche Ctrl+K), **next-themes** (clair/sombre), **jsPDF** (certificats)
- **Capacitor** pour l'application Android + **@capgo/capacitor-updater** pour l'OTA
- **PWA** : service worker de précache complet (généré par `scripts/gen-sw.mjs`)

---

## 3. Structure du projet

```
app/                     Pages (App Router) : [locale]/{courses,modules,playground,progress}
components/              UI : CodeBlock, Playground, Quiz, Sidebar, Search, widgets…
data/
  curriculum.ts          Source de vérité : modules → cours → leçons
  lessons/               Généré depuis content/ (ne pas éditer à la main)
content/
  <cours>/<leçon>.yaml   Contenu bilingue d'une leçon (voir content/AUTHORING.md)
lib/                     i18n, progression, runners (playground), recherche, certificat…
scripts/
  build-content.ts       Valide + compile les leçons et l'index de recherche
  gen-icons.mjs          Génère les icônes PNG depuis le SVG
  gen-sw.mjs             Génère le service worker (précache hors-ligne) après le build
android/                 Projet Android natif (Capacitor)
.github/workflows/       CI, déploiement Pages, build Android + release OTA, CodeQL
public/                  Icônes, modèle de certificat, index de recherche (généré)
```

### Ajouter ou modifier une leçon

Tout le contenu vit dans des fichiers YAML bilingues sous `content/`. Le format complet et les règles
sont documentés dans **[`content/AUTHORING.md`](content/AUTHORING.md)**. Après édition :

```bash
npm run content:check <slug-du-cours>   # doit afficher ✔
```

---

## 4. Mode hors-ligne (PWA)

Après la **première visite en ligne**, le service worker télécharge l'ensemble du site en arrière-plan
(toutes les leçons, la recherche, les calculateurs, les certificats). Ensuite **tout fonctionne sans
internet**. Les environnements d'exécution du playground (Python, SQLite, Monaco) sont mis en cache à la
première utilisation, puis disponibles hors-ligne.

Installable comme application web (PWA) depuis le navigateur (« Installer l'application »).

---

## 5. Application Android

L'application Android **embarque tout le site dans l'APK** : elle fonctionne **à 100 % hors-ligne dès
l'installation**, sans aucune connexion.

### Installer

1. Récupérer **`devsecops-app.apk`** dans la [dernière release GitHub](https://github.com/SergioHAZARY/DevSecOps-App/releases/latest).
2. Sur le téléphone : autoriser l'installation depuis des **sources inconnues**, puis ouvrir l'APK.

### Mise à jour automatique (sans réinstallation)

À chaque `push` sur `main`, GitHub Actions reconstruit le site et publie un **bundle web** (`web-bundle.zip`).
Au lancement, si l'application a du réseau, elle lit `app-version.json` (publié sur GitHub Pages), télécharge
le nouveau bundle et l'applique **au prochain démarrage** — le contenu se met à jour **sans réinstaller
l'APK**. Hors-ligne, elle continue sur la version embarquée.

> Reconstruire l'APK native (changement de la coque Android, nouvelle version d'un plugin) nécessite, lui,
> une nouvelle installation — mais **toutes les leçons et pratiques** se mettent à jour par OTA.

### Construire l'APK en local (optionnel)

```bash
# Prérequis : JDK 21 + Android SDK
NEXT_PUBLIC_BASE_PATH="" npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
# APK : android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 6. Déploiement & CI/CD (GitHub Actions)

| Workflow | Déclencheur | Rôle |
|---|---|---|
| `ci.yml` | push / PR | Valide le contenu, types, lint, build + **Gitleaks** et **Trivy** |
| `codeql.yml` | push / PR / hebdo | **SAST** CodeQL sur le code du site |
| `deploy.yml` | push `main` | Build + déploiement **GitHub Pages** + `app-version.json` (OTA) |
| `android.yml` | push `main` | Build **APK** + bundle OTA, publiés dans une **release** |

**À faire une fois dans les réglages du dépôt** : *Settings → Pages → Build and deployment → Source =
**GitHub Actions***. Le site sera servi sur `https://SergioHAZARY.github.io/DevSecOps-App/`.

Le projet **applique le DevSecOps qu'il enseigne** : secrets scannés (Gitleaks), dépendances et IaC scannés
(Trivy), SAST (CodeQL), mises à jour (Dependabot), permissions minimales et actions épinglées.

---

## 7. Module 8 — Hacking éthique : avertissement

Le module *Hacking éthique (offensif & défensif)* est strictement **éducatif et défensif**. Toutes les
techniques offensives y sont présentées **uniquement** pour comprendre et construire la défense, à exécuter
**exclusivement** sur :

- **vos propres systèmes** (votre box Wi-Fi, vos machines virtuelles de laboratoire, vos comptes), ou
- des cibles d'entraînement prévues pour cela (DVWA, OWASP Juice Shop, `scanme.nmap.org`), ou
- un périmètre pour lequel vous avez une **autorisation écrite**.

Tester des systèmes, réseaux ou comptes de tiers sans autorisation est **illégal**. Ce module n'enseigne ni
le ciblage de personnes ou de services réels, ni le vol d'identifiants : il enseigne à **se défendre**.

---

## 8. Crédits

- Contenu pédagogique original rédigé pour **DevSecOps App**.
- Remerciements à l'institut **StackNova** (Madagascar) et à **RAJAOSOLOMANANTENA Haingonirina Ignace**
  (support de cours cybersécurité) pour les documents de formation ayant servi de référence de couverture
  sur les bases réseau, Linux et la sensibilisation à la cybersécurité.

## 9. Licence

Contenu pédagogique libre d'utilisation pour apprendre. Voir les avertissements du module 8 avant toute mise
en pratique offensive.
