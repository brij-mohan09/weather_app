// ==========================
// DOM ELEMENT REFERENCES
// ==========================
let cityInput = document.getElementById("city_input");
let searchBtn = document.getElementById("search_btn");
let locationBtn = document.getElementById("location_btn");

let apiKey = "d76ec34db30905d8fdf56f6793a84f05";

let currentWeatherCard = document.querySelectorAll(".weather-left .card")[0];
let sevenDaysForecastCard = document.querySelector(".day-forecast");

let aqiCard = document.querySelectorAll(".highlights .card")[0];
let sunriseCard = document.querySelectorAll(".highlights .card")[1];

let humidityVal = document.getElementById("humidity_val");
let pressureVal = document.getElementById("pressure_val");
let visibilityVal = document.getElementById("visibility_val");
let windSpeedVal = document.getElementById("wind_speed_val");
let feelsVal = document.getElementById("feels_val");

let hourlyForecastCard = document.querySelector(".hourly-forecast");

let aqiList = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];


// ===============================
// DYNAMIC WEATHER UI + TEXT COLOR
// ===============================
const setWeatherTheme = (weather) => {

    const body = document.body;
    const cards = document.querySelectorAll(".card");
    const texts = document.querySelectorAll("h1,h2,h3,p,span");

    let bg = "";
    let textColor = "#ffffff";

    switch(weather.toLowerCase()){

        case "clear":
            bg = "linear-gradient(135deg,#fceabb,#f8b500)";
            textColor = "#222";
            break;

        case "clouds":
            bg = "linear-gradient(135deg,#757f9a,#d7dde8)";
            textColor = "#111";
            break;

        case "rain":
        case "drizzle":
            bg = "linear-gradient(135deg,#314755,#26a0da)";
            textColor = "#ffffff";
            break;

        case "thunderstorm":
            bg = "linear-gradient(135deg,#141e30,#243b55)";
            textColor = "#ffffff";
            break;

        case "snow":
            bg = "linear-gradient(135deg,#e6dada,#ffffff)";
            textColor = "#222";
            break;

        case "mist":
        case "fog":
        case "haze":
            bg = "linear-gradient(135deg,#3e5151,#decba4)";
            textColor = "#ffffff";
            break;

        default:
            bg = "linear-gradient(135deg,#1f4037,#99f2c8)";
            textColor = "#ffffff";
    }

    // Background
    body.style.background = bg;

    // Text color
    texts.forEach(t => {
        t.style.color = textColor;
    });

    // Cards glass effect
    cards.forEach(card=>{
        card.style.background = "rgba(255,255,255,0.15)";
        card.style.backdropFilter = "blur(12px)";
        card.style.border = "1px solid rgba(255,255,255,0.25)";
        card.style.color = textColor;
    });

};


// =====================================================
// FUNCTION: Fetch and display weather, AQI and forecast
// =====================================================
const getWeatherDetails = async (name, lat, lon, country, state) => {

    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    let WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    let AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    let days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];


    // ===============================
    // FETCH AIR QUALITY INFORMATION
    // ===============================
    try {

        let res = await fetch(AIR_POLLUTION_API_URL);
        let data = await res.json();

        let {co,no,no2,o3,so2,pm2_5,pm10,nh3} = data.list[0].components;

        aqiCard.innerHTML = `
        <div class="card-head">
            <p>Air Quality Index</p>
            <p class="air-index aqi-${data.list[0].main.aqi}">
                ${aqiList[data.list[0].main.aqi - 1]}
            </p>
        </div>

        <div class="air-indices">
            <i class="fa-regular fa-wind fa-3x"></i>

            <div class="item">
                <p>PM2.5</p>
                <h2>${pm2_5}</h2>
            </div>

            <div class="item">
                <p>PM10</p>
                <h2>${pm10}</h2>
            </div>

            <div class="item">
                <p>SO2</p>
                <h2>${so2}</h2>
            </div>

            <div class="item">
                <p>CO</p>
                <h2>${co}</h2>
            </div>

            <div class="item">
                <p>NO</p>
                <h2>${no}</h2>
            </div>

            <div class="item">
                <p>NO2</p>
                <h2>${no2}</h2>
            </div>

            <div class="item">
                <p>NH3</p>
                <h2>${nh3}</h2>
            </div>

            <div class="item">
                <p>O3</p>
                <h2>${o3}</h2>
            </div>
        </div>
        `;

    } catch {
        alert("Failed to fetch air quality index");
    }


    // ===============================
    // FETCH CURRENT WEATHER
    // ===============================
    try {

        let res = await fetch(WEATHER_API_URL);
        let data = await res.json();

        setWeatherTheme(data.weather[0].main);

        let date = new Date();

        currentWeatherCard.innerHTML = `
        <div class="current-weather">

            <div class="details">
                <p>Now</p>
                <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
                <p>${data.weather[0].description}</p>
            </div>

            <div class="weather-icon">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
            </div>

        </div>

        <hr>

        <div class="card-footer">
            <p>
            <i class="fa-light fa-calender"></i>
            ${days[date.getDay()]}, ${date.getDate()}, ${months[date.getMonth()]} ${date.getFullYear()}
            </p>

            <p>
            <i class="fa-light fa-location-dot"></i>
            ${name || ""}, ${state || ""} ${country || ""}
            </p>
        </div>
        `;

        let {sunrise, sunset} = data.sys;
        let {timezone, visibility} = data;
        let {humidity, pressure, feels_like} = data.main;
        let {speed} = data.wind;


        // =====================================
        // FUNCTION: Convert UNIX → Local Time
        // =====================================
        const formatTime = (unix, timezone) => {
            return new Date((unix + timezone) * 1000)
            .toUTCString()
            .match(/\d{2}:\d{2}/)[0];
        };

        let sRiseTime = formatTime(sunrise, timezone);
        let sSetTime = formatTime(sunset, timezone);


        // ===============================
        // SUNRISE & SUNSET CARD
        // ===============================
        sunriseCard.innerHTML = `
        <div class="card-head">
            <p>Sunrise & Sunset</p>
        </div>

        <div class="sunrise-sunset">

            <div class="item">
                <div class="icon">
                    <i class="fa-light fa-sunrise fa-4x"></i>
                </div>

                <div>
                    <p>Sunrise</p>
                    <h2>${sRiseTime}</h2>
                </div>
            </div>

            <div class="item">
                <div class="icon">
                    <i class="fa-light fa-sunset fa-4x"></i>
                </div>

                <div>
                    <p>Sunset</p>
                    <h2>${sSetTime}</h2>
                </div>
            </div>

        </div>
        `;


        // ===============================
        // WEATHER HIGHLIGHTS
        // ===============================
        humidityVal.innerHTML = `${humidity}%`;
        pressureVal.innerHTML = `${pressure}hPa`;
        visibilityVal.innerHTML = `${visibility / 1000}km`;
        windSpeedVal.innerHTML = `${speed}m/s`;
        feelsVal.innerHTML = `${(feels_like - 273.15).toFixed(2)}&deg;C`;

    } catch {
        alert("Failed to fetch current weather");
    }



    // ===============================
    // FETCH WEATHER FORECAST
    // ===============================
    try {

        let res = await fetch(FORECAST_API_URL);
        let data = await res.json();

        let hourlyForecast = data.list;

        hourlyForecastCard.innerHTML = ``;

        for(let i=0;i<=7;i++){

            let hrForecastDate = new Date(hourlyForecast[i].dt_txt);

            let hr = hrForecastDate.getHours();
            let a = hr >= 12 ? "PM" : "AM";

            if(hr === 0) hr = 12;
            if(hr > 12) hr = hr - 12;

            hourlyForecastCard.innerHTML += `
            <div class="card">
                <p>${hr} ${a}</p>
                <img src="https://openweathermap.org/img/wn/${hourlyForecast[i].weather[0].icon}.png">
                <p>${(hourlyForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</p>
            </div>
            `;
        }


        // ===============================
        // 7 DAY FORECAST
        // ===============================
        let uniqueForecastDays = [];

        let sevenDaysForecast = data.list.filter(forecast => {

            let forecastDate = new Date(forecast.dt_txt).getDate();

            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }

        });


        sevenDaysForecastCard.innerHTML = '';

        for(i=1;i<sevenDaysForecast.length;i++){

            let date = new Date(sevenDaysForecast[i].dt_txt);

            sevenDaysForecastCard.innerHTML += `
            <div class="forecast-item">

                <div class="icon-wrapper">
                    <img src="https://openweathermap.org/img/wn/${sevenDaysForecast[i].weather[0].icon}.png">
                    <span>${(sevenDaysForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</span>
                </div>

                <p>${date.getDate()} ${months[date.getMonth()]}</p>
                <p>${days[date.getDay()]}</p>

            </div>
            `;
        }

    } catch {
        alert("Failed to fetch weather forecast");
    }

};


// =====================================================
// FUNCTION: Get city coordinates from city name
// =====================================================
const getCityCoordinates = async () => {

    let cityName = cityInput.value.trim();
    cityInput.value = '';

    if(!cityName) return;

    let GEOCODING_API_URL =
    `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

    try {

        let res = await fetch(GEOCODING_API_URL);
        let data = await res.json();

        if(!data.length){
            alert("City not found");
            return;
        }

        let {name,lat,lon,country,state} = data[0];

        getWeatherDetails(name,lat,lon,country,state);

    } catch {
        alert(`Failed to fetch coordinates of ${cityName}`);
    }

};


// =====================================================
// FUNCTION: Get user's current location coordinates
// =====================================================
const getUserCoordinates = () => {

    navigator.geolocation.getCurrentPosition(async position => {

        let {latitude,longitude} = position.coords;

        let REVERSE_GEOCODING_URL =
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

        try{

            let res = await fetch(REVERSE_GEOCODING_URL);
            let data = await res.json();

            let {name,country,state} = data[0];

            getWeatherDetails(name,latitude,longitude,country,state);

        }catch{
            alert("Failed to fetch user coordinates");
        }

    }, error => {

        if(error.code === error.PERMISSION_DENIED){
            alert("location permission denied");
        }

    });

};


// ===============================
// EVENT LISTENERS
// ===============================
searchBtn.addEventListener("click", getCityCoordinates);
locationBtn.addEventListener("click", getUserCoordinates);

cityInput.addEventListener(
    "keyup",
    e => e.key === "Enter" && getCityCoordinates()
);


// ===============================
// LOAD DEFAULT WEATHER
// ===============================
window.addEventListener("load", getUserCoordinates);