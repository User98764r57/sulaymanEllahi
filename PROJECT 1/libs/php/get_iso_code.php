<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json'); 
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (isset($_GET['lat']) && isset($_GET['lng'])) {
    $lat = $_GET['lat'];
    $lng = $_GET['lng'];
    
    $url = "http://api.geonames.org/countryCodeJSON?lat=$lat&lng=$lng&username=sulyy67694949";

    $response = file_get_contents($url);
    $data = json_decode($response, true);

    if (isset($data['countryCode'])) {
        echo json_encode(['iso_code' => $data['countryCode']]);
    } else {
        echo json_encode(['error' => 'Country ISO code not found']);
    }
} else {
    echo json_encode(['error' => 'Invalid coordinates']);
}
