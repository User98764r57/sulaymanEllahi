<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$exchangeApiKey = '(enter username/API Key)'; 
$url = "https://v6.exchangerate-api.com/v6/{$exchangeApiKey}/codes";

$response = file_get_contents($url);

if ($response === FALSE) {
    echo json_encode(['error' => 'Error fetching currency codes']);
    exit;
}

$data = json_decode($response, true);

if (isset($data['supported_codes'])) {
    $currencyCodes = array_map(function($codeInfo) {
        return $codeInfo[0];
    }, $data['supported_codes']);

    echo json_encode(['currencies' => $currencyCodes]);
} else {
    echo json_encode(['error' => 'Failed to load currency data']);
}
