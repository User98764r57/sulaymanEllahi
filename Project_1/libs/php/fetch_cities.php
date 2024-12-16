<?php
$username = 'sulayman2e';
$countryInfoUrl = "http://api.geonames.org/countryInfoJSON?username=$username";
$geoNamesSearchUrl = "http://api.geonames.org/searchJSON?username=$username";

function fetchApiData($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        return json_decode($response, true);
    }
    return null;
}

function fetchCapitalCoordinatesBatch($countries, $geoNamesSearchUrl) {
    $multiHandle = curl_multi_init();
    $curlHandles = [];
    $results = [];

    foreach ($countries as $isoCode => $capital) {
        if (empty($capital)) {
            $results[$isoCode] = null;
            continue;
        }
        $queryUrl = $geoNamesSearchUrl . "&q=" . urlencode($capital) . "&country=" . urlencode($isoCode) . "&maxRows=1";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $queryUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_multi_add_handle($multiHandle, $ch);
        $curlHandles[$isoCode] = $ch;
    }

    do {
        curl_multi_exec($multiHandle, $running);
        curl_multi_select($multiHandle);
    } while ($running > 0);

    foreach ($curlHandles as $isoCode => $ch) {
        $response = curl_multi_getcontent($ch);
        $data = json_decode($response, true);
        if ($data && isset($data['geonames'][0])) {
            $results[$isoCode] = [
                'Latitude' => $data['geonames'][0]['lat'],
                'Longitude' => $data['geonames'][0]['lng']
            ];
        } else {
            $results[$isoCode] = null;
        }
        curl_multi_remove_handle($multiHandle, $ch);
        curl_close($ch);
    }

    curl_multi_close($multiHandle);
    return $results;
}

$countryData = fetchApiData($countryInfoUrl);

if ($countryData && isset($countryData['geonames']) && !empty($countryData['geonames'])) {
    $countries = [];
    foreach ($countryData['geonames'] as $country) {
        $countries[$country['countryCode']] = $country['capital'];
    }

    $capitalCoordinates = fetchCapitalCoordinatesBatch($countries, $geoNamesSearchUrl);
    $result = [];
    foreach ($countryData['geonames'] as $country) {
        $isoCode = $country['countryCode'];
        $capital = $country['capital'];
        $coordinates = $capitalCoordinates[$isoCode] ?? [
            'Latitude' => ($country['north'] + $country['south']) / 2,
            'Longitude' => ($country['east'] + $country['west']) / 2
        ];

        $result[] = [
            'Country' => $country['countryName'],
            'City' => !empty($capital) ? $capital : 'No capital data available',
            'Coordinates' => $coordinates
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($result);
} else {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch data from GeoNames API.']);
}
