<?php
header('Content-Type: application/json');

$username = 'sulayman2e';

// Enhanced list of ICAO codes covering more countries
$icaoCodes = [
    // North America
    'KATL', 'KLAX', 'KORD', 'KDFW', 'KDEN', 'KJFK', 'KLAS', 'KMIA', 'KSEA', 'KBOS',
    'KIAH', 'KMSP', 'KDTW', 'KPHX', 'KPHL', 'KSLC', 'KSAN', 'KTPA', 'KMCO', 'KPDX',
    
    // Canada
    'CYYZ', 'CYVR', 'CYUL', 'CYYC', 'CYEG', 'CYOW', 'CYWG', 'CYHZ', 'CYQB', 'CYQR',
    
    // Europe
    'EGLL', 'EHAM', 'EDDF', 'LFPG', 'LEMD', 'LIRF', 'LSZH', 'EBBR', 'ENGM', 'ESSA',
    'LOWW', 'EFHK', 'EIDW', 'BIRK', 'EINN', 'LPPT', 'LEBL', 'LZIB', 'LKPR', 'LDZA',
    
    // Asia
    'RJTT', 'RKSI', 'ZBAA', 'VIDP', 'VTBS', 'WSSS', 'RPLL', 'VHHH', 'WMKK', 'VABB',
    'ZSPD', 'ZGGG', 'ZPPP', 'ZUUU', 'ZBTJ', 'ZSHC', 'VCRK', 'VOCI', 'OPLA', 'OMDB',
    
    // Oceania
    'YSSY', 'NZAA', 'YPAD', 'YMML', 'YPPH', 'YBBN', 'YBCS', 'NZWN', 'NZCH', 'NFFN',
    
    // South America
    'SBGR', 'SCEL', 'SABE', 'SUMU', 'SPJC', 'SLLP', 'SKBO', 'SKRG', 'SBBR', 'SBCF',
    
    // Africa
    'FAOR', 'HKJK', 'DNAA', 'HECA', 'FACT', 'GMAD', 'DTTA', 'FKKD', 'HFFF', 'FBSK',
    
    // Middle East
    'OMDB', 'OTHH', 'OEJN', 'OJAI', 'OKBK', 'OLBA', 'OOMS', 'OIIE', 'OISS', 'OEDF'
];

$weatherData = [];

// Limit concurrent requests to prevent timeout
$batchSize = 10;
$batches = array_chunk($icaoCodes, $batchSize);

foreach ($batches as $batch) {
    $responses = [];
    
    // Create multi curl for batch processing
    $multiCurl = curl_multi_init();
    $curlHandles = [];
    
    foreach ($batch as $icao) {
        $url = "http://api.geonames.org/weatherIcaoJSON?ICAO=$icao&username=$username";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_multi_add_handle($multiCurl, $ch);
        $curlHandles[$icao] = $ch;
    }
    
    // Execute the batch
    $running = null;
    do {
        curl_multi_exec($multiCurl, $running);
    } while ($running);
    
    // Process responses
    foreach ($curlHandles as $icao => $ch) {
        $response = curl_multi_getcontent($ch);
        $data = json_decode($response, true);
        
        if (isset($data['weatherObservation'])) {
            $observation = $data['weatherObservation'];
            $weatherData[] = [
                'temperature' => $observation['temperature'],
                'humidity' => $observation['humidity'],
                'stationName' => $observation['stationName'],
                'lat' => $observation['lat'],
                'lng' => $observation['lng'],
                'datetime' => $observation['datetime'],
                'countryCode' => $observation['countryCode'] ?? 'Unknown'
            ];
        }
        
        curl_multi_remove_handle($multiCurl, $ch);
        curl_close($ch);
    }
    
    curl_multi_close($multiCurl);
    
    // Small delay between batches to be respectful to the API
    if (count($batches) > 1) {
        usleep(200000); // 0.2 seconds
    }
}

if (!empty($weatherData)) {
    echo json_encode(['weather' => $weatherData]);
} else {
    echo json_encode(['weather' => [], 'message' => 'No weather data found.']);
}
?>
