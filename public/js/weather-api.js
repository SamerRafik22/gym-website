// Weather API Integration for Gym Dashboard
class WeatherService {
    constructor() {
        // Using OpenWeatherMap API (free tier)
        this.apiKey = ''; // Will be set dynamically or use a free service
        this.city = 'Cairo,EG'; // Gym location
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
        
        // Fallback to free weather API if needed
        this.fallbackUrl = 'https://api.open-meteo.com/v1/forecast';
    }

    async getCurrentWeather() {
        try {
            // Using Open-Meteo (free, no API key required)
            const response = await fetch(
                `${this.fallbackUrl}?latitude=30.0444&longitude=31.2357&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Africa/Cairo`
            );
            
            if (!response.ok) {
                throw new Error('Weather API request failed');
            }
            
            const data = await response.json();
            return this.formatWeatherData(data);
        } catch (error) {
            console.error('Weather API Error:', error);
            return this.getDefaultWeatherData();
        }
    }

    formatWeatherData(data) {
        const current = data.current;
        const temp = Math.round(current.temperature_2m);
        const feelsLike = Math.round(current.apparent_temperature);
        const humidity = current.relative_humidity_2m;
        const windSpeed = Math.round(current.wind_speed_10m);
        const weatherCode = current.weather_code;

        return {
            temperature: temp,
            feelsLike: feelsLike,
            humidity: humidity,
            windSpeed: windSpeed,
            condition: this.getWeatherCondition(weatherCode),
            icon: this.getWeatherIcon(weatherCode),
            timestamp: new Date(current.time),
            workoutRecommendation: this.getWorkoutRecommendation(temp, humidity, weatherCode),
            clothingRecommendation: this.getClothingRecommendation(temp, feelsLike, weatherCode)
        };
    }

    getWeatherCondition(code) {
        const conditions = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            95: 'Thunderstorm'
        };
        return conditions[code] || 'Unknown';
    }

    getWeatherIcon(code) {
        if (code === 0 || code === 1) return '☀️';
        if (code === 2 || code === 3) return '⛅';
        if (code >= 45 && code <= 48) return '🌫️';
        if (code >= 51 && code <= 55) return '🌦️';
        if (code >= 61 && code <= 65) return '🌧️';
        if (code >= 71 && code <= 75) return '🌨️';
        if (code >= 95) return '⛈️';
        return '🌤️';
    }

    getWorkoutRecommendation(temp, humidity, weatherCode) {
        let recommendation = '';
        
        if (temp >= 35) {
            recommendation = '🔥 Very Hot Day! Focus on indoor cardio and stay hydrated. Consider early morning or late evening workouts.';
        } else if (temp >= 30) {
            recommendation = '🌡️ Hot Weather: Perfect for indoor strength training. Increase water intake during workouts.';
        } else if (temp >= 25) {
            recommendation = '✨ Perfect Weather: Great for any workout! Mix cardio and strength training.';
        } else if (temp >= 20) {
            recommendation = '💪 Comfortable Temperature: Ideal for intense workouts and HIIT sessions.';
        } else if (temp >= 15) {
            recommendation = '🏃‍♂️ Cool Day: Perfect for warming up with cardio before strength training.';
        } else {
            recommendation = '❄️ Cool Weather: Warm up thoroughly before workouts. Great for high-intensity training.';
        }

        if (humidity > 80) {
            recommendation += ' High humidity - bring extra towels and hydrate more frequently.';
        }

        if (weatherCode >= 61 && weatherCode <= 65) {
            recommendation += ' ☔ Rainy day - perfect time for an indoor gym session!';
        }

        return recommendation;
    }

    getClothingRecommendation(temp, feelsLike, weatherCode) {
        let clothing = '';
        
        if (feelsLike >= 30) {
            clothing = '👕 Lightweight, breathable fabrics. Tank tops and shorts. Moisture-wicking materials recommended.';
        } else if (feelsLike >= 25) {
            clothing = '👔 Light t-shirt and shorts. Bring a light towel for extra sweat.';
        } else if (feelsLike >= 20) {
            clothing = '👕 Comfortable t-shirt and workout shorts. Perfect gym weather!';
        } else if (feelsLike >= 15) {
            clothing = '🧥 Light long sleeves or t-shirt. You might want to warm up a bit more.';
        } else {
            clothing = '🧥 Long sleeves recommended. Bring layers as you might warm up during workout.';
        }

        if (weatherCode >= 61 && weatherCode <= 65) {
            clothing += ' 🌂 Don\'t forget an umbrella or rain jacket for your trip to the gym!';
        }

        return clothing;
    }

    getDefaultWeatherData() {
        // Fallback data when API fails
        return {
            temperature: 28,
            feelsLike: 30,
            humidity: 65,
            windSpeed: 12,
            condition: 'Partly cloudy',
            icon: '⛅',
            timestamp: new Date(),
            workoutRecommendation: '🏋️‍♂️ Great day for a workout! Stay hydrated and enjoy your training session.',
            clothingRecommendation: '👕 Comfortable workout clothes recommended. Bring a towel and water bottle.',
            isDefault: true
        };
    }
}

// Weather Widget Component
class WeatherWidget {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.weatherService = new WeatherService();
        this.isLoading = false;
    }

    async init() {
        if (!this.container) {
            console.warn('Weather widget container not found');
            return;
        }

        this.renderLoadingState();
        await this.loadWeatherData();
        
        // Update weather every 30 minutes
        setInterval(() => {
            this.loadWeatherData();
        }, 30 * 60 * 1000);
    }

    renderLoadingState() {
        this.container.innerHTML = `
            <div class="weather-widget loading">
                <div class="weather-header">
                    <h3>🌤️ Gym Weather</h3>
                    <span class="loading-spinner">⏳</span>
                </div>
                <p>Loading weather data...</p>
            </div>
        `;
    }

    async loadWeatherData() {
        try {
            this.isLoading = true;
            const weatherData = await this.weatherService.getCurrentWeather();
            this.renderWeatherWidget(weatherData);
        } catch (error) {
            console.error('Failed to load weather:', error);
            this.renderErrorState();
        } finally {
            this.isLoading = false;
        }
    }

    renderWeatherWidget(data) {
        const lastUpdated = data.timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        this.container.innerHTML = `
            <div class="weather-widget">
                <div class="weather-header">
                    <h3>🌤️ Cairo Weather</h3>
                    <span class="weather-time">Updated: ${lastUpdated}</span>
                    ${data.isDefault ? '<span class="weather-offline">📱 Offline Mode</span>' : ''}
                </div>
                
                <div class="weather-current">
                    <div class="weather-main">
                        <span class="weather-icon">${data.icon}</span>
                        <div class="weather-temp">
                            <span class="temp-main">${data.temperature}°C</span>
                            <span class="temp-feels">Feels like ${data.feelsLike}°C</span>
                        </div>
                    </div>
                    <div class="weather-details">
                        <div class="weather-condition">${data.condition}</div>
                        <div class="weather-stats">
                            <span>💧 ${data.humidity}%</span>
                            <span>💨 ${data.windSpeed} km/h</span>
                        </div>
                    </div>
                </div>

                <div class="weather-recommendations">
                    <div class="recommendation-card workout-rec">
                        <h4>🏋️‍♂️ Workout Recommendation</h4>
                        <p>${data.workoutRecommendation}</p>
                    </div>
                    
                    <div class="recommendation-card clothing-rec">
                        <h4>👕 What to Wear</h4>
                        <p>${data.clothingRecommendation}</p>
                    </div>
                </div>

                <div class="weather-footer">
                    <button class="refresh-weather-btn" onclick="window.weatherWidget?.loadWeatherData()">
                        🔄 Refresh Weather
                    </button>
                </div>
            </div>
        `;
    }

    renderErrorState() {
        this.container.innerHTML = `
            <div class="weather-widget error">
                <div class="weather-header">
                    <h3>🌤️ Weather Unavailable</h3>
                </div>
                <p>⚠️ Unable to load weather data. Using default recommendations.</p>
                <div class="recommendation-card">
                    <h4>🏋️‍♂️ General Recommendation</h4>
                    <p>Great day for a workout! Stay hydrated and enjoy your training session.</p>
                </div>
                <button class="refresh-weather-btn" onclick="window.weatherWidget?.loadWeatherData()">
                    🔄 Try Again
                </button>
            </div>
        `;
    }
}

// Export for global use
window.WeatherService = WeatherService;
window.WeatherWidget = WeatherWidget;