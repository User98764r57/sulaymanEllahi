<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json'); 
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include the configuration file
require_once 'config.php';

// Function to fetch cities from GeoNames API
function fetchCities($north, $south, $east, $west, $maxRows = 1000) {
    $username = GEO_NAMES_USERNAME;
    $url = "https://secure.geonames.org/citiesJSON?north={$north}&south={$south}&east={$east}&west={$west}&lang=en&username={$username}&maxRows={$maxRows}";

    // Initialize cURL session
    $ch = curl_init();

    // Set cURL options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Execute cURL request
    $response = curl_exec($ch);

    // Check for cURL errors
    if (curl_errno($ch)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch data from GeoNames API.']);
        curl_close($ch);
        exit;
    }

    // Get HTTP response code
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // Check for successful response
    if ($httpCode !== 200) {
        http_response_code($httpCode);
        echo json_encode(['error' => 'GeoNames API returned an error.']);
        exit;
    }

    // Return the API response
    echo $response;
}

// Retrieve parameters from GET request
$north = isset($_GET['north']) ? floatval($_GET['north']) : 90;
$south = isset($_GET['south']) ? floatval($_GET['south']) : -90;
$east  = isset($_GET['east'])  ? floatval($_GET['east'])  : 180;
$west  = isset($_GET['west'])  ? floatval($_GET['west'])  : -180;
$maxRows = isset($_GET['maxRows']) ? intval($_GET['maxRows']) : 1000;

// Validate parameters (optional but recommended)
if ($north < -90 || $north > 90 || $south < -90 || $south > 90 || $east < -180 || $east > 180 || $west < -180 || $west > 180) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid bounding box parameters.']);
    exit;
}

// Fetch and return cities data
fetchCities($north, $south, $east, $west, $maxRows);
