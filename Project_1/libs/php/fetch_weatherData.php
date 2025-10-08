<?php
header('Content-Type: application/json');

$username = 'sulayman2e';

$icaoCodes = [
    'KATL', 'KLAX', 'KORD', 'KDFW', 'KDEN', 'KJFK', 'KLAS', 'KMIA', 'KSEA', 'KBOS',
    'KIAH', 'KMSP', 'KDTW', 'KPHX', 'KPHL', 'KSLC', 'KSAN', 'KTPA', 'KMCO', 'KPDX',
    'CYYZ', 'CYVR', 'CYUL', 'CYYC', 'CYEG', 'CYOW', 'CYWG', 'CYHZ', 'CYQB', 'CYQR',
    'EGLL', 'EHAM', 'EDDF', 'LFPG', 'LEMD', 'LIRF', 'LSZH', 'EBBR', 'ENGM', 'ESSA',
    'LOWW', 'EFHK', 'EIDW', 'BIRK', 'EINN', 'LPPT', 'LEBL', 'LZIB', 'LKPR', 'LDZA',
    'RJTT', 'RKSI', 'ZBAA', 'VIDP', 'VTBS', 'WSSS', 'RPLL', 'VHHH', 'WMKK', 'VABB',
    'ZSPD', 'ZGGG', 'ZPPP', 'ZUUU', 'ZBTJ', 'ZSHC', 'VCRK', 'VOCI', 'OPLA', 'OMDB',
    'YSSY', 'NZAA', 'YPAD', 'YMML', 'YPPH', 'YBBN', 'YBCS', 'NZWN', 'NZCH', 'NFFN',
    'SBGR', 'SCEL', 'SABE', 'SUMU', 'SPJC', 'SLLP', 'SKBO', 'SKRG', 'SBBR', 'SBCF',
    'FAOR', 'HKJK', 'DNAA', 'HECA', 'FACT', 'GMAD', 'DTTA', 'FKKD', 'HFFF', 'FBSK',
    'OMDB', 'OTHH', 'OEJN', 'OJAI', 'OKBK', 'OLBA', 'OOMS', 'OIIE', 'OISS', 'OEDF'
];

$weatherData = [];

$batchSize = 10;
$batches = array_chunk($icaoCodes, $batchSize);

foreach ($batches as $batch) {
    $responses = [];
    
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
    
    $running = null;
    do {
        curl_multi_exec($multiCurl, $running);
    } while ($running);
    
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
    
    if (count($batches) > 1) {
        usleep(200000);
    }
}

if (!empty($weatherData)) {
    echo json_encode(['weather' => $weatherData]);
} else {
    echo json_encode(['weather' => [], 'message' => 'No weather data found.']);
}
?>
