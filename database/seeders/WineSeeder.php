<?php

namespace Database\Seeders;

use App\Models\Wine;
use Illuminate\Database\Seeder;

class WineSeeder extends Seeder
{
    /**
     * Populerer databasen med noen eksempelviner for testing
     */
    public function run(): void
    {
        $wines = [
            [
                'vinmonopolet_id' => '1001',
                'name' => 'Barolo Riserva 2018',
                'producer' => 'Giacomo Conterno',
                'country' => 'Italia',
                'region' => 'Piemonte',
                'type' => 'Rødvin',
                'grape_variety' => 'Nebbiolo',
                'year' => 2018,
                'alcohol_percentage' => 14.5,
                'price' => 899.90,
                'volume_ml' => 750,
                'food_pairings' => ['Biff', 'Viltgryte', 'Modne oster'],
            ],
            [
                'vinmonopolet_id' => '1002',
                'name' => 'Chablis Premier Cru 2021',
                'producer' => 'William Fâvre',
                'country' => 'Frankrike',
                'region' => 'Burgund',
                'type' => 'Hvitvin',
                'grape_variety' => 'Chardonnay',
                'year' => 2021,
                'alcohol_percentage' => 13.0,
                'price' => 349.90,
                'volume_ml' => 750,
                'food_pairings' => ['Sjømat', 'Kylling', 'Ost'],
            ],
            [
                'vinmonopolet_id' => '1003',
                'name' => 'Whispering Angel 2023',
                'producer' => 'Château d\'Esclans',
                'country' => 'Frankrike',
                'region' => 'Provence',
                'type' => 'Rosévin',
                'grape_variety' => 'Grenache, Cinsault',
                'year' => 2023,
                'alcohol_percentage' => 13.5,
                'price' => 249.90,
                'volume_ml' => 750,
                'food_pairings' => ['Salat', 'Grillet kylling', 'Tapas'],
            ],
            [
                'vinmonopolet_id' => '1004',
                'name' => 'Veuve Clicquot Yellow Label Brut',
                'producer' => 'Veuve Clicquot',
                'country' => 'Frankrike',
                'region' => 'Champagne',
                'type' => 'Musserende',
                'grape_variety' => 'Pinot Noir, Chardonnay, Pinot Meunier',
                'year' => null,
                'alcohol_percentage' => 12.0,
                'price' => 599.90,
                'volume_ml' => 750,
                'food_pairings' => ['Østers', 'Aperitif', 'Sjúmat'],
            ],
            [
                'vinmonopolet_id' => '1005',
                'name' => 'Brunello di Montalcino 2019',
                'producer' => 'Biondi-Santi',
                'country' => 'Italia',
                'region' => 'Toscana',
                'type' => 'Rødvin',
                'grape_variety' => 'Sangiovese',
                'year' => 2019,
                'alcohol_percentage' => 14.0,
                'price' => 1299.00,
                'volume_ml' => 750,
                'food_pairings' => ['Lammelår', 'Biff', 'Pasta med kjøttsaus'],
            ],
            [
                'vinmonopolet_id' => '1006',
                'name' => 'Riesling Kabinett 2022',
                'producer' => 'Dr. Loosen',
                'country' => 'Tyskland',
                'region' => 'Mosel',
                'type' => 'Hvitvin',
                'grape_variety' => 'Riesling',
                'year' => 2022,
                'alcohol_percentage' => 8.5,
                'price' => 199.90,
                'volume_ml' => 750,
                'food_pairings' => ['Asiatisk mat', 'Lett fisk', 'Frukt'],
            ],
        ];

        foreach ($wines as $wineData) {
            Wine::updateOrCreate(
                ['vinmonopolet_id' => $wineData['vinmonopolet_id']],
                $wineData
            );
        }
    }
}
