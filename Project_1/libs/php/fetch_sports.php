<?php

$geoNamesApiKey = 'sulyy67694949';
$weatherApiKey = '080e10a6ef5943cf96a14039241112';

if (isset($_GET['iso_code'])) {
    $isoCode = $_GET['iso_code'];

    $geoNamesUrl = "http://api.geonames.org/countryInfoJSON?username=$geoNamesApiKey&country=$isoCode";
    $geoNamesResponse = file_get_contents($geoNamesUrl);
    $geoNamesData = json_decode($geoNamesResponse, true);

    if (isset($geoNamesData['geonames'][0]['capital'])) {
        $capital = $geoNamesData['geonames'][0]['capital'];

        $weatherUrl = "http://api.weatherapi.com/v1/sports.json?q=$capital&key=$weatherApiKey";
        $weatherResponse = file_get_contents($weatherUrl);
        $weatherData = json_decode($weatherResponse, true);

        $sportsInfo = [];

        foreach ($weatherData as $sportType => $events) {
            foreach ($events as $event) {
                $sportsInfo[] = [
                    'sport' => $sportType,
                    'stadium' => $event['stadium'] ?? '',
                    'tournament' => $event['tournament'] ?? '',
                    'start' => $event['start'] ?? '',
                    'match' => $event['match'] ?? ''
                ];
            }
        }

        echo json_encode($sportsInfo);
    } else {
        echo json_encode(['error' => 'Capital city not found.']);
    }
} else {
    echo json_encode(['error' => 'ISO code not provided.']);
}

