/**
 * TripDetails Service
 * Handles backend API operations for trip details
 */

import axios from 'axios';
import { API_CONFIG } from '../constants';

const TRIP_DETAILS_API = '/o/c/tripdetailses';

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
 * Fetch all trip details from backend (GET)
 * @returns {Promise} Trip details data
 */
export const fetchTripDetails = async () => {
  try {
    const url = `${API_CONFIG.BACKEND_BASE_URL}${TRIP_DETAILS_API}`;
    console.log('Fetching trip details from backend:', url);

    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });

    console.log('Trip details fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching trip details:', error);
    throw error;
  }
};

/**
 * Create new trip details (POST)
 * @param {Object} tripData - Trip data to save
 * @returns {Promise} Response with trip details ID
 */
export const createTripDetails = async (tripData) => {
  try {
    const url = `${API_CONFIG.BACKEND_BASE_URL}${TRIP_DETAILS_API}`;
    console.log('Creating trip details:', tripData);
    
    const response = await axios.post(url, tripData, {
      headers: getAuthHeader(),
    });

    console.log('Trip details created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating trip details:', error);
    throw error;
  }
};

/**
 * Update trip details (PUT)
 * @param {String} tripId - Trip ID to update
 * @param {Object} tripData - Updated trip data
 * @returns {Promise} Updated response
 */
export const updateTripDetails = async (tripId, tripData) => {
  try {
    const url = `${API_CONFIG.BACKEND_BASE_URL}${TRIP_DETAILS_API}/${tripId}`;
    console.log('Updating trip details:', tripData);
    
    const response = await axios.put(url, tripData, {
      headers: getAuthHeader(),
    });

    console.log('Trip details updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating trip details:', error);
    throw error;
  }
};

/**
 * Delete trip details (DELETE)
 * @param {String} tripId - Trip ID to delete
 * @returns {Promise} Delete response
 */
export const deleteTripDetails = async (tripId) => {
  try {
    const url = `${API_CONFIG.BACKEND_BASE_URL}${TRIP_DETAILS_API}/${tripId}`;
    console.log('Deleting trip details:', tripId);

    const response = await axios.delete(url, {
      headers: getAuthHeader(),
    });

    console.log('Trip details deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting trip details:', error);
    throw error;
  }
};

/**
 * Parse route data from backend response
 * Backend returns route as string like "[{lat=28.836388, lng=77.09335}, ...]"
 * @param {String} routeString - Route string from backend
 * @returns {Array} Parsed route array
 */
export const parseRouteFromBackend = (routeString) => {
  try {
    if (!routeString || typeof routeString !== 'string') {
      return [];
    }

    // Clean the string and parse
    const cleanedString = routeString
      .replace(/^\[/, '')
      .replace(/\]$/, '')
      .split('},')
      .map((item, index, arr) => {
        return index === arr.length - 1 ? item + '}' : item + '}';
      });

    const route = cleanedString.map(item => {
      const matches = item.match(/lat\s*=\s*([\d.-]+),\s*long\s*=\s*([\d.-]+)/);
      if (matches) {
        return {
          lat: parseFloat(matches[1]),
          long: parseFloat(matches[2]),
        };
      }
      return null;
    }).filter(item => item !== null);

    return route;
  } catch (error) {
    console.error('Error parsing route from backend:', error);
    return [];
  }
};

/**
 * Format trip data for backend
 * @param {Array} startingPoint - Array with lat,long
 * @param {Array} endingPoint - Array with lat,long
 * @param {String} vehicleId - Vehicle ID
 * @param {String} vehicleNumber - Vehicle Number
 * @param {Object} vehicleStatus - Vehicle status object
 * @returns {Object} Formatted data for backend with vId and vNumber fields
 */
export const formatTripDataForBackend = (startingPoint, endingPoint, vehicleId, vehicleNumber, vehicleStatus) => {
  return {
    staringPoint: startingPoint,
    endingPoint: endingPoint,
    vId: vehicleId,
    vNumber: vehicleNumber,
    vehicleStatus: vehicleStatus,
  };
};

export default {
  fetchTripDetails,
  createTripDetails,
  updateTripDetails,
  deleteTripDetails,
  parseRouteFromBackend,
  formatTripDataForBackend,
};