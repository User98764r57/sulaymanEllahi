let marker = null;
let userCountryLayer = null;
let userLocationFound = false;
let geoJsonLoaded = false;

function checkLoadingComplete() {
    if (userLocationFound && geoJsonLoaded) {
        document.getElementById('preloader').style.display = 'none';
        setTimeout(() => {
            if (userCountryLayer) {
                map.fitBounds(userCountryLayer.getBounds());
            }
        }, 1000);
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
    attribution: '© OpenStreetMap contributors',
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

const baseMaps = {
    "Streets": Streets,
    "Satellite": Esri_WorldImagery
};

const overlayMaps = {};

const cityClusterGroup = L.markerClusterGroup();
const weatherClusterGroup = L.markerClusterGroup();

const cityIcon = L.divIcon({
    className: 'custom-city-icon',
    html: '<span style="font-size: 24px; color: blue;">🏙️</span>',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

const weatherIcon = L.divIcon({
    className: 'custom-weather-icon',
    html: '<span style="font-size: 24px; color: grey;">☁️</span>',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

function populateCountryDropdown() {
    const dropdown = document.getElementById('countryDropdown');

    fetch('libs/php/fetch_countries.php')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                data.forEach(country => {
                    const option = document.createElement('option');
                    option.value = country.isoCode;
                    option.textContent = country.name;
                    dropdown.appendChild(option);
                });
            } else {
                console.error('Error fetching countries:', data.error);
            }
        })
        .catch(error => console.error('Error fetching countries:', error.message));
}

function fetchCitiesByIsoCode(isoCode) {
    const url = `libs/php/fetch_cities.php?isoCode=${isoCode}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                cityClusterGroup.clearLayers();
                data.forEach(city => {
                    const cityName = city.City || 'Unknown City';
                    const latitude = city.Coordinates?.Latitude;
                    const longitude = city.Coordinates?.Longitude;
                    if (latitude && longitude) {
                        const marker = L.marker([parseFloat(latitude), parseFloat(longitude)], { icon: cityIcon })
                            .bindPopup(`<b>${cityName}</b><br>Country: ${city.Country}<br>Latitude: ${latitude}<br>Longitude: ${longitude}`);
                        cityClusterGroup.addLayer(marker);
                    }
                });
                map.addLayer(cityClusterGroup);
            } else {
                console.error('No cities found for the selected ISO code.');
            }
        })
        .catch(error => console.error('Error fetching city data:', error.message));
}

function fetchAndAddWeatherMarkers(isoCode) {
    const url = 'libs/php/fetch_weatherData.php';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            weatherClusterGroup.clearLayers();
            if (Array.isArray(data.weather)) {
                const filteredWeather = data.weather.filter(observation => observation.countryCode === isoCode);
                filteredWeather.forEach(observation => {
                    const lat = parseFloat(observation.lat);
                    const lng = parseFloat(observation.lng);
                    const temperature = observation.temperature || 'N/A';
                    const humidity = observation.humidity || 'N/A';
                    const stationName = observation.stationName || 'Unknown Station';
                    const datetime = observation.datetime || 'N/A';
                    const formattedTemperature = numeral(temperature).format('0.0') + '°C';
                    const formattedHumidity = numeral(humidity).format('0,0') + '%';
                    const formattedDateTime = new Date(datetime).toString('MMMM d, yyyy h:mm tt');
                    const marker = L.marker([lat, lng], { icon: weatherIcon })
                        .bindPopup(
                            `<b>${stationName}</b><br>
                            Temperature: ${formattedTemperature}<br>
                            Humidity: ${formattedHumidity}<br>
                            Date & Time: ${formattedDateTime}`
                        );
                    weatherClusterGroup.addLayer(marker);
                });
                map.addLayer(weatherClusterGroup);
            }
        })
        .catch(error => console.error('Error fetching weather data:', error.message));
}

document.getElementById('countryDropdown').addEventListener('change', function () {
    const selectedIsoCode = this.value;
    if (selectedIsoCode) {
        fetchCitiesByIsoCode(selectedIsoCode);
        fetchAndAddWeatherMarkers(selectedIsoCode);
    } else {
        cityClusterGroup.clearLayers();
        weatherClusterGroup.clearLayers();
    }
});

let geoJsonLayer;
let previouslyHighlightedLayer = null;

document.getElementById('infoButton').addEventListener('click', () => {
    const isoCode = document.getElementById('countryDropdown').value;
    if (isoCode !== "none") {
        fetchCountryInformation(isoCode);
        $('#countryModal').modal('show');
    }
});

document.getElementById('weatherButton').addEventListener('click', () => {
    const isoCode = document.getElementById('countryDropdown').value;
    if (isoCode !== "none") {
        fetchWeatherDataByISO(isoCode);
        $('#weatherModal').modal('show');
    }
});

document.getElementById('currencyButton').addEventListener('click', () => {
    const isoCode = document.getElementById('countryDropdown').value;
    if (isoCode !== "none") {
        $('#currencyModal').modal('show');
    }
});

$('#currencyModal').on('show.bs.modal', function () {
    const isoCode = document.getElementById('countryDropdown').value;
    if (isoCode !== "none") {
        fetchCurrencyDataByISO(isoCode);
    }
});

document.getElementById('wikiButton').addEventListener('click', () => {
    const isoCode = document.getElementById('countryDropdown').value;
    if (isoCode !== "none") {
        fetchWikipediaDataByISO(isoCode);
        $('#wikiModal').modal('show');
    }
});

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

populateCountryDropdown();

overlayMaps["Major Cities"] = cityClusterGroup;
overlayMaps["Weather Stations"] = weatherClusterGroup;

L.control.layers(baseMaps, overlayMaps).addTo(map);
Streets.addTo(map);

fetch('libs/js/countryBorders.geojson')
    .then(response => response.json())
    .then(data => {
        geoJsonLayer = L.geoJSON(data, {
            style: function (feature) {
                return {
                    fillColor: 'transparent',
                    color: 'transparent',
                    weight: 1,
                    fillOpacity: 0.5
                };
            }
        }).addTo(map);
        map.fitBounds(geoJsonLayer.getBounds());

        const dropdown = document.getElementById('countryDropdown');

        data.features.sort((a, b) => a.properties.name.localeCompare(b.properties.name));

        const noneOption = document.createElement('option');
        noneOption.value = "none";
        noneOption.textContent = "Select a country";
        dropdown.appendChild(noneOption);

        data.features.forEach(country => {
            const option = document.createElement('option');
            option.value = country.properties.iso_a2;
            option.textContent = country.properties.name;
            dropdown.appendChild(option);
        });
    })
    .catch(error => {
        console.error("Error loading GeoJSON:", error);
    });

map.on('zoomend', function () {
    if (map.getZoom() < 2) {
        map.setZoom(2);
    }
});

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
    fetchCitiesByIsoCode(isoCode);
    fetchAndAddWeatherMarkers(isoCode);
}

getUserLocationISO();

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

    function fetchCountryInformation(isoCode) {
        $.ajax({
            url: 'libs/php/fetch_data.php',
            type: 'GET',
            data: { iso_code: isoCode },
            dataType: 'json',
            success: function (data) {
                if (data.error) {
                    alert(data.error);
                    return;
                }
    
                const countryInfo = `
                    <div style="text-align: center; font-size: 48px;">
                        ${data.flag || 'N/A'}
                    </div>
                    <table>
                        <tr>
                            <th>Name</th>
                            <td>${data.country || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Capital City</th>
                            <td>${data.capital || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Population</th>
                            <td>${data.population ? numeral(data.population).format('0,0') : 'N/A'}</td>
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
        
    function fetchWeatherDataByISO(isoCode) {
        $.ajax({
            url: 'libs/php/geo_weather.php',
            type: 'GET',
            data: { iso_code: isoCode },
            dataType: 'json',
            success: function (data) {
                if (data.error) {
                    alert(data.error);
                    return;
                }
    
                document.getElementById('weatherModalHeader').innerText = `${data.region}, ${data.country}`;
    
                let currentWeatherTable = `
                    <table class="weather-table">
                        <thead>
                            <tr>
                                <th colspan="3" class="weather-header">TODAY</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><img src="${data.current_weather.icon}" alt="${data.current_weather.description}" class="weather-icon" /></td>
                                <td class="weather-description">${data.current_weather.description}</td>
                                <td class="weather-temperature"><strong>${data.current_weather.temperature ? Math.round(data.current_weather.temperature) + '°C' : 'N/A'}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                `;
    
                let forecastTables = data.forecast
                    .map((forecast) => {
                        const forecastDate = new Date(forecast.date);
                        const options = { weekday: "long", month: "long", day: "numeric" };
                        const formattedDate = forecastDate.toLocaleDateString("en-US", options);
    
                        return `
                            <table class="weather-table">
                                <thead>
                                    <tr>
                                        <th colspan="3" class="weather-header">${formattedDate}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><img src="${forecast.icon}" alt="${forecast.description}" class="weather-icon" /></td>
                                        <td class="weather-description">${forecast.description}</td>
                                        <td class="weather-temperature"><strong>${forecast.temperature ? Math.round(forecast.temperature) + '°C' : 'N/A'}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        `;
                    })
                    .join('');
    
                document.getElementById('weatherModalContent').innerHTML = currentWeatherTable + forecastTables;
                showModal('weatherModal');
            },
            error: function (xhr, status, error) {
                console.error('Error fetching weather data:', error);
                alert('Error fetching weather data. Check the console for details.');
            }
        });
    }                    
        
    function fetchCurrencyDataByISO(isoCode) {
        $.ajax({
            url: 'libs/php/fetch_data.php',
            type: 'GET',
            data: { iso_code: isoCode },
            dataType: 'json',
            success: function (data) {
                const currencyCode = data.currency.split(' / ')[2];
                loadCurrencyOptions(currencyCode);
    
                const currencyInfo = `
                    <table>
                        <tr>
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
                            </td>
                        </tr>
                    </table>
                `;
    
                document.getElementById('currencyModalContent').innerHTML = currencyInfo;
                showModal('currencyModal');
    
                loadCurrencyOptions(currencyCode).then(() => {
                    setupAutomaticCurrencyConversion();
                    triggerInitialConversion(); 
                });
            },
            error: function (error) {
                console.error('Error fetching currency data:', error);
                alert('Error fetching currency data. Check the console for details.');
            }
        });
    }
    
    function loadCurrencyOptions(defaultCurrency) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'libs/php/load_currency_options.php',
                type: 'GET',
                dataType: 'json',
                success: function (data) {
                    if (data.error) {
                        alert(data.error);
                        reject(data.error);
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
    
                    resolve();
                },
                error: function (error) {
                    console.error("Error fetching currencies:", error);
                    alert("Error loading currency options. Check the console for details.");
                    reject(error);
                }
            });
        });
    }
    
    function setupAutomaticCurrencyConversion() {
        const conversionAmountInput = document.getElementById('conversion-amount');
        const fromCurrencyDropdown = document.getElementById('from-currency');
        const toCurrencyDropdown = document.getElementById('to-currency');
    
        const triggerConversion = () => {
            const fromCurrency = fromCurrencyDropdown.value;
            const toCurrency = toCurrencyDropdown.value;
            const amount = conversionAmountInput.value || 1;
    
            $.ajax({
                url: 'libs/php/fetch_data.php',
                type: 'GET',
                data: { from: fromCurrency, to: toCurrency, amount: amount },
                dataType: 'json',
                success: function (response) {
                    if (response.error) {
                        alert(response.error);
                    } else {
                        updateConversionResult(response.convertedAmount);
                    }
                },
                error: function (error) {
                    console.error('Error fetching currency conversion:', error);
                    alert('Error fetching currency conversion. Check the console for details.');
                }
            });
        };
    
        conversionAmountInput.addEventListener('input', triggerConversion);
        fromCurrencyDropdown.addEventListener('change', triggerConversion);
        toCurrencyDropdown.addEventListener('change', triggerConversion);
    
        window.triggerInitialConversion = triggerConversion; 
    }
    
    function updateConversionResult(rate) {
        const resultElement = document.getElementById('conversion-result');
    
        if (rate && !isNaN(rate)) {
            resultElement.textContent = `Result: ${numeral(rate).format('0,0.00')}`;
        } else {
            resultElement.textContent = 'Result: --';
        }
    }        
    
    function fetchWikipediaDataByISO(isoCode) {
        $.ajax({
            url: 'libs/php/fetch_data.php',
            type: 'GET',
            data: { iso_code: isoCode },
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
    
    function fetchNewsByISO(isoCode) {
        $.ajax({
            url: 'libs/php/fetch_news.php',
            type: 'GET',
            data: { iso_code: isoCode },
            dataType: 'json',
            success: function (data) {
                if (data.error) {
                    alert(data.error);
                    return;
                }
    
                let newsHtml = ''; 
    
                data.forEach(news => {
                    newsHtml += `
                        <div class="news-item">
                            <img src="${news.image}" alt="News Image" class="news-image">
                            <div class="news-content">
                                <a href="${news.url}" target="_blank" class="news-title">
                                    ${news.title}
                                </a>
                                <p class="news-domain">
                                    ${news.domain}
                                </p>
                            </div>
                        </div>
                    `;
                });
    
                document.getElementById('newsModalContent').innerHTML = newsHtml;
                showModal('newsModal');
            },
            error: function (error) {
                console.error('Error fetching news:', error);
                alert('Error fetching news. Check console for details.');
            }
        });
    }        
    
    document.getElementById('newsButton').addEventListener('click', () => {
        const isoCode = document.getElementById('countryDropdown').value;
        if (isoCode !== "none") {
            fetchNewsByISO(isoCode);
            $('#newsModal').modal('show');
        }
    });
    
    function showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }
    
    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
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
    