/**
 * Route Service
 * Handles route mapping operations with backend API
 */

import axios from 'axios';
import { API_CONFIG } from '../constants';

const ROUTE_MAPPER_API = '/api/routemappers';

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
 * Save route to backend (POST)
 * @param {Array} route - Array of {lat, lng} objects
 * @param {String} vehicleId - Vehicle ID
 * @returns {Promise} Response with route ID
 */
export const saveRoute = async (route, vehicleId) => {
  try {
    const payload = {
      route: route,
      vId: vehicleId,
    };

    console.log('Saving route to backend:', payload);
    
    const response = await axios.post(ROUTE_MAPPER_API, payload, {
      headers: getAuthHeader(),
    });

    console.log('Route saved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving route:', error);
    throw error;
  }
};

/**
 * Fetch route from backend (GET)
 * @param {String} routeId - Route ID from previous POST response
 * @returns {Promise} Route data
 */
export const fetchRoute = async (routeId) => {
  try {
    const url = `${ROUTE_MAPPER_API}${routeId}`;
    console.log('Fetching route from backend:', url);

    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });

    console.log('Route fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
};

/**
 * Fetch route by vehicle ID (GET)
 * @param {String} vehicleId - Vehicle ID (vId)
 * @returns {Promise} Route data
 */
export const fetchRouteByVehicleId = async (vehicleId) => {
  try {
    // Query backend for routes with specific vId
    const url = `${ROUTE_MAPPER_API}?filter=vId eq '${vehicleId}'`;
    console.log('Fetching route for vehicle:', vehicleId);

    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });

    console.log('Route fetched for vehicle:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching route for vehicle:', error);
    throw error;
  }
};

/**
 * Update route (PUT/PATCH)
 * @param {String} routeId - Route ID to update
 * @param {Array} route - New route array
 * @param {String} vehicleId - Vehicle ID
 * @returns {Promise} Updated response
 */
export const updateRoute = async (routeId, route, vehicleId) => {
  try {
    const url = `${ROUTE_MAPPER_API}${routeId}`;
    const payload = {
      route: route,
      vId: vehicleId,
    };

    console.log('Updating route on backend:', payload);
    
    const response = await axios.patch(url, payload, {
      headers: getAuthHeader(),
    });

    console.log('Route updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating route:', error);
    throw error;
  }
};

/**
 * Parse route string from backend response
 * Backend returns route as string like "[{lat=28.836388, lng=77.09335}, ...]"
 * @param {String} routeString - Route string from backend
 * @returns {Array} Parsed route array
 */
export const parseRouteFromBackend = (routeString) => {
  try {
    // Remove outer brackets and split by closing brace
    const cleanedString = routeString
      .replace(/^\[/, '')
      .replace(/\]$/, '')
      .split('},')
      .map((item, index, arr) => {
        // Add closing brace if not the last item
        return index === arr.length - 1 ? item + '}' : item + '}';
      });

    const route = cleanedString.map(item => {
      const matches = item.match(/lat\s*=\s*([\d.-]+),\s*lng\s*=\s*([\d.-]+)/);
      if (matches) {
        return {
          lat: parseFloat(matches[1]),
          lng: parseFloat(matches[2]),
        };
      }
      return null;
    }).filter(item => item !== null);

    return route;
  } catch (error) {
    console.error('Error parsing route from backend:', error);
    throw error;
  }
};

export default {
  saveRoute,
  fetchRoute,
  fetchRouteByVehicleId,
  updateRoute,
  parseRouteFromBackend,
};
