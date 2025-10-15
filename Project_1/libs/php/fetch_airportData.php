<?php
header('Content-Type: application/json');

$access_key = '1bd55df9ceb36af9b13c21a5f41c468f';
$airportData = [];

if (isset($_GET['iso_code'])) {
    $isoCode = $_GET['iso_code'];
    
    $geojson = json_decode(file_get_contents(__DIR__ . '/../js/countryBorders.geojson'), true);
    
    $countryName = '';
    $countryPolygons = [];
    foreach ($geojson['features'] as $feature) {
        if ($feature['properties']['iso_a2'] === $isoCode) {
            $countryName = $feature['properties']['name'];
            
            if ($feature['geometry']['type'] === 'Polygon') {
                $countryPolygons[] = $feature['geometry']['coordinates'];
            } elseif ($feature['geometry']['type'] === 'MultiPolygon') {
                foreach ($feature['geometry']['coordinates'] as $polygon) {
                    $countryPolygons[] = $polygon;
                }
            }
            break;
        }
    }
    
    function isPointInPolygon($lat, $lng, $polygon) {
        foreach ($polygon as $subPolygon) {
            $inside = false;
            $numPoints = count($subPolygon);
            for ($i = 0, $j = $numPoints - 1; $i < $numPoints; $j = $i++) {
                $xi = $subPolygon[$i][0];
                $yi = $subPolygon[$i][1];
                $xj = $subPolygon[$j][0];
                $yj = $subPolygon[$j][1];

                $intersect = (($yi > $lat) != ($yj > $lat)) &&
                             ($lng < ($xj - $xi) * ($lat - $yi) / ($yj - $yi) + $xi);
                if ($intersect) $inside = !$inside;
            }
            if ($inside) return true;
        }
        return false;
    }
    
    if (!empty($countryName)) {
        $url = "https://api.aviationstack.com/v1/airports?access_key=$access_key&country_name=" . urlencode($countryName);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        curl_close($ch);
        
        $data = json_decode($response, true);
        
        if (isset($data['data']) && is_array($data['data'])) {
            foreach ($data['data'] as $airport) {
                if (isset($airport['country_iso2']) && $airport['country_iso2'] === $isoCode) {
                    $latitude = (float)$airport['latitude'];
                    $longitude = (float)$airport['longitude'];
                    
                    $isInCountry = false;
                    foreach ($countryPolygons as $polygon) {
                        if (isPointInPolygon($latitude, $longitude, $polygon)) {
                            $isInCountry = true;
                            break;
                        }
                    }
                    
                    if ($isInCountry) {
                        $airportData[] = [
                            'stationName' => $airport['airport_name'],
                            'icao' => $airport['icao_code'],
                            'iata' => $airport['iata_code'],
                            'lat' => $airport['latitude'],
                            'lng' => $airport['longitude'],
                            'countryCode' => $airport['country_iso2'],
                            'timezone' => $airport['timezone'],
                            'gmt' => $airport['gmt']
                        ];
                    }
                }
            }
        }
    }
}

if (!empty($airportData)) {
    echo json_encode(['airports' => $airportData]);
} else {
    echo json_encode(['airports' => [], 'message' => 'No airport data found.']);
}
?>
