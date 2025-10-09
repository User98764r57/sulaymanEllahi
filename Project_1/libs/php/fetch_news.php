<?php
header('Content-Type: application/json');

if (isset($_GET['iso_code'])) {
    $isoCode = strtolower($_GET['iso_code']);
    $apiKey = "";
    
    $currentDate = date('Y-m-d');
    
    $apiURL = "https://api.goperigon.com/v1/all?sourceCountry={$isoCode}&from={$currentDate}&to={$currentDate}&apiKey={$apiKey}";

    $response = file_get_contents($apiURL);

    if (!$response) {
        echo json_encode(['error' => 'Unable to fetch news data.']);
        exit;
    }

    $newsData = json_decode($response, true);
    
    if (!isset($newsData['articles']) || empty($newsData['articles'])) {
        echo json_encode([['title' => 'No recent news articles found for this country today.', 'url' => '#', 'domain' => 'No News Available', 'image' => 'https://via.placeholder.com/150']]);
        exit;
    }

    $formattedNews = [];

    foreach ($newsData['articles'] as $article) {
        $formattedNews[] = [
            'title' => $article['title'] ?? 'No Title',
            'url' => $article['url'] ?? '#',
            'domain' => $article['source']['domain'] ?? 'Unknown',
            'image' => $article['imageUrl'] ?? 'https://via.placeholder.com/150'
        ];
    }

    echo json_encode($formattedNews);
} else {
    echo json_encode(['error' => 'No ISO code provided.']);
    exit;
}
