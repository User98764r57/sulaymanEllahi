<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (isset($_GET['lat']) && isset($_GET['lng'])) {
    $lat = $_GET['lat'];
    $lng = $_GET['lng'];
    $apiKey = '62284da8879dda81148a13a700fa244f';

    $currentUrl = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lng}&appid={$apiKey}&units=metric";
    $currentResponse = file_get_contents($currentUrl);

    if ($currentResponse === FALSE) {
        echo json_encode(['error' => 'Unable to fetch weather data.']);
    } else {
        $currentWeatherData = json_decode($currentResponse, true);

        $currentData = [];
        if ($currentWeatherData && isset($currentWeatherData['main'])) {
            $currentData = [
                'city_name' => $currentWeatherData['name'],
                'country_code' => $currentWeatherData['sys']['country'],
                'timezone' => $currentWeatherData['timezone'],
                'weather' => $currentWeatherData['weather'][0]['main'],
                'description' => $currentWeatherData['weather'][0]['description'],
                'temperature_c' => round($currentWeatherData['main']['temp'], 2),
                'temperature_f' => round(($currentWeatherData['main']['temp'] * 9/5) + 32, 2),
                'temperature_k' => round($currentWeatherData['main']['temp'] + 273.15, 2),
                'pressure' => $currentWeatherData['main']['pressure'],
                'humidity' => $currentWeatherData['main']['humidity'],
                'wind_speed_m_s' => round($currentWeatherData['wind']['speed'], 2),
                'wind_speed_mph' => round($currentWeatherData['wind']['speed'] * 2.23694, 2),
                'wind_direction' => $currentWeatherData['wind']['deg'],
                'clouds' => $currentWeatherData['clouds']['all'],
                'rain' => isset($currentWeatherData['rain']['1h']) ? round($currentWeatherData['rain']['1h'], 2) : null,
                'snow' => isset($currentWeatherData['snow']['1h']) ? round($currentWeatherData['snow']['1h'], 2) : null,
                'precipitation' => isset($currentWeatherData['rain']['1h']) ? round($currentWeatherData['rain']['1h'], 2) : (isset($currentWeatherData['snow']['1h']) ? round($currentWeatherData['snow']['1h'], 2) : null)
            ];
        } else {
            echo json_encode(['error' => 'Weather data not available.']);
            exit;
        }

        $forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lng}&appid={$apiKey}&units=metric";
        $forecastResponse = file_get_contents($forecastUrl);

        if ($forecastResponse === FALSE) {
            echo json_encode(['error' => 'Unable to fetch forecast data.']);
        } else {
            $forecastData = json_decode($forecastResponse, true);
            
            $forecastDetails = [];
            if (isset($forecastData['list'])) {
                $todayDate = date('Y-m-d');
                $forecastedDates = [];
                
                foreach ($forecastData['list'] as $forecast) {
                    $date = date('Y-m-d', strtotime($forecast['dt_txt']));

                    if (!in_array($date, $forecastedDates) && count($forecastedDates) < 3) {
                        $forecastedDates[] = $date;

                        $forecastDetails[] = [
                            'date' => $date,
                            'temperature_c' => round($forecast['main']['temp'], 2),
                            'temperature_f' => round(($forecast['main']['temp'] * 9/5) + 32, 2),
                            'temperature_k' => round($forecast['main']['temp'] + 273.15, 2),
                            'wind_speed_m_s' => round($forecast['wind']['speed'], 2),
                            'wind_speed_mph' => round($forecast['wind']['speed'] * 2.23694, 2),
                            'weather' => $forecast['weather'][0]['main'],
                            'description' => $forecast['weather'][0]['description'],
                            'rain' => isset($forecast['rain']['1h']) ? round($forecast['rain']['1h'], 2) : null,
                            'snow' => isset($forecast['snow']['1h']) ? round($forecast['snow']['1h'], 2) : null,
                            'precipitation' => isset($forecast['rain']['1h']) ? round($forecast['rain']['1h'], 2) : (isset($forecast['snow']['1h']) ? round($forecast['snow']['1h'], 2) : null)
                        ];
                    }
                }
            }

            $responseData = array_merge($currentData, ['forecast' => $forecastDetails]);
            echo json_encode($responseData);
        }
    }
} else {
    echo json_encode(['error' => 'Invalid request.']);
}
