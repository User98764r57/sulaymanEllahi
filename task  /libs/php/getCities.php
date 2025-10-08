<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$city = $_REQUEST['city'];

$cacheFile = 'cache/cities_' . md5($_REQUEST['north'] . $_REQUEST['south'] . $_REQUEST['east'] . $_REQUEST['west']) . '.json';
$cacheTime = 3600;

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    $result = file_get_contents($cacheFile);
    $decode = json_decode($result, true);
} else {
    $url = 'http://api.geonames.org/citiesJSON?formatted=true&north=' . $_REQUEST['north'] . '&south=' . $_REQUEST['south'] . '&east=' . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] . '&username=sulayman2e';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $result = curl_exec($ch);
    curl_close($ch);

    $decode = json_decode($result, true);

    if ($decode !== null && isset($decode['geonames'])) {
        file_put_contents($cacheFile, $result);
    }
}

$filteredCities = array_filter($decode['geonames'], function($item) use ($city) {
    return $item['name'] === $city;
});

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = array_values($filteredCities);

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
?>
