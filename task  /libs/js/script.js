$(document).ready(function() {
    const north = 44.1, south = -9.9, east = -22.4, west = 55.2;

    $('#selEarthquakeDate').append('<option value="2011-03-11">2011-03-11</option>');
    $('#selEarthquakeDate').append('<option value="2012-04-11">2012-04-11</option>');
    $('#selEarthquakeDate').append('<option value="2007-09-12">2007-09-12</option>');
    $('#selEarthquakeDate').append('<option value="2007-04-01">2007-04-01</option>');
    $('#selEarthquakeDate').append('<option value="2019-05-26">2019-05-26</option>');
    $('#selEarthquakeDate').append('<option value="2016-12-17">2016-12-17</option>');
    $('#selEarthquakeDate').append('<option value="2017-01-22">2017-01-22</option>');
    $('#selEarthquakeDate').append('<option value="2015-04-25">2015-04-25</option>');

    $('#selCityCountry').append('<option value="Beijing">China</option>');
    $('#selCityCountry').append('<option value="Mexico City">Mexico</option>');
    $('#selCityCountry').append('<option value="Dhaka">Bangladesh</option>');
    $('#selCityCountry').append('<option value="Seoul">South Korea</option>');
    $('#selCityCountry').append('<option value="Jakarta">Indonesia</option>');
    $('#selCityCountry').append('<option value="Tokyo">Japan</option>');
    $('#selCityCountry').append('<option value="Hanoi">Vietnam</option>');
    $('#selCityCountry').append('<option value="Taipei">Taiwan</option>');
    $('#selCityCountry').append('<option value="Bogotá">Columbia</option>');

    function populateWeatherStations() {
        $.ajax({
            url: 'libs/php/getWeather.php',
            type: 'POST',
            dataType: 'json',
            data: { north, south, east, west },
            success: function(result) {
                $('#selWeatherStation').empty();
                if (result.data && result.data.length > 0) {
                    result.data.forEach(station => {
                        $('#selWeatherStation').append(`<option value="${station.stationName}">${station.stationName}</option>`);
                    });
                } else {
                    $('#selWeatherStation').append('<option>No stations available</option>');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Error:', textStatus, errorThrown);
            }
        });
    }

    populateWeatherStations();

    $('#btnRunWeather').click(function() {
        const selectedStation = $('#selWeatherStation').val();
        $.ajax({
            url: 'libs/php/getWeather.php',
            type: 'POST',
            dataType: 'json',
            data: { north, south, east, west },
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
                    // Filter the result to show only the selected station
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
                $('#resultsTable').html(resultsHTML);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Error:', textStatus, errorThrown);
            }
        });
    });

    $('#btnRunEarthquake').click(function() {
        const selectedDate = $('#selEarthquakeDate').val();
        $.ajax({
            url: 'libs/php/getEarthquakes.php',
            type: 'POST',
            dataType: 'json',
            data: { north, south, east, west, date: selectedDate },
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
                // Filter and display only the earthquakes for the selected date
                const filteredData = result.data.filter(eq => eq.datetime.split(' ')[0] === selectedDate);
                if (filteredData.length > 0) {
                    filteredData.forEach(eq => {
                        resultsHTML += `
                            <tr>
                                <td>${eq.datetime}</td>
                                <td>${eq.magnitude}</td>
                                <td>${eq.depth}</td>
                                <td>${eq.src}</td>
                            </tr>`;
                    });
                } else {
                    resultsHTML += '<tr><td colspan="4">No data available for the selected date</td></tr>';
                }
                resultsHTML += '</tbody>';
                $('#resultsTable').html(resultsHTML);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Error:', textStatus, errorThrown);
            }
        });
    });

    $('#btnRunCity').click(function() {
        const selectedCity = $('#selCityCountry').val();
        $.ajax({
            url: 'libs/php/getCities.php',
            type: 'POST',
            dataType: 'json',
            data: { north, south, east, west, city: selectedCity },
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
                result.data.forEach(city => {
                    resultsHTML += `
                        <tr>
                            <td>${city.name}</td>
                            <td>${city.population}</td>
                            <td>${city.lat}</td>
                            <td>${city.lng}</td>
                        </tr>`;
                });
                resultsHTML += '</tbody>';
                $('#resultsTable').html(resultsHTML);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Error:', textStatus, errorThrown);
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
