import type { Course, LessonRef, Level, Module } from "@/lib/types";

/**
 * DevSecOps App - structure complète du curriculum.
 *
 * Ce fichier est la source de vérité de la navigation : modules > cours > leçons.
 * Le contenu de chaque leçon vit dans /content/<cours>/<leçon>.yaml et est compilé
 * vers /data/lessons/<cours>.ts par `npm run content`.
 */

const l = (slug: string, fr: string, en: string): LessonRef => ({ slug, title: { fr, en } });

const course = (
  number: string,
  slug: string,
  level: Level,
  title: [string, string],
  description: [string, string],
  tags: string[],
  lessons: LessonRef[],
): Course => ({
  number,
  slug,
  level,
  title: { fr: title[0], en: title[1] },
  description: { fr: description[0], en: description[1] },
  tags,
  lessons,
});

export const modules: Module[] = [
  /* ================================================================ */
  /* MODULE 0 - FONDATIONS                                             */
  /* ================================================================ */
  {
    id: 0,
    slug: "foundations",
    icon: "foundations",
    level: "beginner",
    title: { fr: "Fondations", en: "Foundations" },
    description: {
      fr: "Les bases indispensables pour débuter : culture DevSecOps, Linux, réseaux et adressage IP.",
      en: "The essential basics to get started: DevSecOps culture, Linux, networking and IP addressing.",
    },
    courses: [
      course(
        "0.1",
        "what-is-devsecops",
        "beginner",
        ["Qu'est-ce que DevSecOps ?", "What is DevSecOps?"],
        [
          "Dev, DevOps, DevSecOps, SRE : comprendre les rôles, la culture et le pipeline sécurisé.",
          "Dev, DevOps, DevSecOps, SRE: understand the roles, the culture and the secure pipeline.",
        ],
        ["DevSecOps", "DevOps", "SRE", "Shift Left"],
        [
          l("definition", "DevSecOps : définition et origines", "DevSecOps: definition and origins"),
          l("dev-devops-devsecops-sre", "Dev vs DevOps vs DevSecOps vs SRE", "Dev vs DevOps vs DevSecOps vs SRE"),
          l("shift-left", "Shift Left : la sécurité dès la première ligne de code", "Shift Left: security from the first line of code"),
          l("pipeline-overview", "Anatomie d'un pipeline DevSecOps", "Anatomy of a DevSecOps pipeline"),
          l("culture-and-metrics", "Culture, CALMS et métriques DORA", "Culture, CALMS and DORA metrics"),
        ],
      ),
      course(
        "0.2",
        "roadmap-2026",
        "beginner",
        ["Roadmap complète 2026", "Complete 2026 Roadmap"],
        [
          "Le chemin étape par étape pour devenir ingénieur DevSecOps en 2026.",
          "The step-by-step path to become a DevSecOps engineer in 2026.",
        ],
        ["Roadmap", "Carrière", "Homelab"],
        [
          l("overview", "La roadmap en 8 étapes", "The roadmap in 8 steps"),
          l("skills-by-level", "Compétences par niveau : junior, confirmé, senior", "Skills by level: junior, mid, senior"),
          l("tools-landscape", "Panorama des outils DevSecOps", "The DevSecOps tools landscape"),
          l("study-plan", "Plan d'étude sur 12 mois", "A 12-month study plan"),
          l("build-your-lab", "Monter son laboratoire d'apprentissage", "Build your learning lab"),
        ],
      ),
      course(
        "0.3",
        "linux-fundamentals",
        "beginner",
        ["Linux fondamental pour DevSecOps", "Linux Fundamentals for DevSecOps"],
        [
          "Commandes, utilisateurs, permissions, SSH, systemd et journaux : le socle de tout ingénieur.",
          "Commands, users, permissions, SSH, systemd and logs: the foundation of every engineer.",
        ],
        ["Linux", "SSH", "systemd", "chmod"],
        [
          l("filesystem-navigation", "Système de fichiers et navigation", "Filesystem and navigation"),
          l("files-and-text", "Manipuler fichiers et texte : grep, find, pipes", "Working with files and text: grep, find, pipes"),
          l("users-and-groups", "Utilisateurs, groupes et sudo", "Users, groups and sudo"),
          l("permissions", "Permissions : chmod, chown, umask, SUID", "Permissions: chmod, chown, umask, SUID"),
          l("processes-and-packages", "Processus et gestion des paquets", "Processes and package management"),
          l("ssh", "SSH : connexion sécurisée et clés", "SSH: secure connection and keys"),
          l("systemd", "Systemd : services, unités et journald", "Systemd: services, units and journald"),
          l("logs-and-cron", "Journaux système et tâches planifiées", "System logs and scheduled tasks"),
        ],
      ),
      course(
        "0.4",
        "networking-security",
        "beginner",
        ["Réseaux pour la sécurité", "Networking for Security"],
        [
          "OSI, TCP/IP, DNS, HTTP/HTTPS, ports et pare-feu expliqués simplement.",
          "OSI, TCP/IP, DNS, HTTP/HTTPS, ports and firewalls explained simply.",
        ],
        ["TCP/IP", "DNS", "HTTP", "OSI", "Firewall"],
        [
          l("osi-and-tcpip", "Modèles OSI et TCP/IP", "The OSI and TCP/IP models"),
          l("tcp-udp-ports", "TCP, UDP et ports", "TCP, UDP and ports"),
          l("dns", "DNS : fonctionnement et sécurité", "DNS: how it works and how to secure it"),
          l("http-https", "HTTP et HTTPS", "HTTP and HTTPS"),
          l("firewall-concepts", "Pare-feu : principes et filtrage", "Firewalls: principles and filtering"),
          l("network-tools", "Outils réseau : nmap, tcpdump, ss, curl", "Network tools: nmap, tcpdump, ss, curl"),
          l("common-attacks", "Attaques réseau courantes et défenses", "Common network attacks and defenses"),
        ],
      ),
      course(
        "0.5",
        "binary-ip-cidr",
        "beginner",
        ["Binaire, hexadécimal, IP et CIDR", "Binary, Hexadecimal, IP and CIDR"],
        [
          "Compter en binaire, lire une adresse IP, découper un réseau - avec calculateur interactif.",
          "Count in binary, read an IP address, split a network - with an interactive calculator.",
        ],
        ["Binaire", "Hexadécimal", "IPv4", "CIDR", "Subnetting"],
        [
          l("binary", "Le binaire", "Binary"),
          l("hexadecimal", "L'hexadécimal", "Hexadecimal"),
          l("ipv4-addresses", "Adresses IPv4 publiques et privées", "Public and private IPv4 addresses"),
          l("cidr-and-masks", "Masques et notation CIDR", "Masks and CIDR notation"),
          l("subnetting", "Découpage en sous-réseaux", "Subnetting"),
          l("ipv6-and-practice", "IPv6 et mise en pratique", "IPv6 and hands-on practice"),
        ],
      ),
    ],
  },

  /* ================================================================ */
  /* MODULE 1 - LANGAGES                                               */
  /* ================================================================ */
  {
    id: 1,
    slug: "languages",
    icon: "languages",
    level: "beginner",
    title: { fr: "Langages à maîtriser", en: "Languages to Master" },
    description: {
      fr: "Les 10 langages du quotidien DevSecOps : syntaxe, exemples de sécurité, cas réels et exercices.",
      en: "The 10 everyday DevSecOps languages: syntax, security examples, real cases and exercises.",
    },
    courses: [
      course(
        "1.1",
        "python",
        "beginner",
        ["Python", "Python"],
        [
          "Scripting sécurité, scan de ports, automatisation, API Flask sécurisée et Boto3 pour AWS.",
          "Security scripting, port scanning, automation, secure Flask API and Boto3 for AWS.",
        ],
        ["Python", "Flask", "Boto3", "Bandit"],
        [
          l("syntax-basics", "Syntaxe de base", "Syntax basics"),
          l("data-structures-functions", "Structures de données et fonctions", "Data structures and functions"),
          l("files-json-regex", "Fichiers, JSON et regex : analyser des logs", "Files, JSON and regex: parsing logs"),
          l("port-scanner", "Écrire un scanner de ports", "Writing a port scanner"),
          l("automation", "Automatisation : subprocess, requests et API", "Automation: subprocess, requests and APIs"),
          l("secure-flask-api", "API Flask sécurisée", "A secure Flask API"),
          l("boto3-aws", "Boto3 : auditer AWS en Python", "Boto3: auditing AWS with Python"),
          l("secure-coding", "Code Python sûr : venv, tests, Bandit, pip-audit", "Safe Python code: venv, tests, Bandit, pip-audit"),
        ],
      ),
      course(
        "1.2",
        "bash",
        "beginner",
        ["Bash / Shell Scripting", "Bash / Shell Scripting"],
        [
          "Scripts d'audit, de sauvegarde, de durcissement et de supervision.",
          "Audit, backup, hardening and monitoring scripts.",
        ],
        ["Bash", "Shell", "ShellCheck", "cron"],
        [
          l("basics", "Bases : variables, guillemets et mode strict", "Basics: variables, quoting and strict mode"),
          l("control-flow-functions", "Conditions, boucles et fonctions", "Conditions, loops and functions"),
          l("text-processing", "Traitement de texte : grep, sed, awk", "Text processing: grep, sed, awk"),
          l("audit-script", "Script d'audit de sécurité", "Security audit script"),
          l("backup-script", "Script de sauvegarde chiffrée", "Encrypted backup script"),
          l("hardening-script", "Script de durcissement", "Hardening script"),
          l("monitoring-script", "Script de supervision et d'alerte", "Monitoring and alerting script"),
        ],
      ),
      course(
        "1.3",
        "go",
        "intermediate",
        ["Go (Golang)", "Go (Golang)"],
        [
          "Outils de sécurité rapides, CLI et microservices sécurisés.",
          "Fast security tools, CLIs and secure microservices.",
        ],
        ["Go", "Goroutines", "gosec", "CLI"],
        [
          l("syntax-basics", "Syntaxe de base", "Syntax basics"),
          l("structs-interfaces-errors", "Structs, interfaces et gestion des erreurs", "Structs, interfaces and error handling"),
          l("concurrent-port-scanner", "Concurrence : un scanner de ports rapide", "Concurrency: a fast port scanner"),
          l("cli-tool", "Créer un outil CLI", "Building a CLI tool"),
          l("secure-microservice", "Microservice HTTP sécurisé", "A secure HTTP microservice"),
          l("security-tooling", "gosec, govulncheck et binaires statiques", "gosec, govulncheck and static binaries"),
        ],
      ),
      course(
        "1.4",
        "javascript-typescript",
        "intermediate",
        ["JavaScript / TypeScript", "JavaScript / TypeScript"],
        [
          "Sécuriser Node.js et Express : JWT, Helmet, validation et OWASP.",
          "Securing Node.js and Express: JWT, Helmet, validation and OWASP.",
        ],
        ["Node.js", "Express", "JWT", "Helmet", "TypeScript"],
        [
          l("essentials", "L'essentiel de JavaScript et TypeScript", "JavaScript and TypeScript essentials"),
          l("nodejs-security-basics", "Bases de sécurité Node.js", "Node.js security basics"),
          l("secure-express", "Express sécurisé : Helmet, CORS, rate limiting", "Secure Express: Helmet, CORS, rate limiting"),
          l("jwt-authentication", "Authentification JWT", "JWT authentication"),
          l("input-validation-owasp", "Validation des entrées et OWASP pour Node.js", "Input validation and OWASP for Node.js"),
          l("typescript-safety", "TypeScript, ESLint et npm audit", "TypeScript, ESLint and npm audit"),
        ],
      ),
      course(
        "1.5",
        "yaml",
        "beginner",
        ["YAML", "YAML"],
        [
          "Kubernetes, GitHub Actions, Ansible, Docker Compose - et les erreurs courantes.",
          "Kubernetes, GitHub Actions, Ansible, Docker Compose - and the common mistakes.",
        ],
        ["YAML", "Kubernetes", "GitHub Actions", "yamllint"],
        [
          l("syntax", "Syntaxe : clés, listes et types", "Syntax: keys, lists and types"),
          l("advanced-features", "Ancres, alias et texte multiligne", "Anchors, aliases and multiline text"),
          l("kubernetes-manifests", "YAML pour Kubernetes", "YAML for Kubernetes"),
          l("github-actions", "YAML pour GitHub Actions", "YAML for GitHub Actions"),
          l("ansible-docker-compose", "YAML pour Ansible et Docker Compose", "YAML for Ansible and Docker Compose"),
          l("common-errors-linting", "Erreurs courantes et yamllint", "Common errors and yamllint"),
        ],
      ),
      course(
        "1.6",
        "json",
        "beginner",
        ["JSON", "JSON"],
        [
          "Configuration, politiques IAM et API : lire, valider et interroger du JSON.",
          "Configuration, IAM policies and APIs: read, validate and query JSON.",
        ],
        ["JSON", "jq", "JSON Schema", "IAM"],
        [
          l("syntax", "Syntaxe et types", "Syntax and types"),
          l("jq", "Interroger du JSON avec jq", "Querying JSON with jq"),
          l("json-schema", "Valider avec JSON Schema", "Validating with JSON Schema"),
          l("iam-policies", "Politiques IAM en JSON", "IAM policies in JSON"),
          l("apis-and-security", "JSON, API et pièges de sécurité", "JSON, APIs and security pitfalls"),
        ],
      ),
      course(
        "1.7",
        "hcl-terraform",
        "intermediate",
        ["HCL - Terraform", "HCL - Terraform"],
        [
          "Le langage de l'Infrastructure as Code : blocs, variables, expressions et modules.",
          "The language of Infrastructure as Code: blocks, variables, expressions and modules.",
        ],
        ["HCL", "Terraform", "IaC"],
        [
          l("syntax", "Syntaxe HCL : blocs et arguments", "HCL syntax: blocks and arguments"),
          l("variables-outputs-locals", "Variables, outputs et locals", "Variables, outputs and locals"),
          l("expressions-functions-loops", "Expressions, fonctions et boucles", "Expressions, functions and loops"),
          l("resources-data-sources", "Ressources et data sources", "Resources and data sources"),
          l("modules-syntax", "Écrire et appeler un module", "Writing and calling a module"),
          l("validation-secure-patterns", "Validation et patterns sécurisés", "Validation and secure patterns"),
        ],
      ),
      course(
        "1.8",
        "rego-opa",
        "advanced",
        ["Rego - Open Policy Agent", "Rego - Open Policy Agent"],
        [
          "Écrire des politiques de sécurité en tant que code avec OPA.",
          "Writing security policies as code with OPA.",
        ],
        ["Rego", "OPA", "Gatekeeper", "Conftest"],
        [
          l("introduction", "OPA et Rego : premiers pas", "OPA and Rego: first steps"),
          l("rules-and-iteration", "Règles, itération et compréhensions", "Rules, iteration and comprehensions"),
          l("kubernetes-admission", "Contrôle d'admission Kubernetes avec Gatekeeper", "Kubernetes admission control with Gatekeeper"),
          l("terraform-conftest", "Valider Terraform et Dockerfile avec Conftest", "Validating Terraform and Dockerfiles with Conftest"),
          l("testing-and-ci", "Tester ses politiques et les intégrer en CI", "Testing policies and integrating them in CI"),
        ],
      ),
      course(
        "1.9",
        "sql",
        "beginner",
        ["SQL", "SQL"],
        [
          "Requêtes, injection SQL, requêtes préparées et moindre privilège.",
          "Queries, SQL injection, prepared statements and least privilege.",
        ],
        ["SQL", "Injection", "Prepared Statements", "PostgreSQL"],
        [
          l("basics", "Bases : SELECT, INSERT, UPDATE, DELETE", "Basics: SELECT, INSERT, UPDATE, DELETE"),
          l("joins-and-aggregation", "Jointures et agrégations", "Joins and aggregations"),
          l("sql-injection", "L'injection SQL expliquée", "SQL injection explained"),
          l("prepared-statements", "Requêtes préparées", "Prepared statements"),
          l("privileges", "Privilèges, rôles et moindre privilège", "Privileges, roles and least privilege"),
          l("database-hardening", "Durcir et auditer une base de données", "Hardening and auditing a database"),
        ],
      ),
      course(
        "1.10",
        "powershell",
        "intermediate",
        ["PowerShell", "PowerShell"],
        [
          "Automatiser et sécuriser Windows, Active Directory et Azure.",
          "Automating and securing Windows, Active Directory and Azure.",
        ],
        ["PowerShell", "Active Directory", "Azure", "Windows"],
        [
          l("basics", "Bases : cmdlets, pipeline et objets", "Basics: cmdlets, pipeline and objects"),
          l("scripting", "Scripts, fonctions et gestion des erreurs", "Scripts, functions and error handling"),
          l("windows-security-audit", "Auditer la sécurité de Windows", "Auditing Windows security"),
          l("active-directory", "Active Directory en PowerShell", "Active Directory with PowerShell"),
          l("azure", "Azure avec le module Az", "Azure with the Az module"),
          l("secure-powershell", "Sécuriser PowerShell : signature, journalisation, JEA", "Securing PowerShell: signing, logging, JEA"),
        ],
      ),
    ],
  },

  /* ================================================================ */
  /* MODULE 2 - SÉCURITÉ D'INFRASTRUCTURE                              */
  /* ================================================================ */
  {
    id: 2,
    slug: "infrastructure-security",
    icon: "infrastructure",
    level: "intermediate",
    title: { fr: "Sécurité d'infrastructure", en: "Infrastructure Security" },
    description: {
      fr: "Durcir les serveurs, gérer secrets et identités, protéger le réseau, le cloud et les conteneurs.",
      en: "Harden servers, manage secrets and identities, protect the network, the cloud and containers.",
    },
    courses: [
      course(
        "2.1",
        "server-hardening",
        "intermediate",
        ["Hardening Linux & Windows Server", "Linux & Windows Server Hardening"],
        [
          "Réduire la surface d'attaque des serveurs avec les CIS Benchmarks.",
          "Reducing the attack surface of servers with the CIS Benchmarks.",
        ],
        ["Hardening", "CIS", "Lynis", "auditd"],
        [
          l("principles", "Principes du durcissement et CIS Benchmarks", "Hardening principles and CIS Benchmarks"),
          l("linux-hardening", "Durcir Linux : noyau, services, comptes", "Hardening Linux: kernel, services, accounts"),
          l("ssh-hardening", "Durcir SSH", "Hardening SSH"),
          l("audit-and-integrity", "Audit et intégrité : auditd, AIDE, Lynis", "Audit and integrity: auditd, AIDE, Lynis"),
          l("windows-hardening", "Durcir Windows Server", "Hardening Windows Server"),
          l("patch-management", "Gestion des correctifs", "Patch management"),
        ],
      ),
      course(
        "2.2",
        "secrets-management",
        "intermediate",
        ["Gestion des secrets", "Secrets Management"],
        [
          "Vault, AWS Secrets Manager, fichiers .env et détection de fuites.",
          "Vault, AWS Secrets Manager, .env files and leak detection.",
        ],
        ["Vault", "Secrets Manager", ".env", "GitGuardian"],
        [
          l("why-secrets-leak", "Pourquoi les secrets fuient", "Why secrets leak"),
          l("env-files", "Fichiers .env et variables d'environnement", ".env files and environment variables"),
          l("vault-basics", "HashiCorp Vault : les bases", "HashiCorp Vault: the basics"),
          l("vault-dynamic-secrets", "Vault : secrets dynamiques et intégration applicative", "Vault: dynamic secrets and app integration"),
          l("aws-secrets-manager", "AWS Secrets Manager et Parameter Store", "AWS Secrets Manager and Parameter Store"),
          l("detection-and-rotation", "Détection, rotation et réponse à une fuite", "Detection, rotation and leak response"),
        ],
      ),
      course(
        "2.3",
        "identity-management",
        "intermediate",
        ["Gestion des identités", "Identity Management"],
        [
          "IAM, RBAC, moindre privilège et MFA.",
          "IAM, RBAC, least privilege and MFA.",
        ],
        ["IAM", "RBAC", "Least Privilege", "MFA"],
        [
          l("iam-concepts", "Concepts IAM : authentification et autorisation", "IAM concepts: authentication and authorization"),
          l("aws-iam", "AWS IAM : utilisateurs, rôles et politiques", "AWS IAM: users, roles and policies"),
          l("rbac-least-privilege", "RBAC et moindre privilège", "RBAC and least privilege"),
          l("mfa-sso", "MFA et SSO : OIDC et SAML", "MFA and SSO: OIDC and SAML"),
          l("workload-identity-reviews", "Identités machine et revue des accès", "Workload identities and access reviews"),
        ],
      ),
      course(
        "2.4",
        "firewall-waf-ids",
        "intermediate",
        ["Firewall, WAF, IDS/IPS", "Firewall, WAF, IDS/IPS"],
        [
          "iptables, UFW, Fail2Ban, ModSecurity et détection d'intrusion.",
          "iptables, UFW, Fail2Ban, ModSecurity and intrusion detection.",
        ],
        ["iptables", "UFW", "Fail2Ban", "ModSecurity", "Suricata"],
        [
          l("iptables-nftables", "iptables et nftables", "iptables and nftables"),
          l("ufw", "UFW : le pare-feu simplifié", "UFW: the uncomplicated firewall"),
          l("fail2ban", "Fail2Ban contre la force brute", "Fail2Ban against brute force"),
          l("modsecurity-waf", "WAF : ModSecurity et OWASP CRS", "WAF: ModSecurity and the OWASP CRS"),
          l("ids-ips-suricata", "IDS/IPS avec Suricata", "IDS/IPS with Suricata"),
          l("defense-in-depth", "Défense en profondeur et segmentation", "Defense in depth and segmentation"),
        ],
      ),
      course(
        "2.5",
        "cloud-security",
        "intermediate",
        ["Sécurité Cloud", "Cloud Security"],
        [
          "AWS, Azure, GCP : responsabilité partagée, CIS Benchmarks et Security Groups.",
          "AWS, Azure, GCP: shared responsibility, CIS Benchmarks and Security Groups.",
        ],
        ["AWS", "Azure", "GCP", "CIS", "Prowler"],
        [
          l("shared-responsibility", "Le modèle de responsabilité partagée", "The shared responsibility model"),
          l("aws-security", "Sécuriser AWS : S3, CloudTrail, GuardDuty", "Securing AWS: S3, CloudTrail, GuardDuty"),
          l("network-security-groups", "Réseau cloud : VPC, Security Groups et NACL", "Cloud networking: VPC, Security Groups and NACLs"),
          l("azure-security", "Sécuriser Azure", "Securing Azure"),
          l("gcp-security", "Sécuriser GCP", "Securing GCP"),
          l("cis-benchmarks-cspm", "CIS Benchmarks et CSPM : Prowler, ScoutSuite", "CIS Benchmarks and CSPM: Prowler, ScoutSuite"),
        ],
      ),
      course(
        "2.6",
        "kubernetes-security",
        "advanced",
        ["Sécurité Kubernetes", "Kubernetes Security"],
        [
          "Pod Security, NetworkPolicy, RBAC, Secrets et contrôle d'admission.",
          "Pod Security, NetworkPolicy, RBAC, Secrets and admission control.",
        ],
        ["Kubernetes", "RBAC", "NetworkPolicy", "Kyverno", "Falco"],
        [
          l("threat-model", "Modèle de menace et les 4C", "Threat model and the 4Cs"),
          l("pod-security", "Pod Security Standards et securityContext", "Pod Security Standards and securityContext"),
          l("network-policies", "NetworkPolicy : cloisonner le réseau", "NetworkPolicy: segmenting the network"),
          l("rbac", "RBAC Kubernetes", "Kubernetes RBAC"),
          l("secrets", "Secrets Kubernetes : chiffrement et coffres externes", "Kubernetes Secrets: encryption and external vaults"),
          l("admission-and-runtime", "Contrôle d'admission et détection à l'exécution", "Admission control and runtime detection"),
        ],
      ),
      course(
        "2.7",
        "docker-security",
        "intermediate",
        ["Sécurité Docker", "Docker Security"],
        [
          "Dockerfile sécurisé, scan d'images, utilisateur non-root et images distroless.",
          "Secure Dockerfile, image scanning, non-root user and distroless images.",
        ],
        ["Docker", "Trivy", "Distroless", "Cosign"],
        [
          l("container-isolation", "Isolation des conteneurs et menaces", "Container isolation and threats"),
          l("secure-dockerfile", "Écrire un Dockerfile sécurisé", "Writing a secure Dockerfile"),
          l("non-root-capabilities", "Utilisateur non-root et capabilities", "Non-root user and capabilities"),
          l("image-scanning", "Scanner les images : Trivy et Grype", "Scanning images: Trivy and Grype"),
          l("distroless-multistage", "Multi-stage et images distroless", "Multi-stage builds and distroless images"),
          l("runtime-and-signing", "Sécurité à l'exécution et signature d'images", "Runtime security and image signing"),
        ],
      ),
    ],
  },

  /* ================================================================ */
  /* MODULE 3 - APPSEC                                                 */
  /* ================================================================ */
  {
    id: 3,
    slug: "application-security",
    icon: "appsec",
    level: "intermediate",
    title: { fr: "Sécurité des applications (AppSec)", en: "Application Security (AppSec)" },
    description: {
      fr: "OWASP Top 10, failles web, authentification, chiffrement et sécurité des API - code vulnérable vs code corrigé.",
      en: "OWASP Top 10, web flaws, authentication, encryption and API security - vulnerable vs fixed code.",
    },
    courses: [
      course(
        "3.1",
        "owasp-top-10",
        "intermediate",
        ["OWASP Top 10", "OWASP Top 10"],
        [
          "Chaque faille expliquée avec un exemple vulnérable et sa correction.",
          "Every flaw explained with a vulnerable example and its fix.",
        ],
        ["OWASP", "AppSec", "Top 10"],
        [
          l("introduction", "Comprendre l'OWASP Top 10 et son évolution", "Understanding the OWASP Top 10 and its evolution"),
          l("a01-broken-access-control", "A01 - Contrôle d'accès défaillant", "A01 - Broken Access Control"),
          l("a02-cryptographic-failures", "A02 - Défaillances cryptographiques", "A02 - Cryptographic Failures"),
          l("a03-injection", "A03 - Injection", "A03 - Injection"),
          l("a04-insecure-design", "A04 - Conception non sécurisée", "A04 - Insecure Design"),
          l("a05-security-misconfiguration", "A05 - Mauvaise configuration de sécurité", "A05 - Security Misconfiguration"),
          l("a06-vulnerable-components", "A06 - Composants vulnérables et obsolètes", "A06 - Vulnerable and Outdated Components"),
          l("a07-authentication-failures", "A07 - Identification et authentification défaillantes", "A07 - Identification and Authentication Failures"),
          l("a08-integrity-failures", "A08 - Manque d'intégrité des données et du logiciel", "A08 - Software and Data Integrity Failures"),
          l("a09-logging-monitoring-failures", "A09 - Journalisation et surveillance insuffisantes", "A09 - Security Logging and Monitoring Failures"),
          l("a10-ssrf", "A10 - Falsification de requête côté serveur (SSRF)", "A10 - Server-Side Request Forgery (SSRF)"),
        ],
      ),
      course(
        "3.2",
        "web-vulnerabilities",
        "intermediate",
        ["Failles web : vulnérable vs corrigé", "Web Flaws: Vulnerable vs Fixed"],
        [
          "Injection SQL, XSS, CSRF, SSRF, Broken Auth en Python, Node.js, PHP et Java.",
          "SQL injection, XSS, CSRF, SSRF, Broken Auth in Python, Node.js, PHP and Java.",
        ],
        ["SQLi", "XSS", "CSRF", "SSRF"],
        [
          l("sql-injection", "Injection SQL dans 4 langages", "SQL injection in 4 languages"),
          l("xss", "Cross-Site Scripting (XSS)", "Cross-Site Scripting (XSS)"),
          l("csrf", "Cross-Site Request Forgery (CSRF)", "Cross-Site Request Forgery (CSRF)"),
          l("ssrf", "Server-Side Request Forgery (SSRF)", "Server-Side Request Forgery (SSRF)"),
          l("broken-authentication", "Authentification défaillante", "Broken authentication"),
          l("command-injection-path-traversal", "Injection de commandes et path traversal", "Command injection and path traversal"),
        ],
      ),
      course(
        "3.3",
        "authentication-authorization",
        "intermediate",
        ["Authentification & Autorisation", "Authentication & Authorization"],
        [
          "Sessions, Bcrypt, Argon2, JWT, OAuth2 et contrôle d'accès.",
          "Sessions, Bcrypt, Argon2, JWT, OAuth2 and access control.",
        ],
        ["JWT", "OAuth2", "Bcrypt", "Argon2", "Session"],
        [
          l("sessions-and-cookies", "Sessions et cookies sécurisés", "Secure sessions and cookies"),
          l("password-hashing", "Hacher les mots de passe : Bcrypt et Argon2", "Hashing passwords: Bcrypt and Argon2"),
          l("jwt", "JWT : fonctionnement et pièges", "JWT: how it works and its pitfalls"),
          l("oauth2-oidc", "OAuth2 et OpenID Connect", "OAuth2 and OpenID Connect"),
          l("mfa-totp", "MFA et TOTP", "MFA and TOTP"),
          l("authorization-patterns", "Autorisation : RBAC, ABAC et vérifications côté serveur", "Authorization: RBAC, ABAC and server-side checks"),
        ],
      ),
      course(
        "3.4",
        "encryption",
        "intermediate",
        ["Chiffrement", "Encryption"],
        [
          "TLS/SSL, AES, hachage et certificats Let's Encrypt.",
          "TLS/SSL, AES, hashing and Let's Encrypt certificates.",
        ],
        ["TLS", "AES", "SHA-256", "Let's Encrypt"],
        [
          l("fundamentals", "Chiffrement symétrique et asymétrique", "Symmetric and asymmetric encryption"),
          l("hashing-hmac", "Hachage et HMAC", "Hashing and HMAC"),
          l("aes-in-practice", "AES en pratique", "AES in practice"),
          l("tls-ssl", "TLS/SSL expliqué", "TLS/SSL explained"),
          l("certificates-lets-encrypt", "Certificats et Let's Encrypt", "Certificates and Let's Encrypt"),
          l("key-management", "Gestion des clés, KMS et mTLS", "Key management, KMS and mTLS"),
        ],
      ),
      course(
        "3.5",
        "api-security",
        "intermediate",
        ["Sécurité des API", "API Security"],
        [
          "Rate limiting, validation, authentification et API Gateway.",
          "Rate limiting, validation, authentication and API gateways.",
        ],
        ["API", "Rate Limiting", "OpenAPI", "API Gateway"],
        [
          l("owasp-api-top-10", "OWASP API Security Top 10", "OWASP API Security Top 10"),
          l("api-authentication", "Authentifier une API : clés, OAuth2, mTLS", "Authenticating an API: keys, OAuth2, mTLS"),
          l("rate-limiting", "Rate limiting et quotas", "Rate limiting and quotas"),
          l("input-validation", "Validation des entrées et schémas OpenAPI", "Input validation and OpenAPI schemas"),
          l("api-gateway", "API Gateway : Kong, NGINX, AWS", "API gateways: Kong, NGINX, AWS"),
        ],
      ),
    ],
  },

  /* ================================================================ */
  /* MODULE 4 - CI/CD SÉCURISÉ                                         */
  /* ================================================================ */
  {
    id: 4,
    slug: "secure-cicd",
    icon: "cicd",
    level: "intermediate",
    title: { fr: "CI/CD sécurisé", en: "Secure CI/CD" },
    description: {
      fr: "Le cœur du DevSecOps : Git, pipelines, SAST, DAST, SCA et scan de conteneurs.",
      en: "The heart of DevSecOps: Git, pipelines, SAST, DAST, SCA and container scanning.",
    },
    courses: [
      course(
        "4.1",
        "secure-git",
        "beginner",
        ["Git sécurisé", "Secure Git"],
        [
          ".gitignore, Gitleaks, hooks pre-commit et commits signés.",
          ".gitignore, Gitleaks, pre-commit hooks and signed commits.",
        ],
        ["Git", "Gitleaks", "pre-commit", "GPG"],
        [
          l("gitignore-and-secrets", ".gitignore et secrets hors du dépôt", ".gitignore and keeping secrets out of the repo"),
          l("gitleaks", "Détecter les secrets avec Gitleaks", "Detecting secrets with Gitleaks"),
          l("pre-commit-hooks", "Hooks pre-commit", "Pre-commit hooks"),
          l("signed-commits", "Commits signés : GPG et SSH", "Signed commits: GPG and SSH"),
          l("branch-protection-history", "Protection de branches et nettoyage de l'historique", "Branch protection and history cleanup"),
        ],
      ),
      course(
        "4.2",
        "github-actions-security",
        "intermediate",
        ["GitHub Actions sécurisé", "Secure GitHub Actions"],
        [
          "Un workflow complet avec SAST, DAST, scan de secrets et durcissement.",
          "A complete workflow with SAST, DAST, secret scanning and hardening.",
        ],
        ["GitHub Actions", "OIDC", "CodeQL"],
        [
          l("workflow-basics", "Bases des workflows", "Workflow basics"),
          l("secrets-and-permissions", "Secrets, permissions et OIDC", "Secrets, permissions and OIDC"),
          l("sast-job", "Ajouter le SAST au workflow", "Adding SAST to the workflow"),
          l("secrets-sca-jobs", "Scan de secrets et de dépendances", "Secret and dependency scanning"),
          l("dast-container-jobs", "DAST et scan de conteneurs", "DAST and container scanning"),
          l("hardening-complete-pipeline", "Durcissement et pipeline complet", "Hardening and the complete pipeline"),
        ],
      ),
      course(
        "4.3",
        "gitlab-ci-security",
        "intermediate",
        ["GitLab CI sécurisé", "Secure GitLab CI"],
        [
          "Pipelines GitLab, templates de sécurité, variables protégées et runners.",
          "GitLab pipelines, security templates, protected variables and runners.",
        ],
        ["GitLab CI", "Runners", "SAST"],
        [
          l("pipeline-basics", "Bases de .gitlab-ci.yml", ".gitlab-ci.yml basics"),
          l("security-templates", "Templates de sécurité intégrés", "Built-in security templates"),
          l("variables-and-secrets", "Variables protégées et secrets", "Protected variables and secrets"),
          l("runner-security", "Sécuriser les runners", "Securing runners"),
          l("complete-pipeline", "Pipeline GitLab complet et sécurisé", "A complete, secure GitLab pipeline"),
        ],
      ),
      course(
        "4.4",
        "jenkins-security",
        "intermediate",
        ["Jenkins sécurisé", "Secure Jenkins"],
        [
          "Jenkinsfile, durcissement du contrôleur, credentials et étapes de sécurité.",
          "Jenkinsfile, controller hardening, credentials and security stages.",
        ],
        ["Jenkins", "Jenkinsfile", "JCasC"],
        [
          l("jenkinsfile-basics", "Bases du Jenkinsfile déclaratif", "Declarative Jenkinsfile basics"),
          l("hardening-jenkins", "Durcir Jenkins : authentification, autorisations, agents", "Hardening Jenkins: authentication, authorization, agents"),
          l("credentials", "Gérer les credentials", "Managing credentials"),
          l("security-stages", "Étapes de sécurité dans le pipeline", "Security stages in the pipeline"),
          l("jcasc-shared-libraries", "Configuration as Code et shared libraries", "Configuration as Code and shared libraries"),
        ],
      ),
      course(
        "4.5",
        "sast",
        "intermediate",
        ["SAST : analyse statique", "SAST: Static Analysis"],
        [
          "SonarQube, Semgrep et CodeQL avec exemples de configuration.",
          "SonarQube, Semgrep and CodeQL with configuration examples.",
        ],
        ["SAST", "Semgrep", "SonarQube", "CodeQL"],
        [
          l("introduction", "Qu'est-ce que le SAST ?", "What is SAST?"),
          l("semgrep", "Semgrep et règles personnalisées", "Semgrep and custom rules"),
          l("sonarqube", "SonarQube et Quality Gates", "SonarQube and Quality Gates"),
          l("codeql", "CodeQL", "CodeQL"),
          l("triage-and-ci", "Trier les résultats et intégrer en CI", "Triaging findings and integrating in CI"),
        ],
      ),
      course(
        "4.6",
        "dast",
        "intermediate",
        ["DAST : analyse dynamique", "DAST: Dynamic Analysis"],
        [
          "OWASP ZAP et Nikto pour tester une application en fonctionnement.",
          "OWASP ZAP and Nikto to test a running application.",
        ],
        ["DAST", "OWASP ZAP", "Nikto"],
        [
          l("introduction", "Qu'est-ce que le DAST ?", "What is DAST?"),
          l("zap-baseline", "ZAP : scan baseline", "ZAP: baseline scan"),
          l("zap-full-api-scan", "ZAP : scan complet, API et Automation Framework", "ZAP: full scan, API scan and the Automation Framework"),
          l("nikto-nuclei", "Nikto et Nuclei", "Nikto and Nuclei"),
          l("dast-in-ci", "DAST en CI et rapports", "DAST in CI and reporting"),
        ],
      ),
      course(
        "4.7",
        "sca-dependency-scanning",
        "intermediate",
        ["SCA : scan de dépendances", "SCA: Dependency Scanning"],
        [
          "Snyk, Trivy, Dependabot, npm audit et SBOM.",
          "Snyk, Trivy, Dependabot, npm audit and SBOMs.",
        ],
        ["SCA", "Snyk", "Dependabot", "SBOM"],
        [
          l("introduction", "SCA et chaîne d'approvisionnement logicielle", "SCA and the software supply chain"),
          l("npm-audit-pip-audit", "npm audit et pip-audit", "npm audit and pip-audit"),
          l("snyk", "Snyk", "Snyk"),
          l("trivy-dependabot", "Trivy, Dependabot et Renovate", "Trivy, Dependabot and Renovate"),
          l("sbom", "SBOM : CycloneDX, Syft et licences", "SBOM: CycloneDX, Syft and licenses"),
        ],
      ),
      course(
        "4.8",
        "container-iac-scanning",
        "intermediate",
        ["Scan de conteneurs & IaC", "Container & IaC Scanning"],
        [
          "Trivy, Checkov, tfsec et kube-bench.",
          "Trivy, Checkov, tfsec and kube-bench.",
        ],
        ["Trivy", "Checkov", "tfsec", "kube-bench"],
        [
          l("trivy-images", "Trivy : scanner les images", "Trivy: scanning images"),
          l("checkov", "Checkov", "Checkov"),
          l("tfsec-trivy-config", "tfsec et Trivy config", "tfsec and Trivy config"),
          l("kube-bench", "kube-bench et Kubescape", "kube-bench and Kubescape"),
          l("policy-gates", "Portes de sécurité dans le pipeline", "Security gates in the pipeline"),
        ],
      ),
    ],
  },

  /* ================================================================ */
  /* MODULE 5 - IAC & AUTOMATION                                       */
  /* ================================================================ */
  {
    id: 5,
    slug: "iac-automation",
    icon: "iac",
    level: "intermediate",
    title: { fr: "Infrastructure as Code & Automation", en: "Infrastructure as Code & Automation" },
    description: {
      fr: "Terraform, Ansible, Docker, Kubernetes et supervision : construire et exploiter en toute sécurité.",
      en: "Terraform, Ansible, Docker, Kubernetes and monitoring: build and operate securely.",
    },
    courses: [
      course(
        "5.1",
        "terraform",
        "intermediate",
        ["Terraform complet", "Complete Terraform"],
        [
          "De débutant à avancé : modules, state et backend sécurisé.",
          "From beginner to advanced: modules, state and a secure backend.",
        ],
        ["Terraform", "AWS", "State", "Modules"],
        [
          l("getting-started", "Installer Terraform et créer sa première ressource", "Installing Terraform and creating your first resource"),
          l("providers-and-state", "Providers et state", "Providers and state"),
          l("variables-outputs", "Variables, outputs et tfvars", "Variables, outputs and tfvars"),
          l("modules", "Modules réutilisables", "Reusable modules"),
          l("secure-remote-backend", "Backend distant sécurisé", "A secure remote backend"),
          l("environments", "Gérer plusieurs environnements", "Managing multiple environments"),
          l("security", "Sécurité : secrets, OIDC et scan", "Security: secrets, OIDC and scanning"),
          l("advanced-workflows", "Avancé : import, moved, tests et CI/CD", "Advanced: import, moved, tests and CI/CD"),
        ],
      ),
      course(
        "5.2",
        "ansible",
        "intermediate",
        ["Ansible", "Ansible"],
        [
          "Playbooks de durcissement et automatisation de configuration.",
          "Hardening playbooks and configuration automation.",
        ],
        ["Ansible", "Playbooks", "Vault", "Roles"],
        [
          l("inventory-adhoc", "Inventaire et commandes ad hoc", "Inventory and ad-hoc commands"),
          l("playbooks", "Écrire des playbooks", "Writing playbooks"),
          l("roles-galaxy", "Rôles et Ansible Galaxy", "Roles and Ansible Galaxy"),
          l("ansible-vault", "Ansible Vault", "Ansible Vault"),
          l("hardening-playbook", "Playbook de durcissement : SSH, UFW, auditd", "Hardening playbook: SSH, UFW, auditd"),
          l("testing-and-ci", "ansible-lint, Molecule et CI", "ansible-lint, Molecule and CI"),
        ],
      ),
      course(
        "5.3",
        "docker",
        "beginner",
        ["Docker & Docker Compose", "Docker & Docker Compose"],
        [
          "De A à Z avec des exemples sécurisés.",
          "From A to Z with secure examples.",
        ],
        ["Docker", "Compose", "Dockerfile", "Registry"],
        [
          l("containers-basics", "Conteneurs : concepts et premières commandes", "Containers: concepts and first commands"),
          l("images-dockerfile", "Images et Dockerfile", "Images and Dockerfile"),
          l("volumes-networks", "Volumes et réseaux", "Volumes and networks"),
          l("docker-compose", "Docker Compose", "Docker Compose"),
          l("multistage-optimization", "Builds multi-stage et optimisation", "Multi-stage builds and optimization"),
          l("registry-and-ci", "Registres et build en CI", "Registries and CI builds"),
          l("production-stack", "Stack Compose prête pour la production", "A production-ready Compose stack"),
        ],
      ),
      course(
        "5.4",
        "kubernetes",
        "intermediate",
        ["Kubernetes complet", "Complete Kubernetes"],
        [
          "Pods, Deployments, Services, Ingress et Helm.",
          "Pods, Deployments, Services, Ingress and Helm.",
        ],
        ["Kubernetes", "kubectl", "Helm", "Ingress"],
        [
          l("architecture", "Architecture d'un cluster", "Cluster architecture"),
          l("pods", "Pods", "Pods"),
          l("deployments", "Deployments et mises à jour progressives", "Deployments and rolling updates"),
          l("services", "Services", "Services"),
          l("ingress-tls", "Ingress et TLS", "Ingress and TLS"),
          l("configmaps-secrets", "ConfigMaps et Secrets", "ConfigMaps and Secrets"),
          l("helm", "Helm", "Helm"),
          l("storage-troubleshooting", "Stockage, StatefulSets et dépannage", "Storage, StatefulSets and troubleshooting"),
        ],
      ),
      course(
        "5.5",
        "monitoring-logging",
        "intermediate",
        ["Monitoring & Logging sécurisé", "Secure Monitoring & Logging"],
        [
          "Prometheus, Grafana, ELK, Loki et SIEM.",
          "Prometheus, Grafana, ELK, Loki and SIEM.",
        ],
        ["Prometheus", "Grafana", "ELK", "Loki", "SIEM"],
        [
          l("observability-pillars", "Les piliers de l'observabilité", "The pillars of observability"),
          l("prometheus", "Prometheus et Alertmanager", "Prometheus and Alertmanager"),
          l("grafana", "Grafana : tableaux de bord et alertes", "Grafana: dashboards and alerts"),
          l("elk-stack", "La stack ELK", "The ELK stack"),
          l("loki", "Loki et Promtail", "Loki and Promtail"),
          l("siem-detection", "SIEM et règles de détection", "SIEM and detection rules"),
        ],
      ),
    ],
  },

  /* ================================================================ */
  /* MODULE 6 - PROJETS PRATIQUES                                      */
  /* ================================================================ */
  {
    id: 6,
    slug: "projects",
    icon: "projects",
    level: "advanced",
    title: { fr: "Projets pratiques complets", en: "Complete Hands-on Projects" },
    description: {
      fr: "5 projets de portfolio avec code source complet et README.",
      en: "5 portfolio projects with complete source code and README.",
    },
    courses: [
      course(
        "6.1",
        "project-flask-pipeline",
        "intermediate",
        ["Projet 1 : Pipeline CI/CD 100 % sécurisé pour une API Flask", "Project 1: A 100% Secure CI/CD Pipeline for a Flask API"],
        [
          "Une API Python Flask, ses tests, son image Docker et un pipeline avec SAST, SCA, secrets et DAST.",
          "A Python Flask API, its tests, its Docker image and a pipeline with SAST, SCA, secrets and DAST.",
        ],
        ["Flask", "GitHub Actions", "Trivy", "ZAP"],
        [
          l("architecture-setup", "Architecture et mise en place du dépôt", "Architecture and repository setup"),
          l("flask-api", "L'API Flask sécurisée et ses tests", "The secure Flask API and its tests"),
          l("docker-image", "Image Docker durcie", "A hardened Docker image"),
          l("security-pipeline", "Le pipeline : SAST, SCA, secrets, image, DAST", "The pipeline: SAST, SCA, secrets, image, DAST"),
          l("readme-and-delivery", "README, badges et livraison", "README, badges and delivery"),
        ],
      ),
      course(
        "6.2",
        "project-aws-terraform-nodejs",
        "advanced",
        ["Projet 2 : App Node.js sur AWS avec Terraform + GitHub Actions", "Project 2: Node.js App on AWS with Terraform + GitHub Actions"],
        [
          "Infrastructure AWS en Terraform, déploiement continu sans clés statiques grâce à OIDC.",
          "AWS infrastructure in Terraform, continuous deployment without static keys thanks to OIDC.",
        ],
        ["AWS", "Terraform", "Node.js", "OIDC"],
        [
          l("architecture-setup", "Architecture cible et prérequis", "Target architecture and prerequisites"),
          l("nodejs-app", "L'application Node.js et son conteneur", "The Node.js app and its container"),
          l("terraform-infrastructure", "Infrastructure Terraform : réseau, ECR, ECS", "Terraform infrastructure: network, ECR, ECS"),
          l("oidc-deploy-pipeline", "Pipeline de déploiement avec OIDC", "Deployment pipeline with OIDC"),
          l("readme-and-cleanup", "README, coûts et nettoyage", "README, costs and cleanup"),
        ],
      ),
      course(
        "6.3",
        "project-k8s-opa-falco",
        "advanced",
        ["Projet 3 : Cluster Kubernetes durci avec OPA + Falco", "Project 3: Hardened Kubernetes Cluster with OPA + Falco"],
        [
          "Un cluster local durci : politiques Gatekeeper, NetworkPolicy, RBAC et détection Falco.",
          "A hardened local cluster: Gatekeeper policies, NetworkPolicy, RBAC and Falco detection.",
        ],
        ["Kubernetes", "OPA", "Gatekeeper", "Falco"],
        [
          l("cluster-setup", "Créer le cluster et la base de sécurité", "Creating the cluster and the security baseline"),
          l("workload-hardening", "Durcir les workloads : RBAC, NetworkPolicy, securityContext", "Hardening workloads: RBAC, NetworkPolicy, securityContext"),
          l("gatekeeper-policies", "Politiques OPA Gatekeeper", "OPA Gatekeeper policies"),
          l("falco-runtime", "Détection à l'exécution avec Falco", "Runtime detection with Falco"),
          l("readme-and-validation", "README et validation par des attaques simulées", "README and validation with simulated attacks"),
        ],
      ),
      course(
        "6.4",
        "project-python-vuln-scanner",
        "intermediate",
        ["Projet 4 : Scanner de vulnérabilités en Python", "Project 4: A Vulnerability Scanner in Python"],
        [
          "Un outil CLI : scan de ports, bannières, en-têtes HTTP, TLS et rapport.",
          "A CLI tool: port scanning, banners, HTTP headers, TLS and reporting.",
        ],
        ["Python", "CLI", "Sockets", "Reporting"],
        [
          l("design-setup", "Conception et structure du projet", "Design and project structure"),
          l("port-banner-scanner", "Scan de ports et de bannières", "Port and banner scanning"),
          l("http-tls-checks", "Vérifications HTTP et TLS", "HTTP and TLS checks"),
          l("reporting-cli", "CLI et rapports JSON / HTML", "CLI and JSON / HTML reports"),
          l("readme-tests-packaging", "README, tests et packaging", "README, tests and packaging"),
        ],
      ),
      course(
        "6.5",
        "project-homelab-wazuh",
        "advanced",
        ["Projet 5 : Homelab DevSecOps avec Docker + Wazuh SIEM", "Project 5: DevSecOps Homelab with Docker + Wazuh SIEM"],
        [
          "Un laboratoire complet : Wazuh, agents, application vulnérable, détection et réponse.",
          "A complete lab: Wazuh, agents, a vulnerable app, detection and response.",
        ],
        ["Wazuh", "SIEM", "Docker", "Homelab"],
        [
          l("lab-architecture", "Architecture du homelab", "Homelab architecture"),
          l("wazuh-deployment", "Déployer Wazuh avec Docker Compose", "Deploying Wazuh with Docker Compose"),
          l("agents-and-targets", "Agents et machines cibles", "Agents and target machines"),
          l("detection-rules-response", "Règles de détection et réponse active", "Detection rules and active response"),
          l("readme-and-scenarios", "README et scénarios d'attaque", "README and attack scenarios"),
        ],
      ),
    ],
  },

  /* ================================================================ */
  /* MODULE 7 - CARRIÈRE & CERTIFICATIONS                              */
  /* ================================================================ */
  {
    id: 7,
    slug: "career",
    icon: "career",
    level: "beginner",
    title: { fr: "Carrière & Certifications", en: "Career & Certifications" },
    description: {
      fr: "CV, entretiens, certifications et salaires à Madagascar, en France et en remote.",
      en: "Résumé, interviews, certifications and salaries in Madagascar, France and remote.",
    },
    courses: [
      course(
        "7.1",
        "cv-portfolio",
        "beginner",
        ["CV, lettre de motivation et portfolio", "Résumé, Cover Letter and Portfolio"],
        [
          "Un CV DevSecOps efficace, une lettre ciblée et un portfolio GitHub qui prouve vos compétences.",
          "An effective DevSecOps résumé, a targeted cover letter and a GitHub portfolio that proves your skills.",
        ],
        ["CV", "Portfolio", "GitHub", "LinkedIn"],
        [
          l("cv-structure", "Structure d'un CV DevSecOps", "Structure of a DevSecOps résumé"),
          l("ats-keywords", "Mots-clés, ATS et réalisations chiffrées", "Keywords, ATS and quantified achievements"),
          l("cover-letter", "Lettre de motivation", "Cover letter"),
          l("github-portfolio", "Portfolio GitHub", "GitHub portfolio"),
          l("linkedin-branding", "LinkedIn et visibilité", "LinkedIn and visibility"),
        ],
      ),
      course(
        "7.2",
        "interview-prep",
        "intermediate",
        ["Préparation aux entretiens : 100 questions / réponses", "Interview Prep: 100 Questions & Answers"],
        [
          "100 questions DevSecOps avec réponses modèles, classées par thème.",
          "100 DevSecOps questions with model answers, grouped by topic.",
        ],
        ["Entretien", "Questions", "Interview"],
        [
          l("fundamentals-culture", "Questions 1-20 : fondamentaux et culture", "Questions 1-20: fundamentals and culture"),
          l("linux-network-cloud", "Questions 21-40 : Linux, réseau et cloud", "Questions 21-40: Linux, networking and cloud"),
          l("cicd-iac", "Questions 41-60 : CI/CD et IaC", "Questions 41-60: CI/CD and IaC"),
          l("containers-kubernetes", "Questions 61-80 : conteneurs et Kubernetes", "Questions 61-80: containers and Kubernetes"),
          l("appsec-behavioral", "Questions 81-100 : AppSec, incidents et comportemental", "Questions 81-100: AppSec, incidents and behavioral"),
        ],
      ),
      course(
        "7.3",
        "certifications",
        "beginner",
        ["Certifications", "Certifications"],
        [
          "Security+, SC-900, AZ-500, CKA, Terraform Associate, CISSP : une roadmap par certification.",
          "Security+, SC-900, AZ-500, CKA, Terraform Associate, CISSP: a roadmap for each certification.",
        ],
        ["Security+", "AZ-500", "CKA", "CISSP"],
        [
          l("overview", "Quelle certification, dans quel ordre ?", "Which certification, in which order?"),
          l("comptia-security-plus", "CompTIA Security+", "CompTIA Security+"),
          l("sc-900-az-500", "Microsoft SC-900 et AZ-500", "Microsoft SC-900 and AZ-500"),
          l("cka", "CKA et CKS", "CKA and CKS"),
          l("terraform-associate", "HashiCorp Terraform Associate", "HashiCorp Terraform Associate"),
          l("cissp", "CISSP", "CISSP"),
        ],
      ),
      course(
        "7.4",
        "salaries",
        "beginner",
        ["Salaires : Madagascar, France, Remote", "Salaries: Madagascar, France, Remote"],
        [
          "Ordres de grandeur, facteurs qui font varier la rémunération et négociation.",
          "Orders of magnitude, what drives compensation and how to negotiate.",
        ],
        ["Salaire", "Remote", "Freelance", "Négociation"],
        [
          l("madagascar", "Le marché à Madagascar", "The market in Madagascar"),
          l("france", "Le marché en France", "The market in France"),
          l("remote-freelance", "Remote et freelance à l'international", "Remote work and international freelancing"),
          l("negotiation", "Négocier sa rémunération", "Negotiating your compensation"),
          l("career-paths", "Évolutions de carrière", "Career paths"),
        ],
      ),
    ],
  },

  /* ================================================================ */
  /* MODULE 8 - HACKING ÉTHIQUE : OFFENSIF & DÉFENSIF                  */
  /* ================================================================ */
  {
    id: 8,
    slug: "ethical-hacking",
    icon: "offensive",
    level: "advanced",
    title: { fr: "Hacking éthique : offensif & défensif", en: "Ethical Hacking: Offensive & Defensive" },
    description: {
      fr: "Comprendre les attaques pour mieux défendre : Wi-Fi, web, serveurs, logiciels, applications, comptes et infrastructure. Attaque en laboratoire autorisé, puis défense, pour chaque sujet.",
      en: "Understand attacks to defend better: Wi-Fi, web, servers, software, apps, accounts and infrastructure. Attack in an authorised lab, then defend, for every topic.",
    },
    courses: [
      course(
        "8.1",
        "ethical-hacking-foundations",
        "intermediate",
        ["Fondations du hacking éthique", "Ethical Hacking Foundations"],
        [
          "Cadre légal, autorisation, méthodologie, montage d'un laboratoire isolé et boîte à outils.",
          "Legal framework, authorisation, methodology, building an isolated lab and the toolbox.",
        ],
        ["Kali", "Lab", "Méthodologie", "Legal"],
        [
          l("ethics-and-law", "Éthique, loi et autorisation écrite", "Ethics, law and written authorisation"),
          l("methodology", "Méthodologie : les phases d'un test d'intrusion", "Methodology: the phases of a penetration test"),
          l("build-a-lab", "Monter un laboratoire isolé (VM, réseau host-only)", "Building an isolated lab (VMs, host-only network)"),
          l("kali-toolbox", "Kali Linux et la boîte à outils", "Kali Linux and the toolbox"),
          l("reporting", "Rédiger un rapport de pentest", "Writing a pentest report"),
        ],
      ),
      course(
        "8.2",
        "recon-scanning",
        "intermediate",
        ["Reconnaissance & scanning", "Reconnaissance & Scanning"],
        [
          "OSINT, découverte d'hôtes, scan de ports et énumération de services - sur des cibles autorisées.",
          "OSINT, host discovery, port scanning and service enumeration - against authorised targets only.",
        ],
        ["OSINT", "Nmap", "Enumeration", "Recon"],
        [
          l("passive-osint", "Reconnaissance passive et OSINT", "Passive reconnaissance and OSINT"),
          l("host-discovery", "Découverte d'hôtes et de ports avec Nmap", "Host and port discovery with Nmap"),
          l("service-enumeration", "Énumération de services et de versions", "Service and version enumeration"),
          l("web-enumeration", "Énumération web : répertoires, vhosts, technologies", "Web enumeration: directories, vhosts, technologies"),
          l("defense-attack-surface", "Défense : réduire sa surface d'exposition", "Defense: reducing your exposed attack surface"),
        ],
      ),
      course(
        "8.3",
        "wifi-security",
        "advanced",
        ["Sécurité Wi-Fi : attaque & protection", "Wi-Fi Security: Attack & Protection"],
        [
          "Comment fonctionne le chiffrement Wi-Fi, test de robustesse de SA PROPRE box, et durcissement.",
          "How Wi-Fi encryption works, testing the strength of YOUR OWN access point, and hardening it.",
        ],
        ["WPA2", "WPA3", "aircrack-ng", "hashcat"],
        [
          l("how-wifi-works", "Wi-Fi, WEP, WPA2 et WPA3 expliqués", "Wi-Fi, WEP, WPA2 and WPA3 explained"),
          l("monitor-and-capture", "Mode moniteur et capture du handshake (votre box)", "Monitor mode and handshake capture (your own AP)"),
          l("cracking-your-own", "Tester la robustesse du mot de passe avec hashcat", "Testing password strength with hashcat"),
          l("evil-twin-theory", "Evil twin et attaques client : comprendre la menace", "Evil twin and client attacks: understanding the threat"),
          l("protect-wifi", "Protéger son Wi-Fi : WPA3, 802.1X, segmentation", "Protecting your Wi-Fi: WPA3, 802.1X, segmentation"),
        ],
      ),
      course(
        "8.4",
        "web-exploitation",
        "advanced",
        ["Piratage de site web : attaque & protection", "Website Hacking: Attack & Protection"],
        [
          "Exploiter une application vulnérable de laboratoire (DVWA, Juice Shop) avec Burp, puis corriger.",
          "Exploiting a vulnerable lab application (DVWA, Juice Shop) with Burp, then fixing it.",
        ],
        ["Burp Suite", "DVWA", "Juice Shop", "OWASP"],
        [
          l("lab-and-burp", "Le lab web et Burp Suite", "The web lab and Burp Suite"),
          l("exploiting-injection", "Exploiter injection SQL et XSS en pratique", "Exploiting SQL injection and XSS in practice"),
          l("auth-access-bypass", "Contourner authentification et contrôle d'accès", "Bypassing authentication and access control"),
          l("file-upload-rce", "Upload de fichiers, LFI et exécution de code", "File upload, LFI and code execution"),
          l("protect-website", "Protéger un site web : défenses en couches", "Protecting a website: layered defenses"),
        ],
      ),
      course(
        "8.5",
        "server-exploitation",
        "advanced",
        ["Piratage de serveur : attaque & protection", "Server Hacking: Attack & Protection"],
        [
          "Exploitation et élévation de privilèges sur un serveur de laboratoire, puis durcissement.",
          "Exploitation and privilege escalation on a lab server, then hardening.",
        ],
        ["Metasploit", "Privesc", "Linux", "Hardening"],
        [
          l("exploitation-basics", "Exploitation : des services vulnérables à l'accès", "Exploitation: from vulnerable services to access"),
          l("metasploit", "Metasploit sur une cible de laboratoire", "Metasploit against a lab target"),
          l("linux-privesc", "Élévation de privilèges Linux", "Linux privilege escalation"),
          l("windows-privesc", "Élévation de privilèges Windows", "Windows privilege escalation"),
          l("protect-server", "Protéger un serveur : durcissement et détection", "Protecting a server: hardening and detection"),
        ],
      ),
      course(
        "8.6",
        "password-account-security",
        "advanced",
        ["Sécurité des mots de passe & comptes", "Password & Account Security"],
        [
          "Comment les comptes sont compromis (hachages, bourrage, phishing) et comment protéger les siens.",
          "How accounts get compromised (hashes, stuffing, phishing) and how to protect your own.",
        ],
        ["hashcat", "John", "MFA", "Passkeys"],
        [
          l("how-passwords-break", "Hachages, John et hashcat sur vos propres hachages", "Hashes, John and hashcat on your own hashes"),
          l("credential-attacks", "Bourrage d'identifiants et pulvérisation : la menace", "Credential stuffing and spraying: the threat"),
          l("account-takeover", "Prise de contrôle de compte : vecteurs et scénarios", "Account takeover: vectors and scenarios"),
          l("protect-accounts", "Protéger ses comptes : MFA, passkeys, gestionnaire", "Protecting accounts: MFA, passkeys, password manager"),
          l("protect-users-platform", "Côté plateforme : défendre les comptes des utilisateurs", "Platform side: defending your users' accounts"),
        ],
      ),
      course(
        "8.7",
        "software-reverse-engineering",
        "advanced",
        ["Rétro-ingénierie de logiciel : attaque & protection", "Software Reverse Engineering: Attack & Protection"],
        [
          "Analyser un binaire que vous possédez (crackmes), comprendre le cracking, puis protéger son logiciel.",
          "Analysing a binary you own (crackmes), understanding cracking, then protecting your software.",
        ],
        ["Ghidra", "gdb", "CrackMe", "Anti-tamper"],
        [
          l("re-basics", "Bases : désassemblage, Ghidra et gdb", "Basics: disassembly, Ghidra and gdb"),
          l("crackme-walkthrough", "Résoudre un CrackMe pas à pas", "Solving a CrackMe step by step"),
          l("patching-keygen-theory", "Patching et licences : comprendre le cracking", "Patching and licensing: understanding cracking"),
          l("protect-software", "Protéger son logiciel : obfuscation, anti-tamper, licences", "Protecting your software: obfuscation, anti-tamper, licensing"),
        ],
      ),
      course(
        "8.8",
        "mobile-app-security",
        "advanced",
        ["Piratage d'application mobile : attaque & protection", "Mobile App Hacking: Attack & Protection"],
        [
          "Tester la sécurité d'une application Android que vous possédez (OWASP MASVS), puis la durcir.",
          "Testing the security of an Android app you own (OWASP MASVS), then hardening it.",
        ],
        ["Android", "MASVS", "Frida", "APK"],
        [
          l("android-internals", "Anatomie d'une APK et surface d'attaque", "Anatomy of an APK and its attack surface"),
          l("static-analysis", "Analyse statique : décompilation et secrets", "Static analysis: decompilation and secrets"),
          l("dynamic-analysis", "Analyse dynamique : trafic, Frida, stockage", "Dynamic analysis: traffic, Frida, storage"),
          l("protect-mobile-app", "Protéger son application mobile", "Protecting your mobile app"),
        ],
      ),
      course(
        "8.9",
        "social-engineering",
        "advanced",
        ["Ingénierie sociale & phishing : attaque & défense", "Social Engineering & Phishing: Attack & Defense"],
        [
          "Comment fonctionnent le phishing et la manipulation, simulation d'awareness autorisée, et défense.",
          "How phishing and manipulation work, authorised awareness simulation, and defense.",
        ],
        ["Phishing", "GoPhish", "Awareness", "OSINT"],
        [
          l("human-attack-surface", "La surface d'attaque humaine", "The human attack surface"),
          l("phishing-anatomy", "Anatomie d'une campagne de phishing", "Anatomy of a phishing campaign"),
          l("authorized-simulation", "Simulation autorisée avec GoPhish (sensibilisation)", "Authorised simulation with GoPhish (awareness)"),
          l("defense-awareness", "Défense : filtres, DMARC, sensibilisation, culture", "Defense: filtering, DMARC, awareness, culture"),
        ],
      ),
      course(
        "8.10",
        "infrastructure-defense",
        "advanced",
        ["Protéger l'infrastructure : Blue Team", "Protecting Infrastructure: Blue Team"],
        [
          "La synthèse défensive : détection, durcissement global, chasse aux menaces et réponse à incident.",
          "The defensive synthesis: detection, overall hardening, threat hunting and incident response.",
        ],
        ["Blue Team", "SIEM", "Detection", "IR"],
        [
          l("defense-in-depth", "Défense en profondeur de l'infrastructure", "Defense in depth of the infrastructure"),
          l("detection-engineering", "Détection : logs, SIEM, règles et MITRE ATT&CK", "Detection: logs, SIEM, rules and MITRE ATT&CK"),
          l("threat-hunting", "Chasse aux menaces", "Threat hunting"),
          l("incident-response", "Réponse à incident pas à pas", "Incident response step by step"),
          l("purple-team", "Purple team : rejouer les attaques du module", "Purple team: replaying the module's attacks"),
        ],
      ),
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const allCourses: Course[] = modules.flatMap((m) => m.courses);

export const totalLessons: number = allCourses.reduce((n, c) => n + c.lessons.length, 0);

export function getModule(slug: string): Module | undefined {
  return modules.find((m) => m.slug === slug);
}

export function getCourse(slug: string): Course | undefined {
  return allCourses.find((c) => c.slug === slug);
}

export function getModuleOfCourse(courseSlug: string): Module | undefined {
  return modules.find((m) => m.courses.some((c) => c.slug === courseSlug));
}

/** Identifier used in localStorage for the progress of a lesson. */
export function lessonKey(courseSlug: string, lessonSlug: string): string {
  return `${courseSlug}/${lessonSlug}`;
}

export interface LessonLocation {
  module: Module;
  course: Course;
  lesson: LessonRef;
  index: number;
}

/** Every lesson of the site, in reading order. */
export const lessonSequence: LessonLocation[] = modules.flatMap((module) =>
  module.courses.flatMap((course) =>
    course.lessons.map((lesson, index) => ({ module, course, lesson, index })),
  ),
);

export function getAdjacentLessons(courseSlug: string, lessonSlug: string) {
  const i = lessonSequence.findIndex(
    (x) => x.course.slug === courseSlug && x.lesson.slug === lessonSlug,
  );
  if (i === -1) return { previous: undefined, next: undefined };
  return { previous: lessonSequence[i - 1], next: lessonSequence[i + 1] };
}
