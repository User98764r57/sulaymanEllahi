<?php
$username = 'sulyy67694949'; 
$url = "http://api.geonames.org/countryInfoJSON?username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (isset($data['geonames']) && !empty($data['geonames'])) {
    $countries = [];
    foreach ($data['geonames'] as $country) {
        $countries[] = [
            'name' => $country['countryName'],
            'isoCode' => $country['countryCode']
        ];
    }
    header('Content-Type: application/json');
    echo json_encode($countries);
} else {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unable to fetch countries.']);
}
