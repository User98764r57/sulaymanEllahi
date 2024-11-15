let marker = null;
let clickedLatLng = null;
let userCountryLayer = null;
let userLocationFound = false;
let geoJsonLoaded = false;

function checkLoadingComplete() {
    if (userLocationFound && geoJsonLoaded) {
        document.getElementById('preloader').style.display = 'none';
    }
}

document.getElementById('preloader').style.display = 'flex';

const map = L.map('map', {
    minZoom: 2,
    maxZoom: 18,
    worldCopyJump: true,
    inertia: true,
    inertiaDeceleration: 2000,
    zoomAnimation: true,
    zoomSnap: 1,
    zoomDelta: 5,
    wheelPxPerZoomLevel: 120, 
    zoomControl: true
}).setView([20, 0], 2);

const Streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© OpenStreetMap contributors',
    noWrap: false,
    tileSize: 256,
    updateWhenIdle: true,
    keepBuffer: 8,
    edgeBufferTiles: 4,
    unloadInvisibleTiles: true,
    reuseTiles: true
});

const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Source: Esri, USGS, NOAA',
    noWrap: false,
    tileSize: 256,
    updateWhenIdle: true,
    keepBuffer: 8,
    edgeBufferTiles: 4,
    unloadInvisibleTiles: true,
    reuseTiles: true
});

const Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Source: Esri, National Geographic',
    noWrap: false,
    tileSize: 256,
    updateWhenIdle: true,
    keepBuffer: 8,
    edgeBufferTiles: 4,
    unloadInvisibleTiles: true,
    reuseTiles: true
});

const Jawg_Matrix = L.tileLayer('https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=DSkywDmZAwXD3dsZbUNfIFHJvAUqdSVtMDe5eAbdJYhZUXJcg72lCMDNuqpf91UT', {
    attribution: 'Map data ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© Jawg Maps',
    noWrap: false,
    tileSize: 256,
    updateWhenIdle: true,
    keepBuffer: 8,
    edgeBufferTiles: 4,
    unloadInvisibleTiles: true,
    reuseTiles: true
});

const WaymarkedTrails_hiking = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data: &copy; OpenStreetMap contributors | Map style: &copy; waymarkedtrails.org (CC-BY-SA)'
});

const WaymarkedTrails_cycling = L.tileLayer('https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data: &copy; OpenStreetMap contributors | Map style: &copy; waymarkedtrails.org (CC-BY-SA)'
});

const WaymarkedTrails_slopes = L.tileLayer('https://tile.waymarkedtrails.org/slopes/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data: &copy; OpenStreetMap contributors | Map style: &copy; waymarkedtrails.org (CC-BY-SA)'
});

const OpenRailwayMap = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data: &copy; OpenStreetMap contributors | Map style: &copy; OpenRailwayMap (CC-BY-SA)'
});

const Stadia_StamenTonerLines = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; Stadia Maps, Stamen Design, OpenMapTiles, OpenStreetMap contributors',
    ext: 'png'
});

const baseMaps = {
    "Streets": Streets,
    "Topography": Esri_WorldImagery,
    "Vintage": Esri_NatGeoWorldMap,
    "Matrix": Jawg_Matrix
};

const overlayMaps = {
    "Hiking Trails": WaymarkedTrails_hiking,
    "Cycling Trails": WaymarkedTrails_cycling,
    "Sloping Trails": WaymarkedTrails_slopes,
    "Railways": OpenRailwayMap,
    "Terrain Lines": Stadia_StamenTonerLines
};

L.control.layers(baseMaps, overlayMaps).addTo(map);

Streets.addTo(map);

const southWest = L.latLng(-85, -Infinity);
const northEast = L.latLng(85, Infinity);
const verticalBounds = L.latLngBounds(southWest, northEast);
map.setMaxBounds(verticalBounds);

map.on('drag', function () {
    map.panInsideBounds(verticalBounds, { animate: false });
});

map.on('zoomend', function () {
    if (map.getZoom() < 2) {
        map.setZoom(2);
    }
});

map.on('click', function (e) {
    clickedLatLng = e.latlng;
    marker = L.marker(clickedLatLng).addTo(map);
    fetchCountryDataWithFlag(clickedLatLng.lat, clickedLatLng.lng);
});

document.getElementById('infoButton').onclick = function () {
    const lat = clickedLatLng ? clickedLatLng.lat : (userLocationFound ? userLat : 0);
    const lng = clickedLatLng ? clickedLatLng.lng : (userLocationFound ? userLng : 0);
    fetchCountryData(lat, lng);
};

document.getElementById('weatherButton').onclick = function () {
    const lat = clickedLatLng ? clickedLatLng.lat : (userLocationFound ? userLat : 0);
    const lng = clickedLatLng ? clickedLatLng.lng : (userLocationFound ? userLng : 0);
    fetchWeatherData(lat, lng);
};

document.getElementById('currencyButton').onclick = function () {
    const lat = clickedLatLng ? clickedLatLng.lat : (userLocationFound ? userLat : 0);
    const lng = clickedLatLng ? clickedLatLng.lng : (userLocationFound ? userLng : 0);
    fetchCurrencyData(lat, lng);
};

document.getElementById('wikiButton').onclick = function () {
    const lat = clickedLatLng ? clickedLatLng.lat : (userLocationFound ? userLat : 0);
    const lng = clickedLatLng ? clickedLatLng.lng : (userLocationFound ? userLng : 0);
    fetchWikipediaData(lat, lng);
};

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function fetchCountryDataWithFlag(lat, lng) {
    $.ajax({
        url: 'libs/php/fetch_data.php',
        type: 'GET',
        data: { lat: lat, lng: lng },
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error);
                return;
            }

            if (data.flag) { 
                const flagIcon = L.divIcon({
                    html: `<div style="border: 1px solid #333; padding: 1px; background-color: #fff; box-shadow: 1px 1px 1px rgba(0,0,0,0.3); border-radius: 1px; font-size: 30px; text-align: center;">
                                ${data.flag}
                           </div>`,
                    className: 'flag-icon',
                    iconSize: [50, 35], 
                    iconAnchor: [25, 17]
                });
                marker.setIcon(flagIcon);
            }
        },
        error: function (error) {
            console.error('Error fetching data from PHP:', error);
            alert('Error fetching data from PHP. Check the console for details.');
        }
    });
}

let geoJsonLayer;
let previouslyHighlightedLayer = null;

fetch('libs/js/countryBorders.geojson')
    .then(response => response.json())
    .then(data => {
        geoJsonLoaded = true;
        const dropdown = document.getElementById('countryDropdown');
        
        geoJsonLayer = L.geoJSON(data, {
            style: function(feature) {
                return {
                    fillColor: 'transparent', 
                    color: 'transparent', 
                    weight: 1,
                    fillOpacity: 0.5
                };
            }
        }).addTo(map); 

        data.features.sort((a, b) => a.properties.name.localeCompare(b.properties.name));

        data.features.forEach(country => {
            const option = document.createElement('option');
            option.value = country.properties.iso_a2;
            option.textContent = country.properties.name;
            dropdown.appendChild(option);
        });
    })
    .catch(error => console.error("Error loading GeoJSON:", error));

document.getElementById('countryDropdown').addEventListener('change', function() {
    const selectedISOCode = this.value;
    
    if (selectedISOCode === "none") {
        if (previouslyHighlightedLayer) {
            previouslyHighlightedLayer.setStyle({
                fillColor: 'transparent',
                fillOpacity: 0.5,
                color: 'transparent' 
            });
            previouslyHighlightedLayer = null;
        }
    } else {
        fetchCountryDataByISO(selectedISOCode);
    }
});

function fetchCountryDataByISO(isoCode) {
    $.ajax({
        url: 'libs/php/iso_code.php',
        type: 'GET',
        data: { iso_code: isoCode },
        dataType: 'json', 
        success: function(data) {
            if (data.country_code) {
                highlightCountryOnMap(data.country_code);
            } else {
                console.error(data.error || "No data found.");
            }
        },
        error: function(error) {
            console.error("Error fetching data:", error);
        }
    });    
}

function highlightCountryOnMap(countryCode) {
    if (!geoJsonLayer) {
        console.error("GeoJSON layer not found. Make sure to load the GeoJSON data first.");
        return;
    }

    if (previouslyHighlightedLayer) {
        previouslyHighlightedLayer.setStyle({
            fillColor: 'transparent',
            fillOpacity: 0.5,
            color: 'transparent' 
        });
    }

    const countryLayer = geoJsonLayer.getLayers().find(layer => {
        return layer.feature.properties.iso_a2 === countryCode;
    });

    if (countryLayer) {

        countryLayer.setStyle({
            fillColor: 'red', 
            fillOpacity: 0.6, 
            color: '#000', 
            weight: 1 
        });

        previouslyHighlightedLayer = countryLayer;

        map.fitBounds(countryLayer.getBounds());
    } else {
        console.error("Country not found in GeoJSON layer.");
    }
}

function getUserLocationISO() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                fetchISOCodeByCoordinates(lat, lng);
            },
            function (error) {
                console.error('Error getting user location:', error);
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function fetchISOCodeByCoordinates(lat, lng) {

    $.ajax({
        url: 'libs/php/get_iso_code.php',
        type: 'GET',
        data: { lat: lat, lng: lng },
        dataType: 'json',
        success: function (data) {
            if (data && data.iso_code) {
                setDropdownToUserCountry(data.iso_code);
            } else {
                console.error("ISO code not found for coordinates.");
            }
        },
        error: function (error) {
            console.error("Error fetching ISO code:", error);
        }
    });
}

function setDropdownToUserCountry(isoCode) {
    const dropdown = document.getElementById('countryDropdown');
    dropdown.value = isoCode;
    highlightCountryOnMap(isoCode); 
}

getUserLocationISO();

document.getElementById('countryDropdown').addEventListener('change', function() {
    const selectedISOCode = this.value;
    if (selectedISOCode !== "none") fetchCountryDataByISO(selectedISOCode);
});

fetch('libs/js/countryBorders.geojson')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        geoJsonLoaded = true;
        checkLoadingComplete(); 
    })
    .catch(error => {
        console.error('Error loading GeoJSON:', error);
        alert('Error loading GeoJSON file. Check the console for details.');
        checkLoadingComplete(); 
    });
    
    function showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }
    
    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
    
    function showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }
    
    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
    
    function fetchCountryData(lat, lng) {
        $.ajax({
            url: 'libs/php/fetch_data.php',
            type: 'GET',
            data: { lat: lat, lng: lng },
            dataType: 'json',
            success: function (data) {
                if (data.error) {
                    alert(data.error);
                    return;
                }
    
                const countryInfo = `
                    <table>
                        <tr>
                            <th>Name</th>
                            <td style="color: #D9534F;">${data.country || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Capital City</th>
                            <td style="color: #5CB85C;">${data.capital || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Population</th>
                            <td>${data.population || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Currency</th>
                            <td>${data.currency || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Continent</th>
                            <td>${data.continent || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Region</th>
                            <td>${data.region || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Language/s</th>
                            <td>${data.languages || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Date and Time</th>
                            <td>${data.timezone || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Flag</th>
                            <td>${data.flag || 'N/A'}</td>
                        </tr>
                    </table>
                `;
    
                document.getElementById('countryModalContent').innerHTML = countryInfo;
                showModal('countryModal');
            },
            error: function (error) {
                console.error('Error fetching data from PHP:', error);
                alert('Error fetching data from PHP. Check the console for details.');
            }
        });
    }
    
    function fetchWeatherData(lat, lng) {
        $.ajax({
            url: 'libs/php/geo_weather.php',
            type: 'GET',
            data: { lat: lat, lng: lng },
            dataType: 'json',
            success: function (data) {
                const weatherEmojis = {
                    'Clear': '🌅',
                    'Clouds': '☁️',
                    'Rain': '🌧️',
                    'Snow': '🌨️',
                    'Thunderstorm': '⛈️',
                    'Drizzle': '🌦️',
                    'Mist': '💧',
                    'Fog': '🌫️',
                    'Haze': '🌁'
                };
    
                const weatherIcon = weatherEmojis[data.weather] || '⛅️';
    
                const weatherInfo = `
                    <div><strong>Temperature:</strong> ${data.temperature_c || 'N/A'}°C / ${data.temperature_f || 'N/A'}°F</div>
                    <div><strong>Description:</strong> ${data.weather || 'N/A'} ${weatherIcon}</div>
                    <div><strong>Humidity:</strong> ${data.humidity || 'N/A'}%</div>
                    <div><strong>Wind Speed:</strong> ${data.wind_speed_m_s || 'N/A'} m/s (${data.wind_speed_mph || 'N/A'} mph)</div>
                    <div><strong>Pressure:</strong> ${data.pressure || 'N/A'} hPa</div>
                    <div><strong>Clouds:</strong> ${data.clouds || 'N/A'}%</div>
                `;
    
                let forecastInfo = '<div><strong>3-Day Forecast:</strong></div>';
                const forecastData = data.forecast || [];
    
                forecastData.forEach((forecast, index) => {
                    const date = new Date(forecast.date);
                    const dayOfWeek = date.toLocaleString('en-us', { weekday: 'long' });
                    const weatherEmoji = weatherEmojis[forecast.weather] || '⛅️';
    
                    forecastInfo += `
                        <div><strong>${dayOfWeek}, ${forecast.date}</strong> ${weatherEmoji}</div>
                        <div>Temperature: ${forecast.temperature_c}°C / ${forecast.temperature_f}°F</div>
                        <div>Description: ${forecast.description}</div>
                        <div>Weather: ${forecast.weather}</div>
                    `;
                });
    
                const fullWeatherInfo = `
                    <div class="weather-header">
                        <h3><strong>${data.city_name || 'Unknown City'}</strong>, ${data.country_code}</h3>
                    </div>
                    <div class="current-weather">
                        ${weatherInfo}
                    </div>
                    <div class="forecast-info">
                        ${forecastInfo}
                    </div>
                    <button class="close-btn" onclick="closeModal('weatherModal')">Close</button>
                `;
    
                document.getElementById('weatherModalContent').innerHTML = fullWeatherInfo;
                showModal('weatherModal');
            },
            error: function (xhr, status, error) {
                console.error('Error fetching weather data:', error);
                alert('Error fetching weather data. Check the console for details.');
            }
        });
    }
        
    function fetchCurrencyData(lat, lng) {
        $.ajax({
            url: 'libs/php/fetch_data.php',
            type: 'GET',
            data: { lat: lat, lng: lng },
            dataType: 'json',
            success: function (data) {
                const currencyCode = data.currency.split(' / ')[2];
                loadCurrencyOptions(currencyCode);
    
                const currencyInfo = `
                    <table>
                        <tr>
                            <td>Currency Converter</td>
                            <td class="currency-row">
                                <input type="number" id="conversion-amount" placeholder="Amount" value="1" min="1">
                                <div class="currency-selector">
                                    <label for="from-currency">From</label>
                                    <select id="from-currency"></select>
                                </div>
                                <div class="currency-selector">
                                    <label for="to-currency">To</label>
                                    <select id="to-currency"></select>
                                </div>
                                <span id="conversion-result">Result: --</span>
                                <button onclick="convertCurrency()">Convert</button>
                            </td>
                        </tr>
                    </table>
                `;
    
                document.getElementById('currencyModalContent').innerHTML = currencyInfo;
                showModal('currencyModal');
            },
            error: function (error) {
                console.error('Error fetching currency data:', error);
                alert('Error fetching currency data. Check the console for details.');
            }
        });
    }
    
    function loadCurrencyOptions(defaultCurrency) {
        $.ajax({
            url: 'libs/php/load_currency_options.php', 
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data.error) {
                    alert(data.error);
                    return;
                }
    
                const currencies = data.currencies;
                const fromDropdown = document.getElementById('from-currency');
                const toDropdown = document.getElementById('to-currency');
    
                currencies.forEach(currency => {
                    const option = `<option value="${currency}" ${currency === defaultCurrency ? 'selected' : ''}>${currency}</option>`;
                    fromDropdown.insertAdjacentHTML('beforeend', option);
                    toDropdown.insertAdjacentHTML('beforeend', option);
                });
            },
            error: function (error) {
                console.error("Error fetching currencies:", error);
                alert("Error loading currency options. Check the console for details.");
            }
        });
    }
    
    function convertCurrency() {
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;
        const amount = document.getElementById('conversion-amount').value || 1;
    
        $.ajax({
            url: 'libs/php/fetch_data.php',
            type: 'GET',
            data: { from: fromCurrency, to: toCurrency, amount: amount },
            dataType: 'json',
            success: function (response) {
                if (response.error) {
                    alert(response.error);
                } else {
                    document.getElementById('conversion-result').textContent = `Result: ${response.convertedAmount}`;
                }
            },
            error: function (error) {
                console.error('Error fetching currency conversion:', error);
                alert('Error fetching currency conversion. Check the console for details.');
            }
        });
    }
    
    function fetchWikipediaData(lat, lng) {
        $.ajax({
            url: 'libs/php/fetch_data.php',
            type: 'GET',
            data: { lat: lat, lng: lng },
            dataType: 'json',
            success: function (data) {
                const wikiLinks = data.wikiTitles || [];
    
                if (wikiLinks.length > 0) {
                    let wikiLinksHtml = '';
                    wikiLinks.forEach(wikiItem => {
                        const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiItem.title)}`;
                        wikiLinksHtml += `
                            <div class="wiki-row">
                                <div class="wiki-link">
                                    <a href="${wikiUrl}" target="_blank">${wikiItem.title}</a>
                                </div>
                                <div class="wiki-summary">
                                    <p>${wikiItem.summary}</p>
                                </div>
                                <div class="wiki-image">
                                    <img src="${wikiItem.thumbnailImg}" alt="${wikiItem.title}" />
                                </div>
                            </div>
                        `;
                    });
    
                    document.getElementById('wikiModalContent').innerHTML = wikiLinksHtml;
                    showModal('wikiModal');
                } else {
                    document.getElementById('wikiModalContent').innerHTML = '<div>No Wikipedia links found</div>';
                    showModal('wikiModal');
                }
            },
            error: function (error) {
                console.error('Error fetching Wikipedia data:', error);
                alert('Error fetching Wikipedia data. Check the console for details.');
            }
        });
    }
    
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
    
                    userLat = lat;
                    userLng = lng;
                    userLocationFound = true;
                    checkLoadingComplete(); 
    
                    marker = L.marker([lat, lng]).addTo(map);
    
                    fetchCountryDataWithFlag(lat, lng);
                    
                    map.setView([lat, lng], 5);
                },
                function (error) {
                    console.error('Error getting user location:', error);
                    alert('Unable to retrieve your location. Showing default map view.');
                    userLocationFound = true;
                    checkLoadingComplete(); 
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
            userLocationFound = true;
            checkLoadingComplete(); 
        }
    }
    
    getUserLocation();
    
