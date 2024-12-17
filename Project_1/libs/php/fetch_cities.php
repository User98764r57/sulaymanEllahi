<?php
if (isset($_GET['isoCode'])) {
    $isoCode = $_GET['isoCode'];
    $username = 'sulyy67694949'; 
    $url = "http://api.geonames.org/searchJSON?country=$isoCode&maxRows=1000&username=$username";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);

    if (isset($data['geonames']) && !empty($data['geonames'])) {
        $cities = [];
        foreach ($data['geonames'] as $city) {
            $cities[] = [
                'City' => $city['name'],
                'Country' => $city['countryName'] ?? 'Unknown',
                'Coordinates' => [
                    'Latitude' => $city['lat'],
                    'Longitude' => $city['lng']
                ]
            ];
        }
        header('Content-Type: application/json');
        echo json_encode($cities);
    } else {
        header('Content-Type: application/json');
        echo json_encode([]);
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'ISO code not provided.']);
}
