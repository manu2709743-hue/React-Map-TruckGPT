/**
 * Vehicle Service
 * Handles backend API operations for vehicle details
 */

import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../constants';

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
 * Fetch all vehicles from backend (GET)
 * @returns {Promise} Vehicle details data
 */
export const fetchAllVehicles = async () => {
  try {
    const url = `${API_CONFIG.BACKEND_BASE_URL}${API_ENDPOINTS.VEHICLE_DETAILS}`;
    console.log('Fetching vehicles from backend:', url);

    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });

    console.log('Vehicles fetched successfully:', response.data);

    // Assuming the backend returns { items: [...] } like trip details
    const vehicles = response.data.items || response.data || [];
    return vehicles;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

/**
 * Fetch vehicle by ID from backend (GET)
 * @param {String} vehicleId - Vehicle ID to fetch
 * @returns {Promise} Vehicle data
 */
export const fetchVehicleById = async (vehicleId) => {
  try {
    const url = `${API_CONFIG.BACKEND_BASE_URL}${API_ENDPOINTS.VEHICLE_DETAILS}/${vehicleId}`;
    console.log('Fetching vehicle by ID from backend:', url);

    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });

    console.log('Vehicle fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle by ID:', error);
    throw error;
  }
};

/**
 * Create new vehicle (POST)
 * @param {Object} vehicleData - Vehicle data to create
 * @returns {Promise} Response with vehicle ID
 */
export const createVehicle = async (vehicleData) => {
  try {
    const url = `${API_CONFIG.BACKEND_BASE_URL}${API_ENDPOINTS.VEHICLE_DETAILS}`;
    console.log('Creating vehicle:', vehicleData);

    const response = await axios.post(url, vehicleData, {
      headers: getAuthHeader(),
    });

    console.log('Vehicle created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

/**
 * Update vehicle (PUT)
 * @param {String} vehicleId - Vehicle ID to update
 * @param {Object} vehicleData - Updated vehicle data
 * @returns {Promise} Updated response
 */
export const updateVehicle = async (vehicleId, vehicleData) => {
  try {
    const url = `${API_CONFIG.BACKEND_BASE_URL}${API_ENDPOINTS.VEHICLE_DETAILS}/${vehicleId}`;
    console.log('Updating vehicle:', vehicleData);

    const response = await axios.put(url, vehicleData, {
      headers: getAuthHeader(),
    });

    console.log('Vehicle updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

/**
 * Delete vehicle (DELETE)
 * @param {String} vehicleId - Vehicle ID to delete
 * @returns {Promise} Delete response
 */
export const deleteVehicle = async (vehicleId) => {
  try {
    const url = `${API_CONFIG.BACKEND_BASE_URL}${API_ENDPOINTS.VEHICLE_DETAILS}/${vehicleId}`;
    console.log('Deleting vehicle:', vehicleId);

    const response = await axios.delete(url, {
      headers: getAuthHeader(),
    });

    console.log('Vehicle deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

export default {
  fetchAllVehicles,
  fetchVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};