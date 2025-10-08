<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$date = $_REQUEST['date'];

$cacheFile = 'cache/earthquakes_' . md5($_REQUEST['north'] . $_REQUEST['south'] . $_REQUEST['east'] . $_REQUEST['west']) . '.json';
$cacheTime = 600;

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    $result = file_get_contents($cacheFile);
    $decode = json_decode($result, true);
} else {
    $url = 'http://api.geonames.org/earthquakesJSON?formatted=true&north=' . $_REQUEST['north'] . '&south=' . $_REQUEST['south'] . '&east=' . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] . '&username=sulayman2e';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $result = curl_exec($ch);
    curl_close($ch);

    $decode = json_decode($result, true);

    if ($decode !== null && isset($decode['earthquakes'])) {
        file_put_contents($cacheFile, $result);
    }
}

if ($date) {
    $filteredData = array_filter($decode['earthquakes'], function($earthquake) use ($date) {
        return strpos($earthquake['datetime'], $date) === 0;
    });
    $output['data'] = array_values($filteredData);
} else {
    $output['data'] = $decode['earthquakes'];
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
?>
