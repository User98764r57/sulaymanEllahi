<?php
header('Content-Type: application/json');

$username = 'sulayman2e';
$radius = isset($_GET['radius']) ? $_GET['radius'] : 100;
$maxRows = isset($_GET['maxRows']) ? $_GET['maxRows'] : 50;

$url = "http://api.geonames.org/earthquakesJSON?formatted=true&north=90&south=-90&east=180&west=-180&radius=$radius&maxRows=$maxRows&username=$username";

$response = file_get_contents($url);

if ($response === FALSE) {
    echo json_encode(['error' => 'Failed to fetch earthquake data.']);
    exit;
}

$data = json_decode($response, true);

if (isset($data['earthquakes']) && is_array($data['earthquakes']) && count($data['earthquakes']) > 0) {
    $earthquakes = array_map(function ($quake) {
        return [
            'lat' => $quake['lat'],
            'lng' => $quake['lng'],
            'magnitude' => $quake['magnitude'],
            'depth' => $quake['depth'],
            'date' => $quake['datetime'],
        ];
    }, $data['earthquakes']);

    echo json_encode(['geonames' => $earthquakes]);
} else {
    echo json_encode(['geonames' => [], 'message' => 'No earthquake data found.']);
}
