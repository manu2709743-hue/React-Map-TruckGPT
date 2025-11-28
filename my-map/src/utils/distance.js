/**
 * Distance Calculation Utilities
 * Contains functions for calculating distances between geographic coordinates
 */

/**
 * Calculate the distance between two geographic points using the Haversine formula
 * 
 * The Haversine formula determines the great-circle distance between two points
 * on a sphere given their longitudes and latitudes.
 * 
 * @param {Array} point1 - First point as [latitude, longitude]
 * @param {Array} point2 - Second point as [latitude, longitude]
 * @returns {number} Distance in meters between the two points
 * 
 * @example
 * const distance = distanceInMeters([28.6139, 77.209], [28.6150, 77.210]);
 * console.log(distance); // Distance in meters
 */
export function distanceInMeters(point1, point2) {
  const EARTH_RADIUS_METERS = 6371000; // Earth's radius in meters
  
  // Convert degrees to radians
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  
  const lat1 = toRadians(point1[0]);
  const lon1 = toRadians(point1[1]);
  const lat2 = toRadians(point2[0]);
  const lon2 = toRadians(point2[1]);
  
  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;
  
  // Haversine formula
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  
  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return EARTH_RADIUS_METERS * centralAngle;
}