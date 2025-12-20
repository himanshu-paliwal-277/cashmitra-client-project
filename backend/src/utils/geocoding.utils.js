import axios from 'axios';

class GeocodingService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.provider = process.env.GEOCODING_PROVIDER || 'nominatim'; // 'google' or 'nominatim'
  }

  async geocodeAddress(address) {
    try {
      if (this.provider === 'google' && this.googleApiKey) {
        return await this.geocodeWithGoogle(address);
      } else {
        return await this.geocodeWithNominatim(address);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      return this.getDefaultCoordinatesForPincode(address.pincode);
    }
  }

  async geocodeWithGoogle(address) {
    const addressString = this.formatAddressString(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;

    const response = await axios.get(url, {
      params: {
        address: addressString,
        key: this.googleApiKey,
        region: 'in', // Bias results to India
      },
      timeout: 5000,
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    }

    throw new Error(`Google Geocoding failed: ${response.data.status}`);
  }

  async geocodeWithNominatim(address) {
    const addressString = this.formatAddressString(address);
    const url = `https://nominatim.openstreetmap.org/search`;

    const response = await axios.get(url, {
      params: {
        q: addressString,
        format: 'json',
        limit: 1,
        countrycodes: 'in', // Restrict to India
      },
      headers: {
        'User-Agent': 'Cashmitra-App/1.0', // Required by Nominatim
      },
      timeout: 5000,
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
    }

    throw new Error('Nominatim geocoding returned no results');
  }

  formatAddressString(address) {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.pincode,
      'India',
    ].filter(Boolean);

    return parts.join(', ');
  }

  getDefaultCoordinatesForPincode(pincode) {
    if (!pincode) {
      // Default to Delhi coordinates
      return { latitude: 28.6139, longitude: 77.209 };
    }

    // Simple pincode-based approximation for major Indian cities
    const pincodeMap = {
      // Delhi
      110: { latitude: 28.6139, longitude: 77.209 },
      // Mumbai
      400: { latitude: 19.076, longitude: 72.8777 },
      401: { latitude: 19.076, longitude: 72.8777 },
      // Bangalore
      560: { latitude: 12.9716, longitude: 77.5946 },
      // Chennai
      600: { latitude: 13.0827, longitude: 80.2707 },
      // Hyderabad
      500: { latitude: 17.385, longitude: 78.4867 },
      // Pune
      411: { latitude: 18.5204, longitude: 73.8567 },
      // Kolkata
      700: { latitude: 22.5726, longitude: 88.3639 },
      // Ahmedabad
      380: { latitude: 23.0225, longitude: 72.5714 },
    };

    const prefix = pincode.substring(0, 3);
    return pincodeMap[prefix] || { latitude: 28.6139, longitude: 77.209 };
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  isValidCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    );
  }
}

const geocodingService = new GeocodingService();

export default geocodingService;

export const geocodeAddress = (address) =>
  geocodingService.geocodeAddress(address);
export const calculateDistance = (lat1, lon1, lat2, lon2) =>
  geocodingService.calculateDistance(lat1, lon1, lat2, lon2);
export const isValidCoordinates = (lat, lng) =>
  geocodingService.isValidCoordinates(lat, lng);
