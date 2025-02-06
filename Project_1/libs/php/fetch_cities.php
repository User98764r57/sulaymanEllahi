<?php
header('Content-Type: application/json');

if (isset($_GET['isoCode'])) {
    $isoCode = $_GET['isoCode'];
    $username = '(enter username/API Key)'; 
    $url = "http://api.geonames.org/searchJSON?country=$isoCode&maxRows=1000&username=$username";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);

    if (isset($data['geonames']) && !empty($data['geonames'])) {
        $geojson = json_decode(file_get_contents(__DIR__ . '/../js/countryBorders.geojson'), true);

        $countryPolygons = [];
        foreach ($geojson['features'] as $feature) {
            if ($feature['properties']['iso_a2'] === $isoCode) {
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

        $cities = [];
        foreach ($data['geonames'] as $city) {
            if ($city['countryCode'] === $isoCode) {
                $latitude = (float)$city['lat'];
                $longitude = (float)$city['lng'];

                foreach ($countryPolygons as $polygon) {
                    if (isPointInPolygon($latitude, $longitude, $polygon)) {
                        $cities[] = [
                            'City' => $city['name'],
                            'Country' => $city['countryName'] ?? 'Unknown',
                            'Coordinates' => [
                                'Latitude' => $latitude,
                                'Longitude' => $longitude
                            ]
                        ];
                        break;
                    }
                }
            }
        }

        echo json_encode($cities);
    } else {
        echo json_encode([]);
    }
} else {
    echo json_encode(['error' => 'ISO code not provided.']);
}
