<?php
header('Content-Type: application/json');

if (isset($_GET['iso_code'])) {
    $isoCode = $_GET['iso_code'];
    $apiKey = "c2891d68-a3d3-45ec-a892-181a3e5404b6";
    $apiURL = "https://api.goperigon.com/v1/all?sourceCountry={$isoCode}&apiKey={$apiKey}";
    
    $response = file_get_contents($apiURL);
    
    if (!$response) {
        echo json_encode(['error' => 'Unable to fetch news data.']);
        exit;
    }
    
    $newsData = json_decode($response, true);
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
