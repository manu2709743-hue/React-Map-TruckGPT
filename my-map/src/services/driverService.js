import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG } from '../constants';

/**
 * Driver Service
 * Handles API calls for driver-related data
 */

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
 * Fetch driver details by driver ID
 * @param {string} driverId - The driver ID (e.g., "D0001")
 * @returns {Promise} - Promise resolving to driver details
 */
export const fetchDriverDetails = async (driverId) => {
  try {
    const filter = `driverId eq '${driverId}'`;
    const encodedFilter = encodeURIComponent(filter);
    const url = `${API_CONFIG.BACKEND_BASE_URL}${API_ENDPOINTS.DRIVER_DETAILS_BASE}/?filter=${encodedFilter}`;
    console.log('Fetching driver details from backend:', url);

    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });

    console.log('Driver details fetched successfully:', response.data);

    // Extract the first item from the response
    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching driver details:', error);
    throw error;
  }
};

export default {
  fetchDriverDetails,
};
