#!/bin/bash
# ============================================================
# VinApp Setup Script
# Kjør dette scriptet for å sette opp prosjektet lokalt
# ============================================================

set -e

echo "🍷 VinApp - Setter opp prosjektet..."
echo ""

# ---- 1. Sjekk forutsetninger ----
echo "1/7  Sjekker forutsetninger..."

command -v php >/dev/null 2>&1 || { echo "❌ PHP er ikke installert. Installer PHP 8.2+"; exit 1; }
command -v composer >/dev/null 2>&1 || { echo "❌ Composer er ikke installert. Installer Composer"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js er ikke installert. Installer Node 20+"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm er ikke installert"; exit 1; }

PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
echo "   PHP $PHP_VERSION, Node $(node -v), Composer $(composer --version --short 2>/dev/null || echo 'ok')"

# ---- 2. Installer PHP-avhengigheter ----
echo ""
echo "2/7  Installerer PHP-avhengigheter..."
composer install --no-interaction --prefer-dist

# ---- 3. Installer Breeze med React/Inertia ----
echo ""
echo "3/7  Konfigurerer Laravel Breeze med React..."
php artisan breeze:install react --no-interaction 2>/dev/null || true

# ---- 4. Installer npm-pakker ----
echo ""
echo "4/7  Installerer npm-pakker..."
npm install

# ---- 5. Sett opp miljø ----
echo ""
echo "5/7  Setter opp miljø..."

if [ ! -f .env ]; then
    cp .env.example .env
    php artisan key:generate
    echo "   .env opprettet og app-nøkkel generert"
fi

# SQLite database
DB_PATH="$(pwd)/database/database.sqlite"
touch "$DB_PATH"
# Oppdater .env med riktig database-sti
sed -i "s|DB_DATABASE=.*|DB_DATABASE=$DB_PATH|" .env
echo "   SQLite database opprettet: $DB_PATH"

# ---- 6. Kjør migrasjoner ----
echo ""
echo "6/7  Kjører database-migrasjoner..."
php artisan migrate --force

# ---- 7. Bygg frontend ----
echo ""
echo "7/7  Bygger frontend..."
npm run build

echo ""
echo "============================================================"
echo "  VinApp er klar!"
echo "============================================================"
echo ""
echo "  Start utviklingsserver:"
echo "    php artisan serve     (backend - http://localhost:8000)"
echo "    npm run dev           (frontend hot-reload)"
echo ""
echo "  Vinmonopolet API:"
echo "    1. Gå til https://api.vinmonopolet.no/produkter"
echo "    2. Registrer deg og få en API-nøkkel"
echo "    3. Legg nøkkelen i .env: VINMONOPOLET_API_KEY=din-nøkkel"
echo ""
echo "  Mobilapp:"
echo "    cd mobile && npm install && npx expo start"
echo ""
echo "  Deploy til DigitalOcean via Forge:"
echo "    1. Push til GitHub: git push origin main"
echo "    2. Koble repo i Laravel Forge"
echo "    3. Forge håndterer resten"
echo "============================================================"
