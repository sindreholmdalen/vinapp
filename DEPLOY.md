# VinApp — Deployment Guide
## GitHub → Coolify → Hetzner

**Kostnad: ~40 kr/mnd** (kun Hetzner VPS, Coolify er gratis)

---

## Steg 1: Kjør appen lokalt (første gang)

Åpne Terminal og kjør i `~/vinapp/`:

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
npm run build
php artisan serve
# Åpne http://localhost:8000
```

Alternativt med Docker:
```bash
docker-compose up
# Åpne http://localhost:8080
```

---

## Steg 2: Last opp til GitHub

### Opprett repo på GitHub
1. Gå til [github.com/new](https://github.com/new)
2. Navn: `vinapp` — velg **Privat**
3. Ikke huk av README/gitignore (vi har disse)

### Push koden

```bash
cd ~/vinapp
git init
git add .
git commit -m "Initial commit: VinApp"
git remote add origin https://github.com/YOUR_USERNAME/vinapp.git
git branch -M main
git push -u origin main
```

---

## Steg 3: Opprett Hetzner-server

1. Gå til [hetzner.com/cloud](https://www.hetzner.com/cloud) og opprett konto
2. Klikk **New Project** → navn: `vinapp`
3. Klikk **Add Server**:
   - **Location**: Falkenstein (EU, nærmest Norge)
   - **Image**: Ubuntu 22.04
   - **Type**: Shared CPU → **CX22** (2 vCPU, 4GB RAM) — €3.29/mnd
   - **SSH Key**: Legg til din SSH-nøkkel (anbefalt) eller bruk passord
4. Klikk **Create & Buy**

Notér IP-adressen til serveren (vises etter opprettelse, f.eks. `65.21.x.x`).

---

## Steg 4: Installer Coolify

SSH inn på serveren og kjør installasjonsskriptet:

```bash
ssh root@DIN-SERVER-IP

# Installer Coolify (e