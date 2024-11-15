<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json'); 
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (isset($_GET['iso_code'])) {
    $isoCode = $_GET['iso_code'];

    $restCountriesUrl = "https://restcountries.com/v3.1/alpha/$isoCode";

    $curl = curl_init($restCountriesUrl);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    $restCountriesResponse = curl_exec($curl);
    curl_close($curl);
    $restCountriesData = json_decode($restCountriesResponse, true);

    if (isset($restCountriesData[0])) {
        $countryDetails = $restCountriesData[0];
        $countryData = [
            'iso_code' => $isoCode,
            'country_code' => $countryDetails['cca2'],
            'country_name' => $countryDetails['name']['common']
        ];

        echo json_encode($countryData);
    } else {
        echo json_encode(['error' => "No data found for ISO code: $isoCode."]);
    }
} else {
    echo json_encode(['error' => "Please provide an ISO code parameter."]);
}
