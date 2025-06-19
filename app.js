const apiKey = '361e5fa2fd77bdca08d2555ed9fa3e35'; // Your OpenWeatherMap API key

// Update Date & Time based on timezone
function updateDateTime(timezone) {
    const startTime = Date.now();
    const baseUTC = new Date(new Date().getTime() + (new Date().getTimezoneOffset() * 60000));

    function tick() {
        const now = Date.now();
        const elapsed = now - startTime;
        const adjustedUTC = new Date(baseUTC.getTime() + elapsed);
        const localTime = new Date(adjustedUTC.getTime() + timezone * 1000);

        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
        };

        const formattedDateTime = localTime.toLocaleString('en-US', options);
        const isDayTime = localTime.getHours() >= 6 && localTime.getHours() < 18;
        const icon = isDayTime ? '☀' : '🌙';

        document.getElementById('datetime').innerHTML = `
            <div style="text-align: center; color:rgba(233, 216, 34, 0.65); font-weight: 600; font-size: 40px;">
                ${icon} 📅 ${formattedDateTime} 
            </div>
        `;
    }

    tick(); // call immediately once
    setInterval(tick, 1000); // then every second
}


// Predict Weather
async function predictWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return;

    const resultDiv = document.getElementById('result');
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.style.display = 'none'; // Hide suggestions after search

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
        if (!response.ok) throw new Error('City not found');

        const data = await response.json();

        // Extract weather information
        const temp = (data.main.temp - 273.15).toFixed(1);
        const feels_like = (data.main.feels_like - 273.15).toFixed(1);
        const temp_min = (data.main.temp_min - 273.15).toFixed(1);
        const temp_max = (data.main.temp_max - 273.15).toFixed(1);
        const pressure = data.main.pressure;
        const humidity = data.main.humidity;
        const weather_main = data.weather[0].main;
        const weather_desc = data.weather[0].description;
        const wind_speed = data.wind.speed;
        const cloudiness = data.clouds.all;
        const country = data.sys.country;
        const cityName = data.name;
        const iconCode = data.weather[0].icon;

        resultDiv.innerHTML = `
            <div style="animation: fadeIn 1s;">
                <h2 style="font-size: 28px;">📍 ${cityName}, ${country}</h2>
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon" style="width: 100px; height: 100px;">
                <h3 style="text-transform: capitalize; margin: 10px 0;">${weather_main} (${weather_desc})</h3>
                <p>🌡 Temperature: <strong>${temp}°C</strong></p>
                <p>🤒 Feels Like: <strong>${feels_like}°C</strong></p>
                <p>🔻 Min Temp: ${temp_min}°C | 🔺 Max Temp: ${temp_max}°C</p>
                <p>💧 Humidity: ${humidity}%</p>
                <p>☁ Cloudiness: ${cloudiness}%</p>
                <p>📈 Pressure: ${pressure} hPa</p>
                <p>💨 Wind Speed: ${wind_speed} m/s</p>
            </div>
        `;

        updateDateTime(data.timezone);

        // Smart Background Switching
        const appBackground = document.querySelector('.weather-app') || document.body;
        if (weather_main.includes('Rain')) {
            appBackground.style.backgroundImage = "url('logo/rainy.jpg')";
        } else if (weather_main.includes('Cloud')) {
            appBackground.style.backgroundImage = "url('logo/cloudy.jpg')";
        } else if (weather_main.includes('Clear')) {
            appBackground.style.backgroundImage = "url('logo/sunny.jpg')";
        } else if (weather_main.includes('Snow')) {
            appBackground.style.backgroundImage = "url('logo/snow.jpg')";
        } else {
            appBackground.style.backgroundImage = "url('logo/default.jpg')";
        }

    } catch (error) {
        resultDiv.innerHTML = `<p style="color:red; font-size:18px;">${error.message}</p>`;
    }
}

// Show Suggestions (Improved)
const cities = [
    "London", "Paris", "New York", "Tokyo", "Sydney", "Delhi", "Berlin",
    "Moscow", "Beijing", "Dubai", "Visakhapatnam", "Chennai", "San Francisco",
    "Mumbai", "Los Angeles", "Chicago", "Seoul", "Bangkok", "Toronto", "Madrid", "Vijayawada"
];

function showSuggestions() {
    const input = document.getElementById('cityInput').value.toLowerCase();
    const suggestionsDiv = document.getElementById('suggestions');

    if (!input) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const filtered = cities.filter(city => city.toLowerCase().startsWith(input));

    if (filtered.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    suggestionsDiv.innerHTML = '';
    filtered.forEach(city => {
        const div = document.createElement('div');
        div.textContent = city;
        div.classList.add('suggestion-item');
        div.onclick = () => {
            document.getElementById('cityInput').value = city;
            suggestionsDiv.style.display = 'none';
            predictWeather();
        };
        suggestionsDiv.appendChild(div);
    });

    suggestionsDiv.style.display = 'block';
}

// Hide suggestions when clicked outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        document.getElementById('suggestions').style.display = 'none';
    }
});

// Small animation for fadeIn
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(style);