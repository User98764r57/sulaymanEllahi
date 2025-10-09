<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$cityName = $_REQUEST['cityName'];

$cacheFile = 'cache/country_' . md5($cityName) . '.json';
$cacheTime = 86400;

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    $result = file_get_contents($cacheFile);
    $decode = json_decode($result, true);
} else {
    $url = 'https://restcountries.com/v3.1/capital/' . urlencode($cityName);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $result = curl_exec($ch);
    curl_close($ch);

    $decode = json_decode($result, true);

    if ($decode !== null && isset($decode[0])) {
        file_put_contents($cacheFile, $result);
    }
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = isset($decode[0]) ? ['countryName' => $decode[0]['name']['common']] : [];

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
?>
