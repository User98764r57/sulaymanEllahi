let marker = null;
let userCountryLayer = null;
let userLocationFound = false;
let geoJsonLoaded = false;
let currentRequest = null;
let activeModal = null;

const southWest = L.latLng(-85, -Infinity);
const northEast = L.latLng(85, Infinity);
const bounds = L.latLngBounds(southWest, northEast);

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
    zoomControl: true,
    maxBounds: bounds,
    maxBoundsViscosity: 0.5
}).setView([20, 0], 2);

map.setMaxBounds(bounds);

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
    html: '<span style="font-size: 24px; color: blue;">&#x1F3D9;&#xFE0F</span>',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

const weatherIcon = L.divIcon({
    className: 'custom-weather-icon',
    html: '<span style="font-size: 24px; color: grey;">&#x26C5;&#xFE0F</span>',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

function populateCountryDropdown() {
    const dropdown = document.getElementById('countryDropdown');
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
            }
        })
        .catch(() => {});
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
        .catch(() => {});
}

document.getElementById('countryDropdown').addEventListener('change', function() {
    const selectedISOCode = this.value;
    
    if (currentRequest) {
        currentRequest.abort();
    }
    
    if (selectedISOCode === "none") {
        clearAllLayers();
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

function clearAllLayers() {
    cityClusterGroup.clearLayers();
    weatherClusterGroup.clearLayers();
    
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
    }
}

let geoJsonLayer;
let previouslyHighlightedLayer = null;

document.getElementById('infoButton').addEventListener('click', function() {
    const isoCode = document.getElementById('countryDropdown').value;
    if (isoCode !== "none") {
        fetchCountryInformation(isoCode);
        $('#countryModal').modal('show');
    }
});

document.getElementById('weatherButton').addEventListener('click', function() {
    const isoCode = document.getElementById('countryDropdown').value;
    if (isoCode !== "none") {
        fetchWeatherDataByISO(isoCode);
        $('#weatherModal').modal('show');
    }
});

document.getElementById('currencyButton').addEventListener('click', function() {
    const isoCode = document.getElementById('countryDropdown').value;
    if (isoCode !== "none") {
        $('#currencyModal').modal('show');
        setTimeout(() => {
            fetchCurrencyDataByISO(isoCode);
        }, 100);
    }
});

document.getElementById('wikiButton').addEventListener('click', function() {
    const isoCode = document.getElementById('countryDropdown').value;
    if (isoCode !== "none") {
        fetchWikipediaDataByISO(isoCode);
        $('#wikiModal').modal('show');
    }
});

document.getElementById('newsButton').addEventListener('click', function() {
    const isoCode = document.getElementById('countryDropdown').value;
    if (isoCode !== "none") {
        fetchNewsByISO(isoCode);
        $('#newsModal').modal('show');
    }
});

function highlightCountryOnMap(countryCode) {
    if (!geoJsonLayer) {
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
    }
}

populateCountryDropdown();

overlayMaps["Cities"] = cityClusterGroup;
overlayMaps["Airports"] = weatherClusterGroup;

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
    .catch(() => {});

map.on('zoomend', function () {
    if (map.getZoom() < 2) {
        map.setZoom(2);
    }
});

function fetchCountryDataByISO(isoCode) {
    if (currentRequest) {
        currentRequest.abort();
    }
    
    currentRequest = $.ajax({
        url: 'libs/php/iso_code.php',
        type: 'GET',
        data: { iso_code: isoCode },
        dataType: 'json',
        success: function(data) {
            if (data.country_code) {
                highlightCountryOnMap(data.country_code);
                fetchCitiesByIsoCode(isoCode);
                fetchAndAddWeatherMarkers(isoCode);
            }
        },
        error: function() {}
    });    
}

function getUserLocationISO() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                fetchISOCodeByCoordinates(lat, lng);
            },
            function () {}
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
            }
        },
        error: function () {}
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
    .catch(() => {
        alert('Error loading GeoJSON file.');
        checkLoadingComplete();
    });

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function fetchCountryInformation(isoCode) {
    document.getElementById('countryModalContent').innerHTML = '<div class="text-center">Loading...</div>';
    
    $.ajax({
        url: 'libs/php/fetch_data.php',
        type: 'GET',
        data: { iso_code: isoCode },
        dataType: 'json',
        timeout: 10000,
        success: function (data) {
            if (data.error) {
                document.getElementById('countryModalContent').innerHTML = `<div class="text-center text-danger">${data.error}</div>`;
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
        },
        error: function (xhr, status, error) {
            let errorMessage = 'Error fetching data.';
            if (status === 'timeout') {
                errorMessage = 'Request timed out. Please try again.';
            }
            document.getElementById('countryModalContent').innerHTML = `<div class="text-center text-danger">${errorMessage}</div>`;
        }
    });
}

function fetchWeatherDataByISO(isoCode) {
    document.getElementById('weatherModalContent').innerHTML = '<div class="text-center">Loading...</div>';
    
    $.ajax({
        url: 'libs/php/geo_weather.php',
        type: 'GET',
        data: { iso_code: isoCode },
        dataType: 'json',
        timeout: 10000,
        success: function (data) {
            if (data.error) {
                document.getElementById('weatherModalContent').innerHTML = `<div class="text-center text-danger">${data.error}</div>`;
                return;
            }
    
            document.getElementById('weatherModalHeader').innerText = `${data.region}, ${data.country}`;
    
            let currentWeatherTable = `
                <table class="weather-table">
                    <thead>
                        <tr>
                            <th colspan="3" class="weather-header">CURRENT</th>
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
        },
        error: function (xhr, status, error) {
            let errorMessage = 'Error fetching weather data.';
            if (status === 'timeout') {
                errorMessage = 'Weather request timed out. Please try again.';
            }
            document.getElementById('weatherModalContent').innerHTML = `<div class="text-center text-danger">${errorMessage}</div>`;
        }
    });
}

function fetchCurrencyDataByISO(isoCode) {
    console.log('Fetching currency data for:', isoCode);
    
    document.getElementById('currencyModalContent').innerHTML = '<div class="text-center">Loading currency data...</div>';
    
    $.ajax({
        url: 'libs/php/fetch_data.php',
        type: 'GET',
        data: { iso_code: isoCode },
        dataType: 'json',
        timeout: 10000,
        success: function (data) {
            console.log('Currency data received:', data);
            
            if (data.error) {
                document.getElementById('currencyModalContent').innerHTML = `<div class="text-center text-danger">${data.error}</div>`;
                return;
            }

            let toCurrencyCode = 'USD';
            
            if (data.currency && typeof data.currency === 'string') {
                const currencyParts = data.currency.split(' / ');
                if (currencyParts.length >= 3) {
                    toCurrencyCode = currencyParts[2];
                } else {
                    const currencyMatch = data.currency.match(/[A-Z]{3}/);
                    if (currencyMatch) {
                        toCurrencyCode = currencyMatch[0];
                    }
                }
            }
            
            console.log('Target currency code:', toCurrencyCode);

            const currencyInfo = `
                <div class="currency-converter-container">
                    <div class="currency-input-group">
                        <label for="conversion-amount">Amount:</label>
                        <input type="number" id="conversion-amount" placeholder="Enter amount" value="1" min="0" step="0.01" class="form-control">
                    </div>
                    <div class="currency-selector-group">
                        <div class="currency-selector">
                            <label for="from-currency">From:</label>
                            <select id="from-currency" class="form-select">
                                <option value="USD">USD - US Dollar</option>
                            </select>
                        </div>
                        <div class="currency-selector">
                            <label for="to-currency">To:</label>
                            <select id="to-currency" class="form-select">
                                <option value="${toCurrencyCode}">${toCurrencyCode}</option>
                            </select>
                        </div>
                    </div>
                    <div id="conversion-result" class="conversion-result">Enter amount to convert</div>
                </div>
            `;

            document.getElementById('currencyModalContent').innerHTML = currencyInfo;
            
            loadCurrencyOptions('USD', toCurrencyCode);
        },
        error: function (xhr, status, error) {
            console.error('Currency data error:', error);
            let errorMessage = 'Error fetching currency data.';
            if (status === 'timeout') {
                errorMessage = 'Currency request timed out. Please try again.';
            }
            document.getElementById('currencyModalContent').innerHTML = `<div class="text-center text-danger">${errorMessage}</div>`;
        }
    });
}

function loadCurrencyOptions(defaultFromCurrency, defaultToCurrency) {
    console.log('Loading currency options...');
    
    $.ajax({
        url: 'libs/php/load_currency_options.php',
        type: 'GET',
        dataType: 'json',
        timeout: 10000,
        success: function (data) {
            console.log('Currency options received:', data);
            
            if (data.error) {
                console.error('Currency options error:', data.error);
                return;
            }

            const currencies = data.currencies || [];
            const fromDropdown = document.getElementById('from-currency');
            const toDropdown = document.getElementById('to-currency');

            fromDropdown.innerHTML = '';
            toDropdown.innerHTML = '';

            currencies.forEach(currency => {
                const fromOption = document.createElement('option');
                fromOption.value = currency;
                fromOption.textContent = currency;
                if (currency === defaultFromCurrency) {
                    fromOption.selected = true;
                }
                fromDropdown.appendChild(fromOption);
                
                const toOption = document.createElement('option');
                toOption.value = currency;
                toOption.textContent = currency;
                if (currency === defaultToCurrency) {
                    toOption.selected = true;
                }
                toDropdown.appendChild(toOption);
            });

            setupAutomaticCurrencyConversion();
            
            if (window.triggerInitialConversion) {
                window.triggerInitialConversion();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading currency options:', error);
            const basicCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
            const fromDropdown = document.getElementById('from-currency');
            const toDropdown = document.getElementById('to-currency');

            basicCurrencies.forEach(currency => {
                const fromOption = document.createElement('option');
                fromOption.value = currency;
                fromOption.textContent = currency;
                fromDropdown.appendChild(fromOption);
                
                const toOption = document.createElement('option');
                toOption.value = currency;
                toOption.textContent = currency;
                toDropdown.appendChild(toOption);
            });

            setupAutomaticCurrencyConversion();
        }
    });
}

function setupAutomaticCurrencyConversion() {
    const conversionAmountInput = document.getElementById('conversion-amount');
    const fromCurrencyDropdown = document.getElementById('from-currency');
    const toCurrencyDropdown = document.getElementById('to-currency');

    const triggerConversion = () => {
        const fromCurrency = fromCurrencyDropdown.value;
        const toCurrency = toCurrencyDropdown.value;
        const amount = parseFloat(conversionAmountInput.value) || 0;

        if (amount <= 0) {
            document.getElementById('conversion-result').textContent = 'Enter amount to convert';
            return;
        }

        if (fromCurrency === toCurrency) {
            document.getElementById('conversion-result').textContent = 
                `${numeral(amount).format('0,0.00')} ${fromCurrency} = ${numeral(amount).format('0,0.00')} ${toCurrency}`;
            return;
        }

        document.getElementById('conversion-result').textContent = 'Converting...';

        $.ajax({
            url: 'libs/php/fetch_data.php',
            type: 'GET',
            data: { 
                from: fromCurrency, 
                to: toCurrency, 
                amount: amount 
            },
            dataType: 'json',
            timeout: 10000,
            success: function (response) {
                console.log('Conversion response:', response);
                if (response.error) {
                    document.getElementById('conversion-result').textContent = 'Error: ' + response.error;
                    document.getElementById('conversion-result').className = 'conversion-result error';
                } else if (response.convertedAmount) {
                    const converted = parseFloat(response.convertedAmount);
                    document.getElementById('conversion-result').textContent = 
                        `${numeral(amount).format('0,0.00')} ${fromCurrency} = ${numeral(converted).format('0,0.00')} ${toCurrency}`;
                    document.getElementById('conversion-result').className = 'conversion-result success';
                } else {
                    document.getElementById('conversion-result').textContent = 'Error: Invalid response';
                    document.getElementById('conversion-result').className = 'conversion-result error';
                }
            },
            error: function (xhr, status, error) {
                console.error('Conversion error:', error);
                let errorMessage = 'Conversion error';
                if (status === 'timeout') {
                    errorMessage = 'Conversion request timed out';
                }
                document.getElementById('conversion-result').textContent = 'Error: ' + errorMessage;
                document.getElementById('conversion-result').className = 'conversion-result error';
            }
        });
    };

    conversionAmountInput.addEventListener('input', triggerConversion);
    fromCurrencyDropdown.addEventListener('change', triggerConversion);
    toCurrencyDropdown.addEventListener('change', triggerConversion);

    window.triggerInitialConversion = triggerConversion;
    
    if (parseFloat(conversionAmountInput.value) > 0) {
        triggerConversion();
    }
}

function fetchWikipediaDataByISO(isoCode) {
    document.getElementById('wikiModalContent').innerHTML = '<div class="text-center">Loading...</div>';
    
    $.ajax({
        url: 'libs/php/fetch_data.php',
        type: 'GET',
        data: { iso_code: isoCode },
        dataType: 'json',
        timeout: 10000,
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
            } else {
                document.getElementById('wikiModalContent').innerHTML = '<div class="text-center">No Wikipedia links found</div>';
            }
        },
        error: function (xhr, status, error) {
            let errorMessage = 'Error fetching Wikipedia data.';
            if (status === 'timeout') {
                errorMessage = 'Wikipedia request timed out. Please try again.';
            }
            document.getElementById('wikiModalContent').innerHTML = `<div class="text-center text-danger">${errorMessage}</div>`;
        }
    });
}

function fetchNewsByISO(isoCode) {
    document.getElementById('newsModalContent').innerHTML = '<div class="text-center">Loading...</div>';
    
    $.ajax({
        url: 'libs/php/fetch_news.php',
        type: 'GET',
        data: { iso_code: isoCode },
        dataType: 'json',
        timeout: 10000,
        success: function (data) {
            if (data.error) {
                document.getElementById('newsModalContent').innerHTML = `<div class="text-center text-danger">${data.error}</div>`;
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
        },
        error: function (xhr, status, error) {
            let errorMessage = 'Error fetching news.';
            if (status === 'timeout') {
                errorMessage = 'News request timed out. Please try again.';
            }
            document.getElementById('newsModalContent').innerHTML = `<div class="text-center text-danger">${errorMessage}</div>`;
        }
    });
}

$('.modal').on('show.bs.modal', function () {
    if (activeModal && activeModal !== this) {
        $(activeModal).modal('hide');
    }
    activeModal = this;
});

$('.modal').on('hidden.bs.modal', function () {
    if (activeModal === this) {
        activeModal = null;
    }
});

window.addEventListener('beforeunload', function() {
    clearAllLayers();
    if (currentRequest) {
        currentRequest.abort();
    }
});

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                userLocationFound = true;
                checkLoadingComplete();
            },
            function () {
                userLocationFound = true;
                checkLoadingComplete();
            }
        );
    } else {
        userLocationFound = true;
        checkLoadingComplete();
    }
}

getUserLocation();
