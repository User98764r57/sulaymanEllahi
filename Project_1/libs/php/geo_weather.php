<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$geonamesUsername = "sulyy67694949";
$weatherApiKey = "080e10a6ef5943cf96a14039241112";

header('Content-Type: application/json');

if (isset($_GET['iso_code'])) {
    $isoCode = $_GET['iso_code'];
    $geonamesUrl = "http://api.geonames.org/countryInfoJSON?username=$geonamesUsername&country=$isoCode";
    $geoResponse = file_get_contents($geonamesUrl);

    if ($geoResponse === false) {
        echo json_encode(['error' => 'Failed to fetch data from GeoNames API.']);
        exit;
    }

    $geoData = json_decode($geoResponse, true);

    if (!isset($geoData['geonames'][0])) {
        echo json_encode(['error' => 'No data found for the provided ISO code.']);
        exit;
    }

    $capitalCity = $geoData['geonames'][0]['capital'];
    $weatherUrl = "http://api.weatherapi.com/v1/forecast.json?q=$capitalCity&days=3&key=$weatherApiKey";
    $weatherResponse = file_get_contents($weatherUrl);

    if ($weatherResponse === false) {
        echo json_encode(['error' => 'Failed to fetch data from Weather API.']);
        exit;
    }

    $weatherData = json_decode($weatherResponse, true);

    if (!isset($weatherData['location'])) {
        echo json_encode(['error' => 'Invalid response from Weather API.']);
        exit;
    }

    $region = $weatherData['location']['region'];

    $result = [
        'region' => $region,
        'country' => $weatherData['location']['country'],
        'current_weather' => [
            'description' => $weatherData['current']['condition']['text'],
            'icon' => $weatherData['current']['condition']['icon'],
            'temperature' => $weatherData['current']['temp_c']
        ],
        'forecast' => []
    ];

    foreach ($weatherData['forecast']['forecastday'] as $forecastDay) {
        $result['forecast'][] = [
            'date' => $forecastDay['date'],
            'description' => $forecastDay['day']['condition']['text'],
            'icon' => $forecastDay['day']['condition']['icon'],
            'temperature' => $forecastDay['day']['avgtemp_c']
        ];
    }

    echo json_encode($result);
} else {
    echo json_encode(['error' => 'ISO code is required.']);
}
