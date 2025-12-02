/**
 * API Constants
 * Centralized API endpoints and authentication
 */

export const API_CONFIG = {
  BACKEND_BASE_URL: '/api/backend',
  OPENROUTE_API: 'https://api.openrouteservice.org/v2/directions/driving-car',
  AUTH_CREDENTIALS: {
    username: 'Admin@khichad.com',
    password: 'Admin@khichad',
  },
  ROUTE_SERVICE_API_KEY: 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjExYWI5YjU0ODgwNzQ0YzY4OTI3YjUyYmFhOTRiNTBhIiwiaCI6Im11cm11cjY0In0=',
};

export const API_ENDPOINTS = {
  VEHICLE_DETAILS: '/api/backend/o/c/vehicledetails',
  DRIVER_DETAILS_BASE: '/api/backend/o/c/driverdetails',
};

/**
 * Data File Paths
 */
export const DATA_FILES = {
  TRUCKS: '/data/trucks.json',
  TRUCK_ROUTES: '/data/truckRoutes.json',
  TOLLS: '/data/tolls.json',
};

/**
 * Route Status Constants
 */
export const TRUCK_STATUS = {
  NOT_STARTED: 'Not Started',
  ON_ROUTE: 'On Route',
  DELIVERED: 'Delivered',
};

/**
 * Status Badge Classes
 */
export const STATUS_BADGE_CLASS = {
  'Not Started': 'status-not-started',
  'On Route': 'status-on-route',
  'Delivered': 'status-delivered',
};

/**
 * Map Constants
 */
export const MAP_CONFIG = {
  DEFAULT_CENTER: [20.5937, 78.9629], // India center
  DEFAULT_ZOOM: 6,
  TRUCK_MARKER_SIZE: [40, 40],
  HIGHLIGHTED_TRUCK_MARKER_SIZE: [50, 50],
  TOLL_MARKER_SIZE: [30, 30],
};

/**
 * Distance Calculation Constants
 */
export const DISTANCE_CONFIG = {
  TOLL_DETECTION_RADIUS: 30, // meters
  ARRIVAL_DISTANCE_THRESHOLD: 10, // meters
  MOVEMENT_UPDATE_INTERVAL: 3000, // milliseconds
};

/**
 * UI Constants
 */
export const UI_CONFIG = {
  MODAL_MAX_WIDTH: '500px',
  ANIMATION_DURATION: '0.3s',
  ROUTES_TO_DISPLAY: 'all', // or 'selected'
};

/**
 * Truck Movement Configuration
 */
export const TRUCK_MOVEMENT = {
  UPDATE_INTERVAL: 3000, // milliseconds
  POSITION_UPDATE_STEP: 1, // Update every nth route point
};

/**
 * Toast Notifications Config
 */
export const TOAST_CONFIG = {
  DURATION: 3000,
  POSITION: 'bottom-right',
};
