<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json'); 
error_reporting(E_ALL);
ini_set('display_errors', 1);

function pointInPolygon($point, $polygon) { 
    $x = $point['lng'];
    $y = $point['lat'];
    $inside = false;
    $numPoints = count($polygon);
    for ($i = 0, $j = $numPoints - 1; $i < $numPoints; $j = $i++) {
        $xi = $polygon[$i][0];
        $yi = $polygon[$i][1];
        $xj = $polygon[$j][0];
        $yj = $polygon[$j][1];
        $intersect = (($yi > $y) != ($yj > $y)) &&
                     ($x < ($xj - $xi) * ($y - $yi) / (($yj - $yi) ?: 0.0000001) + $xi);
        if ($intersect) $inside = !$inside;
    }
    return $inside;
}

if (isset($_GET['lat']) && isset($_GET['lng'])) {
    $lat = floatval($_GET['lat']);
    $lng = floatval($_GET['lng']);
    $geojsonPath = '../js/countryBorders.geojson';
    if (!file_exists($geojsonPath)) {
        echo json_encode(['error' => "GeoJSON file not found."]);
        exit;
    }
    $geojson = file_get_contents($geojsonPath);
    $data = json_decode($geojson, true);
    if ($data === null) {
        echo json_encode(['error' => "Invalid GeoJSON data."]);
        exit;
    }
    $features = $data['features'];
    $found = false;
    foreach ($features as $feature) {
        $geometry = $feature['geometry'];
        if ($geometry['type'] == 'Polygon') {
            foreach ($geometry['coordinates'] as $polygon) {
                if (pointInPolygon(['lat' => $lat, 'lng' => $lng], $polygon)) {
                    echo json_encode(['iso_code' => $feature['properties']['iso_a2']]);
                    $found = true;
                    break 2;
                }
            }
        } elseif ($geometry['type'] == 'MultiPolygon') {
            foreach ($geometry['coordinates'] as $multiPolygon) {
                foreach ($multiPolygon as $polygon) {
                    if (pointInPolygon(['lat' => $lat, 'lng' => $lng], $polygon)) {
                        echo json_encode(['iso_code' => $feature['properties']['iso_a2']]);
                        $found = true;
                        break 3;
                    }
                }
            }
        }
    }
    if (!$found) {
        echo json_encode(['error' => 'Country ISO code not found']);
    }
} else {
    echo json_encode(['error' => 'Invalid coordinates']);
}
