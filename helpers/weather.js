const env = process.env;
const WEATHER_API_BASE_URL = 'https://api.weather.gov';
const GOOGLE_GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const IP_API_URL = 'http://ip-api.com/json';

const getWeatherByLatLong = async (lat, lon) => {
    try {
        // Fetch location details using Google Geocoding API
        const locationResponse = await fetch(`${GOOGLE_GEOCODING_API_URL}?latlng=${lat},${lon}&key=${env.GOOGLE_API_KEY}`);
        if (!locationResponse.ok) {
            throw new Error(`Failed to fetch location details: ${locationResponse.statusText}`);
        }
        const locationData = await locationResponse.json();
        // Check if location data is available
        if (!locationData.results || locationData.results.length === 0) {
            throw new Error('No location data found for the provided latitude and longitude.');
        }

        // Extract locality and state
        let city = null, state = null;
        locationData.results[0].address_components.forEach(component => {
            if (component.types.includes("locality")) {
                city = component.long_name;
            }
            if (component.types.includes("administrative_area_level_1")) {
                state = component.short_name;
            }
        });

        // Handle cases like Washington, DC
        const location = city && state ? `${city}, ${state}` : city ? city : 'Unknown Location';
        if (!location) {
            throw new Error('Failed to retrieve location from latitude and longitude.');
        }

        // Fetch grid points from the weather API
        const gridResponse = await fetch(`${WEATHER_API_BASE_URL}/points/${lat},${lon}`);
        if (!gridResponse.ok) {
            throw new Error(`Failed to fetch grid points: ${gridResponse.statusText}`);
        }
        const gridData = await gridResponse.json();
        const { gridId, gridX, gridY } = gridData.properties;

        // Fetch weather forecast using grid points
        const forecastResponse = await fetch(`${WEATHER_API_BASE_URL}/gridpoints/${gridId}/${gridX},${gridY}/forecast`);
        if (!forecastResponse.ok) {
            throw new Error(`Failed to fetch forecast: ${forecastResponse.statusText}`);
        }
        const weatherData = await forecastResponse.json();

        // Combine location and weather data
        return {
            location,
            weather: weatherData
        };
    } catch (error) {
        console.error('Error fetching weather and location by latitude and longitude:', error.message);
        throw new Error('Failed to fetch weather and location data.');
    }
};
const getWeatherByIP = async (ip) => {
    try {
        // Fetch latitude and longitude from IP address
        const ipResponse = await fetch(`${IP_API_URL}/${ip}`);
        if (!ipResponse.ok) {
            throw new Error(`Failed to fetch IP data: ${ipResponse.statusText}`);
        }
        const ipData = await ipResponse.json();
        const { lat, lon } = ipData;

        if (!lat || !lon) {
            throw new Error('Failed to retrieve latitude and longitude from IP.');
        }

        // Fetch weather data using latitude and longitude
        return await getWeatherByLatLong(lat, lon);
    } catch (error) {
        console.error('Error fetching weather by IP:', error.message);
        throw new Error('Failed to fetch weather data.');
    }
};

module.exports = {
    getWeatherByLatLong,
    getWeatherByIP
};
