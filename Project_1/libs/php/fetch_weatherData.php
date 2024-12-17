<?php
header('Content-Type: application/json');

$username = 'sulayman2e';

$icaoCodes = [

    'KATL', 'KLAX', 'KORD', 'KDFW', 'KDEN', 'CYYZ', 'CYVR',

    'EGLL', 'EHAM', 'EDDF', 'LFPG', 'LEMD', 'LIRF',

    'RJTT', 'RKSI', 'ZBAA', 'VIDP', 'VTBS', 'WSSS',

    'YSSY', 'NZAA', 'YPAD',

    'SBGR', 'SCEL', 'SABE',

    'FAOR', 'HKJK', 'DNAA',

    'OMDB', 'OTHH', 'OEJN',

    'EGPF', 'EGPH', 'EIDW'
];

$weatherData = [];

foreach ($icaoCodes as $icao) {
    $url = "http://api.geonames.org/weatherIcaoJSON?ICAO=$icao&username=$username";
    $response = file_get_contents($url);

    if ($response === FALSE) {
        continue;
    }

    $data = json_decode($response, true);

    if (isset($data['weatherObservation'])) {
        $observation = $data['weatherObservation'];
        $weatherData[] = [
            'temperature' => $observation['temperature'],
            'humidity' => $observation['humidity'],
            'stationName' => $observation['stationName'],
            'lat' => $observation['lat'],
            'lng' => $observation['lng'],
            'datetime' => $observation['datetime'],
            'countryCode' => $observation['countryCode'] ?? 'Unknown'
        ];
    }
}

if (!empty($weatherData)) {
    echo json_encode(['weather' => $weatherData]);
} else {
    echo json_encode(['weather' => [], 'message' => 'No weather data found.']);
}
