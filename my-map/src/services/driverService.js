import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG } from '../constants';

/**
 * Driver Service
 * Handles API calls for driver-related data
 */

/**
 * Fetch driver details by driver ID
 * @param {string} driverId - The driver ID (e.g., "D0001")
 * @returns {Promise} - Promise resolving to driver details
 */
export const fetchDriverDetails = async (driverId) => {
  try {
    const filter = `driverId eq '${driverId}'`;
    const encodedFilter = encodeURIComponent(filter);
    const url = `${API_ENDPOINTS.DRIVER_DETAILS_BASE}/?filter=${encodedFilter}`;

    const response = await axios.get(url, {
      auth: API_CONFIG.AUTH_CREDENTIALS,
    });

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
