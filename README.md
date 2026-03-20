# 🍷 VinApp

Personlig vinkjeller-app med strekkodescanning, Vinmonopolet-integrasjon og verdisporing.

## Funksjoner

- **Strekkodescanning** — scan vinflasker med mobilkameraet
- **Vinmonopolet-integrasjon** — hent vindata, priser og smaksbeskrivelser automatisk
- **Vinkjeller** — logg flasker inn og ut, se beholdning
- **Verdisporing** — se nåverdi vs. innkjøpspris
- **Matparing** — få anbefalinger til hvilken mat som passer til vinen
- **Flerbruker** — egne kjellere per bruker
- **PWA** — installeres som app på mobilen
- **React Native** — dedikert iOS/Android-app

## Tech Stack

- **Backend**: Laravel 11 + PHP 8.2
- **Frontend**: React 18 + Inertia.js
- **Styling**: Tailwind CSS
- **Auth**: Laravel Breeze + Sanctum
- **Mobile**: React Native (Expo)
- **Hosting**: DigitalOcean via Laravel Forge

## Kom i gang lokalt

```bash
# Klon repoet
git clone https://github.com/YOUR_USERNAME/vinapp.git
cd vinapp

# Installer avhengigheter
composer install
npm install

# Konfigurer miljø
cp .env.example .env
php artisan key:generate

# Sett opp database
touch database/database.sqlite
php artisan migrate --seed

# Bygg frontend
npm run build

# Start appen
php artisan serve
```

Åpne [http://localhost:8000](http://localhost:8000)

## API-nøkler

Legg til Vinmonopolet API-nøkkel i `.env`:

```
VINMONOPOLET_API_KEY=din-nøkkel-her
```

Hent nøkkel på [developer.vinmonopolet.no](https://developer.vinmonopolet.no)

## Deployment

Se [DEPLOY.md](DEPLOY.md) for fullstendig guide til GitHub → Forge → DigitalOcean.

## Mobil-app

```bash
cd mobile
npm install
npx expo start
```

## Lisens