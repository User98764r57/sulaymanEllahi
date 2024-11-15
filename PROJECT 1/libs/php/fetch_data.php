<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (isset($_GET['from']) && isset($_GET['to']) && isset($_GET['amount'])) {
    $fromCurrency = $_GET['from'];
    $toCurrency = $_GET['to'];
    $amount = $_GET['amount'];

    $exchangeApiKey = '65c3f72b5722c75e5a932a6d';
    $url = "https://v6.exchangerate-api.com/v6/{$exchangeApiKey}/pair/{$fromCurrency}/{$toCurrency}/{$amount}";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpcode === 200 && $response) {
        $data = json_decode($response, true);

        if (isset($data['conversion_result'])) {
            echo json_encode(['convertedAmount' => $data['conversion_result']]);
        } else {
            echo json_encode(['error' => 'Conversion result not available.']);
        }
    } else {
        echo json_encode(['error' => 'Failed to retrieve conversion data from the API.']);
    }
    exit;
}

if (isset($_GET['lat']) && isset($_GET['lng'])) {
    $lat = $_GET['lat'];
    $lng = $_GET['lng'];

    $apiKey = '3016afca484a4f13b9b7263ab6a32e77';
    $geoNamesUsername = 'sulyy67694949';

    $urls = [
        'openCage' => "https://api.opencagedata.com/geocode/v1/json?q={$lat},{$lng}&key={$apiKey}",
        'geoNamesPlace' => "http://api.geonames.org/findNearbyPlaceNameJSON?lat={$lat}&lng={$lng}&username={$geoNamesUsername}",
        'timezone' => "http://api.geonames.org/timezoneJSON?lat={$lat}&lng={$lng}&username={$geoNamesUsername}"
    ];

    $responses = fetchParallelData($urls);

    $openCageData = json_decode($responses['openCage'], true);
    if (isset($openCageData['results'][0])) {
        $country = $openCageData['results'][0]['components']['country'] ?? 'N/A';
        $countryCode = $openCageData['results'][0]['components']['country_code'] ?? 'N/A';
        $currency_name = $openCageData['results'][0]['annotations']['currency']['name'] ?? 'N/A';
        $currency_symbol = $openCageData['results'][0]['annotations']['currency']['symbol'] ?? 'N/A';
        $currency_code = $openCageData['results'][0]['annotations']['currency']['iso_code'] ?? 'N/A'; 
        $continent = $openCageData['results'][0]['components']['continent'] ?? 'N/A';
        $flag = $openCageData['results'][0]['annotations']['flag'] ?? 'N/A';
        $currency = ($currency_name !== 'N/A' && $currency_symbol !== 'N/A' && $currency_code !== 'N/A') 
            ? "{$currency_name} / {$currency_symbol} / {$currency_code}" 
            : 'N/A';
    } else {
        echo json_encode(['error' => 'Failed to retrieve data from OpenCage API.']);
        exit;
    }

    $geoNamesData = json_decode($responses['geoNamesPlace'], true);
    if (isset($geoNamesData['geonames'][0])) {
        $capital = $openCageData['results'][0]['annotations']['capital'] ?? 'N/A';
        $population = $openCageData['results'][0]['annotations']['population'] ?? 'N/A';

        if ($capital === 'N/A' || $population === 'N/A') {
            $countryInfoUrl = "http://api.geonames.org/countryInfoJSON?country={$countryCode}&username={$geoNamesUsername}";
            $countryInfoData = json_decode(curlRequest($countryInfoUrl), true);
            if (isset($countryInfoData['geonames'][0])) {
                $geoNamesCountry = $countryInfoData['geonames'][0];
                $capital = $capital === 'N/A' ? $geoNamesCountry['capital'] : $capital;
                $population = $population === 'N/A' ? $geoNamesCountry['population'] : $population;
            }
        }
    }

    $restCountriesUrl = "https://restcountries.com/v3.1/name/" . urlencode($country);
    $restCountriesData = json_decode(curlRequest($restCountriesUrl), true);

    $region = 'N/A';
    $languages = 'N/A';
    if (!empty($restCountriesData) && isset($restCountriesData[0])) {
        $region = $restCountriesData[0]['subregion'] ?? 'N/A';
        $languages = isset($restCountriesData[0]['languages']) 
            ? implode(', ', $restCountriesData[0]['languages']) 
            : 'N/A';
    }

    if ($region === 'N/A' || $languages === 'N/A') {
        $restCountriesUrlByCode = "https://restcountries.com/v3.1/alpha/{$countryCode}";
        $restCountriesDataByCode = json_decode(curlRequest($restCountriesUrlByCode), true);

        if (!empty($restCountriesDataByCode) && isset($restCountriesDataByCode[0])) {
            $region = $region === 'N/A' ? ($restCountriesDataByCode[0]['subregion'] ?? 'N/A') : $region;
            $languages = $languages === 'N/A' && isset($restCountriesDataByCode[0]['languages'])
                ? implode(', ', $restCountriesDataByCode[0]['languages'])
                : $languages;
        }
    }

    $timezoneData = json_decode($responses['timezone'], true);
    $timezone = $timezoneData['time'] ?? 'N/A';

    $wikiSearchUrl = "http://api.geonames.org/wikipediaSearchJSON?q=" . urlencode($country) . "&maxRows=3&username={$geoNamesUsername}";
    $wikiData = json_decode(curlRequest($wikiSearchUrl), true);
    $wikiTitles = array_map(function($item) {
        return [
            'title' => $item['title'],
            'url' => $item['wikipediaUrl'],
            'summary' => $item['summary'] ?? 'N/A',
            'thumbnailImg' => $item['thumbnailImg'] ?? 'N/A'
        ];
    }, $wikiData['geonames'] ?? []);

    echo json_encode([
        'country' => $country,
        'country_code' => $countryCode,
        'capital' => $capital,
        'population' => $population,
        'region' => $region,
        'languages' => $languages,
        'currency' => $currency,
        'continent' => $continent,
        'flag' => $flag,
        'wikiTitles' => $wikiTitles,
        'timezone' => $timezone,
    ]);
} else {
    echo json_encode(['error' => 'Invalid request.']);
}

function fetchParallelData($urls) {
    $multiCurl = [];
    $result = [];
    $mh = curl_multi_init();

    foreach ($urls as $key => $url) {
        $multiCurl[$key] = curl_init();
        curl_setopt($multiCurl[$key], CURLOPT_URL, $url);
        curl_setopt($multiCurl[$key], CURLOPT_RETURNTRANSFER, true);
        curl_setopt($multiCurl[$key], CURLOPT_TIMEOUT, 10);
        curl_setopt($multiCurl[$key], CURLOPT_SSL_VERIFYPEER, false);
        curl_multi_add_handle($mh, $multiCurl[$key]);
    }

    $index = null;
    do {
        curl_multi_exec($mh, $index);
    } while ($index > 0);

    foreach ($multiCurl as $key => $ch) {
        $result[$key] = curl_multi_getcontent($ch);
        curl_multi_remove_handle($mh, $ch);
    }

    curl_multi_close($mh);
    return $result;
}

function curlRequest($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
}
