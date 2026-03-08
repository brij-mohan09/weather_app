let apiKey = import.meta.env.VITE_WEATHER_API_KEY;
// console.log(import.meta.env.VITE_WEATHER_API_KEY);

let cityInput = document.getElementById("city_input");
let searchBtn = document.getElementById("search_btn");
let locationBtn = document.getElementById("location_btn");

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

const getWeatherDetails = async (name, lat, lon, country, state) => {
  let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  let WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  let AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  try {
    // AIR QUALITY API
    const airRes = await fetch(AIR_POLLUTION_API_URL);
    const airData = await airRes.json();

    let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = airData.list[0].components;

    aqiCard.innerHTML = `
        <div class="card-head">
            <p>Air Quality Index</p>
            <p class="air-index aqi-${airData.list[0].main.aqi}">
            ${aqiList[airData.list[0].main.aqi - 1]}</p>
        </div>

        <div class="air-indices">
            <i class="fa-regular fa-wind fa-3x"></i>

            <div class="item"><p>PM2.5</p><h2>${pm2_5}</h2></div>
            <div class="item"><p>PM10</p><h2>${pm10}</h2></div>
            <div class="item"><p>SO2</p><h2>${so2}</h2></div>
            <div class="item"><p>CO</p><h2>${co}</h2></div>
            <div class="item"><p>NO</p><h2>${no}</h2></div>
            <div class="item"><p>NO2</p><h2>${no2}</h2></div>
            <div class="item"><p>NH3</p><h2>${nh3}</h2></div>
            <div class="item"><p>O3</p><h2>${o3}</h2></div>
        </div>
        `;
  } catch {
    alert("Failed to fetch air quality index");
  }

  try {
    // CURRENT WEATHER API
    const weatherRes = await fetch(WEATHER_API_URL);
    const data = await weatherRes.json();

    let date = new Date();

    currentWeatherCard.innerHTML = `
        <div class="current-weather">
            <div class="details">
                <p>Now</p>
                <h2>${(data.main.temp - 273.15).toFixed(2)}°C</h2>
                <p>${data.weather[0].description}</p>
            </div>

            <div class="weather-icon">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
            </div>
        </div>

        <hr>

        <div class="card-footer">
            <p>${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</p>
            <p>${name || ""}, ${state || ""} ${country || ""}</p>
        </div>
        `;

    let { sunrise, sunset } = data.sys;
    let { timezone, visibility } = data;
    let { humidity, pressure, feels_like } = data.main;
    let { speed } = data.wind;

    const formatTime = (unix, timezone) => {
      return new Date((unix + timezone) * 1000)
        .toUTCString()
        .match(/\d{2}:\d{2}/)[0];
    };

    let sRiseTime = formatTime(sunrise, timezone);
    let sSetTime = formatTime(sunset, timezone);

    sunriseCard.innerHTML = `
        <div class="card-head">
            <p>Sunrise & Sunset</p>
        </div>

        <div class="sunrise-sunset">

            <div class="item">
            <div class="icon">
                  <i class="fa-light fa-sunrise fa-4x"></i>
                </div>
                <p>Sunrise</p>
                <h2>${sRiseTime}</h2>
            </div>

            <div class="item">
            <div class="icon">
                  <i class="fa-light fa-sunset fa-4x"></i>
                </div>
                <p>Sunset</p>
                <h2>${sSetTime}</h2>
            </div>

        </div>
        `;

    humidityVal.innerHTML = `${humidity}%`;
    pressureVal.innerHTML = `${pressure}hPa`;
    visibilityVal.innerHTML = `${visibility / 1000}km`;
    windSpeedVal.innerHTML = `${speed}m/s`;
    feelsVal.innerHTML = `${(feels_like - 273.15).toFixed(2)}°C`;
  } catch {
    alert("Failed to fetch current weather");
  }

  try {
    // FORECAST API
    const forecastRes = await fetch(FORECAST_API_URL);
    const data = await forecastRes.json();

    let hourlyForecast = data.list;

    hourlyForecastCard.innerHTML = "";

    for (let i = 0; i <= 7; i++) {
      let hrForecastDate = new Date(hourlyForecast[i].dt_txt);
      let hr = hrForecastDate.getHours();

      let a = hr >= 12 ? "PM" : "AM";

      if (hr === 0) hr = 12;
      if (hr > 12) hr = hr - 12;

      hourlyForecastCard.innerHTML += `
            <div class="card">
                <p>${hr} ${a}</p>
                <img src="https://openweathermap.org/img/wn/${hourlyForecast[i].weather[0].icon}.png">
                <p>${(hourlyForecast[i].main.temp - 273.15).toFixed(2)}°C</p>
            </div>`;
    }
    // -------- 5 DAY FORECAST --------

    let uniqueForecastDays = [];

    let fiveDaysForecast = data.list.filter((forecast) => {
      let forecastDate = new Date(forecast.dt_txt).getDate();

      if (!uniqueForecastDays.includes(forecastDate)) {
        return uniqueForecastDays.push(forecastDate);
      }
    });

    sevenDaysForecastCard.innerHTML = "";

    for (let i = 1; i < fiveDaysForecast.length; i++) {
      let date = new Date(fiveDaysForecast[i].dt_txt);

      sevenDaysForecastCard.innerHTML += `
    
    <div class="forecast-item">
    
        <div class="icon-wrapper">
        
            <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png">
            
            <span>${(fiveDaysForecast[i].main.temp - 273.15).toFixed(2)}°C</span>
        
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

const getCityCoordinates = async () => {
  let cityName = cityInput.value.trim();
  cityInput.value = "";

  if (!cityName) return;

  let GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

  try {
    const res = await fetch(GEOCODING_API_URL);
    const data = await res.json();

    if (!data.length) {
      alert("City not found");
      return;
    }

    let { name, lat, lon, country, state } = data[0];

    getWeatherDetails(name, lat, lon, country, state);
  } catch {
    alert(`Failed to fetch coordinates of ${cityName}`);
  }
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      let { latitude, longitude } = position.coords;

      let REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

      try {
        const res = await fetch(REVERSE_GEOCODING_URL);
        const data = await res.json();

        let { name, country, state } = data[0];

        getWeatherDetails(name, latitude, longitude, country, state);
      } catch {
        alert("Failed to fetch user coordinates");
      }
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("location permission denied");
      }
    },
  );
};

searchBtn.addEventListener("click", getCityCoordinates);
locationBtn.addEventListener("click", getUserCoordinates);

cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates(),
);

window.addEventListener("load", () => {
  getUserCoordinates();
});

const themeBtn = document.getElementById("theme_toggle");

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeBtn.innerHTML = "☀️";
  } else {
    themeBtn.innerHTML = "🌙";
  }
});
