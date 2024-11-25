<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$username = 'sulyy67694949';

$url = "http://api.geonames.org/citiesJSON?north=90&south=-90&east=180&west=-180&maxRows=500&username=$username";

$options = [
    'http' => [
        'timeout' => 30
    ]
];
$context = stream_context_create($options);

$cacheDir = __DIR__ . '/cache';
$cacheFile = $cacheDir . '/city_data.json';
$cacheTime = 3600;

if (!file_exists($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    echo file_get_contents($cacheFile);
    exit;
}

function fetchWithRetry($url, $context, $retries = 3) {
    $attempt = 0;
    while ($attempt < $retries) {
        $response = @file_get_contents($url, false, $context);
        if ($response !== FALSE) {
            return $response;
        }
        $attempt++;
        sleep(2);
    }
    return false;
}

$response = fetchWithRetry($url, $context);

if ($response === FALSE) {
    echo json_encode(["error" => "Failed to fetch city data after multiple attempts"]);
    exit;
}

$jsonData = json_decode($response, true);

if (!isset($jsonData['geonames'])) {
    echo json_encode(["error" => "Invalid response from GeoNames API"]);
    exit;
}

if (file_put_contents($cacheFile, $response) === FALSE) {
    echo json_encode(["error" => "Failed to save cache file"]);
    exit;
}

echo $response;
