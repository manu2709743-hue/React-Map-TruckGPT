/**
 * Route Mapper Service
 * Handles route mapping operations with backend route mapper API
 */

import axios from 'axios';
import { API_CONFIG } from '../constants';

/**
 * Create Basic Auth header
 */
const getAuthHeader = () => {
  const credentials = `${API_CONFIG.AUTH_CREDENTIALS.username}:${API_CONFIG.AUTH_CREDENTIALS.password}`;
  const encodedCredentials = btoa(credentials);
  return {
    'Authorization': `Basic ${encodedCredentials}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Create route via route mapper API (POST)
 * @param {Object} routeData - Route data with start/end points
 * @returns {Promise} Response with route mapper data
 */
export const createRouteViaMapper = async (routeData) => {
  try {
    const url = `${API_CONFIG.BACKEND_BASE_URL}/api/routemappers`;
    console.log('Creating route via mapper:', routeData);
    
    const response = await axios.post(url, routeData, {
      headers: getAuthHeader(),
    });

    console.log('Route created successfully via mapper:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating route via mapper:', error);
    throw error;
  }
};

/**
 * Fetch routes from route mapper (GET)
 * @returns {Promise} Route mapper data
 */
export const fetchRoutesFromMapper = async () => {
  try {
    const url = `${API_CONFIG.BACKEND_BASE_URL}/api/routemappers`;
    console.log('Fetching routes from mapper');

    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });

    console.log('Routes fetched from mapper:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching routes from mapper:', error);
    throw error;
  }
};

/**
 * Geocode address to coordinates using external service
 * @param {String} address - Address to geocode
 * @returns {Promise} Coordinates {lat, long}
 */
export const geocodeAddress = async (address) => {
  try {
    // Using a simple geocoding service (you can replace with your preferred service)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    
    const response = await axios.get(url);
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        long: parseFloat(result.lon),
      };
    } else {
      throw new Error('Address not found');
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

/**
 * Reverse geocode coordinates to address
 * @param {Number} lat - Latitude
 * @param {Number} lng - Longitude  
 * @returns {Promise} Address string
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    
    const response = await axios.get(url);
    
    if (response.data && response.data.display_name) {
      return response.data.display_name;
    } else {
      return `${lat}, ${lng}`;
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return `${lat}, ${lng}`;
  }
};

/**
 * Calculate distance between two points
 * @param {Object} point1 - First point {lat, long}
 * @param {Object} point2 - Second point {lat, long}
 * @returns {Number} Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.long - point1.long) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default {
  createRouteViaMapper,
  fetchRoutesFromMapper,
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
};