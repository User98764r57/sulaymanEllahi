$(document).ready(function() {
    const north = 44.1, south = -9.9, east = -22.4, west = 55.2;

    const $earthquakeDate = $('#selEarthquakeDate');
    const $cityCountry = $('#selCityCountry');
    const $weatherStation = $('#selWeatherStation');
    const $resultsTable = $('#resultsTable');
    
    const earthquakeDates = [
        '2011-03-11', '2012-04-11', '2007-09-12', '2007-04-01',
        '2019-05-26', '2016-12-17', '2017-01-22', '2015-04-25'
    ];
    
    const cities = [
        { value: 'Beijing', label: 'China' },
        { value: 'Mexico City', label: 'Mexico' },
        { value: 'Dhaka', label: 'Bangladesh' },
        { value: 'Seoul', label: 'South Korea' },
        { value: 'Jakarta', label: 'Indonesia' },
        { value: 'Tokyo', label: 'Japan' },
        { value: 'Hanoi', label: 'Vietnam' },
        { value: 'Taipei', label: 'Taiwan' },
        { value: 'Bogotá', label: 'Columbia' }
    ];

    earthquakeDates.forEach(date => {
        $earthquakeDate.append(`<option value="${date}">${date}</option>`);
    });

    cities.forEach(city => {
        $cityCountry.append(`<option value="${city.value}">${city.label}</option>`);
    });

    function showLoading() {
        $resultsTable.html('<div class="text-center p-4"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');
    }

    function showError(message) {
        $resultsTable.html(`<div class="alert alert-danger">${message}</div>`);
    }

    function populateWeatherStations() {
        showLoading();
        
        $.ajax({
            url: 'libs/php/getWeather.php',
            type: 'POST',
            dataType: 'json',
            data: { north, south, east, west },
            timeout: 15000,
            success: function(result) {
                $weatherStation.empty();
                if (result.data && result.data.length > 0) {
                    result.data.forEach(station => {
                        $weatherStation.append(`<option value="${station.stationName}">${station.stationName}</option>`);
                    });
                } else {
                    $weatherStation.append('<option>No stations available</option>');
                }
                $resultsTable.empty();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Error:', textStatus, errorThrown);
                showError('Failed to load weather stations. Please try again.');
            }
        });
    }

    populateWeatherStations();

    $('#btnRunWeather').click(function() {
        const selectedStation = $weatherStation.val();
        showLoading();
        
        $.ajax({
            url: 'libs/php/getWeather.php',
            type: 'POST',
            dataType: 'json',
            data: { north, south, east, west },
            timeout: 15000,
            success: function(result) {
                let resultsHTML = `
                    <thead>
                        <tr>
                            <th>Station Name</th>
                            <th>Temperature</th>
                            <th>Humidity</th>
                            <th>Observation Time</th>
                        </tr>
                    </thead>
                    <tbody>`;
                
                if (result.data && result.data.length > 0) {
                    const stationData = result.data.find(station => station.stationName === selectedStation);
                    if (stationData) {
                        resultsHTML += `
                            <tr>
                                <td>${stationData.stationName}</td>
                                <td>${stationData.temperature}</td>
                                <td>${stationData.humidity}</td>
                                <td>${stationData.datetime}</td>
                            </tr>`;
                    } else {
                        resultsHTML += '<tr><td colspan="4">No data available for the selected station</td></tr>';
                    }
                } else {
                    resultsHTML += '<tr><td colspan="4">No data available</td></tr>';
                }
                resultsHTML += '</tbody>';
                $resultsTable.html(resultsHTML);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Error:', textStatus, errorThrown);
                showError('Failed to load weather data. Please try again.');
            }
        });
    });

    $('#btnRunEarthquake').click(function() {
        const selectedDate = $earthquakeDate.val();
        showLoading();
        
        $.ajax({
            url: 'libs/php/getEarthquakes.php',
            type: 'POST',
            dataType: 'json',
            data: { north, south, east, west, date: selectedDate },
            timeout: 15000,
            success: function(result) {
                let resultsHTML = `
                    <thead>
                        <tr>
                            <th>Date and Time</th>
                            <th>Magnitude</th>
                            <th>Depth</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>`;
                
                const filteredData = result.data.filter(eq => eq.datetime && eq.datetime.split(' ')[0] === selectedDate);
                if (filteredData.length > 0) {
                    filteredData.forEach(eq => {
                        resultsHTML += `
                            <tr>
                                <td>${eq.datetime || 'N/A'}</td>
                                <td>${eq.magnitude || 'N/A'}</td>
                                <td>${eq.depth || 'N/A'}</td>
                                <td>${eq.src || 'N/A'}</td>
                            </tr>`;
                    });
                } else {
                    resultsHTML += '<tr><td colspan="4">No data available for the selected date</td></tr>';
                }
                resultsHTML += '</tbody>';
                $resultsTable.html(resultsHTML);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Error:', textStatus, errorThrown);
                showError('Failed to load earthquake data. Please try again.');
            }
        });
    });

    $('#btnRunCity').click(function() {
        const selectedCity = $cityCountry.val();
        showLoading();
        
        $.ajax({
            url: 'libs/php/getCities.php',
            type: 'POST',
            dataType: 'json',
            data: { north, south, east, west, city: selectedCity },
            timeout: 15000,
            success: function(result) {
                let resultsHTML = `
                    <thead>
                        <tr>
                            <th>City Name</th>
                            <th>Population</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                        </tr>
                    </thead>
                    <tbody>`;
                
                if (result.data && result.data.length > 0) {
                    result.data.forEach(city => {
                        resultsHTML += `
                            <tr>
                                <td>${city.name || 'N/A'}</td>
                                <td>${city.population || 'N/A'}</td>
                                <td>${city.lat || 'N/A'}</td>
                                <td>${city.lng || 'N/A'}</td>
                            </tr>`;
                    });
                } else {
                    resultsHTML += '<tr><td colspan="4">No data available for the selected city</td></tr>';
                }
                resultsHTML += '</tbody>';
                $resultsTable.html(resultsHTML);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Error:', textStatus, errorThrown);
                showError('Failed to load city data. Please try again.');
            }
        });
    });
});

$(window).on('load', function() {
    if ($('#preloader').length) {
        $('#preloader').delay(1000).fadeOut('slow', function() {
            $(this).remove();
        });
    }
});
