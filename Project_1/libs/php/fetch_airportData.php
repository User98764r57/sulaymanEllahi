<?php
header('Content-Type: application/json');

$access_key = '';
$airportData = [];

if (isset($_GET['iso_code'])) {
    $isoCode = $_GET['iso_code'];
    
    $geojson = json_decode(file_get_contents(__DIR__ . '/../js/countryBorders.geojson'), true);
    
    $countryName = '';
    foreach ($geojson['features'] as $feature) {
        if ($feature['properties']['iso_a2'] === $isoCode) {
            $countryName = $feature['properties']['name'];
            break;
        }
    }
    
    if (!empty($countryName)) {
        $url = "https://api.aviationstack.com/v1/airports?access_key=$access_key&country_name=" . urlencode($countryName);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        curl_close($ch);
        
        $data = json_decode($response, true);
        
        if (isset($data['data']) && is_array($data['data'])) {
            foreach ($data['data'] as $airport) {
                if (isset($airport['country_iso2']) && $airport['country_iso2'] === $isoCode) {
                    $airportData[] = [
                        'stationName' => $airport['airport_name'],
                        'icao' => $airport['icao_code'],
                        'iata' => $airport['iata_code'],
                        'lat' => $airport['latitude'],
                        'lng' => $airport['longitude'],
                        'countryCode' => $airport['country_iso2'],
                        'timezone' => $airport['timezone'],
                        'gmt' => $airport['gmt']
                    ];
                }
            }
        }
    }
}

if (!empty($airportData)) {
    echo json_encode(['airports' => $airportData]);
} else {
    echo json_encode(['airports' => [], 'message' => 'No airport data found.']);
}
?>
