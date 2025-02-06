<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (isset($_GET['from']) && isset($_GET['to']) && isset($_GET['amount'])) {
    $fromCurrency = $_GET['from'];
    $toCurrency = $_GET['to'];
    $amount = $_GET['amount'];

    $exchangeApiKey = '(enter username/API Key)';
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

if (isset($_GET['iso_code'])) {
    $isoCode = $_GET['iso_code'];

    $restCountriesUrl = "https://restcountries.com/v3.1/alpha/{$isoCode}";
    $restCountriesData = json_decode(curlRequest($restCountriesUrl), true);

    if (!empty($restCountriesData) && isset($restCountriesData[0])) {
        $country = $restCountriesData[0]['name']['common'] ?? 'N/A';
        $countryCode = $isoCode;
        $continent = $restCountriesData[0]['region'] ?? 'N/A';
        $region = $restCountriesData[0]['subregion'] ?? 'N/A';
        $languages = isset($restCountriesData[0]['languages']) 
            ? implode(', ', $restCountriesData[0]['languages']) 
            : 'N/A';
        $capital = isset($restCountriesData[0]['capital']) 
            ? implode(', ', $restCountriesData[0]['capital']) 
            : 'N/A';
        $population = $restCountriesData[0]['population'] ?? 'N/A';

        $openCageApiKey = '(enter username/API Key)';
        $openCageUrl = "https://api.opencagedata.com/geocode/v1/json?q=" . urlencode($country) . "&key={$openCageApiKey}";
        $openCageData = json_decode(curlRequest($openCageUrl), true);

        if (!empty($openCageData['results'][0])) {
            $flag = $openCageData['results'][0]['annotations']['flag'] ?? 'N/A';
            $currencyData = $openCageData['results'][0]['annotations']['currency'] ?? [];
            $currencyName = $currencyData['name'] ?? 'N/A';
            $currencySymbol = $currencyData['symbol'] ?? 'N/A';
            $currencyCode = $currencyData['iso_code'] ?? 'N/A';
            $currency = "{$currencyName} / {$currencySymbol} / {$currencyCode}";
        } else {
            $flag = 'N/A';
            $currency = 'N/A';
        }
    } else {
        echo json_encode(['error' => 'Failed to retrieve data from REST Countries API.']);
        exit;
    }

    $geoNamesUsername = '(enter username/API Key)';
    $timezoneUrl = "http://api.geonames.org/timezoneJSON?country={$isoCode}&username={$geoNamesUsername}";
    $wikiSearchUrl = "http://api.geonames.org/wikipediaSearchJSON?q=" . urlencode($country) . "&maxRows=10&username={$geoNamesUsername}";

    $responses = fetchParallelData(['timezone' => $timezoneUrl, 'wikiSearch' => $wikiSearchUrl]);

    $timezoneData = json_decode($responses['timezone'], true);
    $timezone = $timezoneData['time'] ?? 'N/A';

    $wikiData = json_decode($responses['wikiSearch'], true);
    $wikiTitles = array_filter(array_map(function($item) use ($country) {
        return (stripos($item['summary'] ?? '', $country) !== false || stripos($item['title'], $country) !== false) ? [
            'title' => $item['title'],
            'url' => $item['wikipediaUrl'],
            'summary' => $item['summary'] ?? 'N/A',
            'thumbnailImg' => $item['thumbnailImg'] ?? 'N/A'
        ] : null;
    }, $wikiData['geonames'] ?? []));

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
        'timezone' => $timezone,
        'wikiTitles' => array_values($wikiTitles),
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
