const express = require('express');
const router = express.Router();
const request = require('request');

// GET /weather — show form
router.get('/', (req, res) => {
    res.render('weather.ejs', { weather: null, city: null, error: null });
});

// POST /weather — get weather for entered city
router.post('/', (req, res) => {
    const apiKey = '3f0045dc3eede6d9a10cf45bf3590b3c';
    const city = req.body.city;

    if (!city) {
        return res.render('weather.ejs', { weather: null, city: null, error: "Please enter a city." });
    }

    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    request(url, function (err, response, body) {
        if (err) return res.render('weather.ejs', { weather: null, city: null, error: "Error fetching weather." });

        let weather;
        try {
            weather = JSON.parse(body);
        } catch (parseErr) {
            return res.render('weather.ejs', { weather: null, city: null, error: "Error parsing weather data." });
        }

        // Check if the API returned valid data
        if (weather && weather.main) {
            const wmsg = `
                Temperature: ${weather.main.temp}°C<br>
                Feels like: ${weather.main.feels_like}°C<br>
                Humidity: ${weather.main.humidity}%<br>
                Pressure: ${weather.main.pressure} hPa<br>
                Weather: ${weather.weather[0].description}<br>
                Wind Speed: ${weather.wind.speed} m/s, Direction: ${weather.wind.deg}°<br>
                Cloudiness: ${weather.clouds.all}%<br>
            `;
            res.render('weather.ejs', { weather: wmsg, city: weather.name, error: null });
        } else {
            res.render('weather.ejs', { weather: null, city: null, error: "No data found for this city." });
        }
    });
});

module.exports = router;
