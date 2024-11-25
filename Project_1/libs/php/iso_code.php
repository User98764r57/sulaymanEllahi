<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json'); 
error_reporting(E_ALL);
ini_set('display_errors', 1);

$geojsonPath = '../js/countryBorders.geojson';
if (!file_exists($geojsonPath)) {
    echo json_encode(['error' => "GeoJSON file not found."]);
    exit;
}

$geojson = file_get_contents($geojsonPath);
$data = json_decode($geojson, true);
if ($data === null) {
    echo json_encode(['error' => "Invalid GeoJSON data."]);
    exit;
}
$features = $data['features'];

if (isset($_GET['iso_code'])) {
    $isoCode = strtoupper($_GET['iso_code']);
    $country = null;
    foreach ($features as $feature) {
        if (strcasecmp($feature['properties']['iso_a2'], $isoCode) == 0) {
            $country = $feature['properties'];
            break;
        }
    }
    if ($country) {
        $countryData = [
            'iso_code' => $country['iso_a2'],
            'country_code' => $country['iso_a2'],
            'country_name' => $country['name']
        ];
        echo json_encode($countryData);
    } else {
        echo json_encode(['error' => "No data found for ISO code: $isoCode."]);
    }
} else {
    echo json_encode(['error' => "Please provide an ISO code parameter."]);
}
