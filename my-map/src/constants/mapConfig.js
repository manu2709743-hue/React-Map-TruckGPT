/**
 * Map Configuration Constants
 * Contains API keys, default coordinates, and map settings
 */

// OpenRouteService API Key for route calculation
export const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjExYWI5YjU0ODgwNzQ4YzY4OTI3YjUyYmFhOTRiNTBhIiwiaCI6Im11cm11cjY0In0=';

// Default map center coordinates (New Delhi, India)
export const DEFAULT_CENTER = [28.6139, 77.209];

// Default zoom level
export const DEFAULT_ZOOM = 13;

// Map container dimensions
export const MAP_STYLE = {
  height: '600px',
  width: '100%',
};

// OpenStreetMap tile layer URL
export const TILE_LAYER_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// Car movement animation speed (in milliseconds)
export const CAR_MOVEMENT_SPEED = 900;

// Distance threshold for route proximity check (in meters)
export const ROUTE_PROXIMITY_THRESHOLD = 30;