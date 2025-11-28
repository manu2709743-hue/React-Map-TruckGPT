/**
 * Route Helper Utilities
 * Functions for route validation and proximity checking
 */

import { distanceInMeters } from './distance';
import { ROUTE_PROXIMITY_THRESHOLD } from '../constants/mapConfig';

/**
 * Check if a car position is near the defined route
 * 
 * This function checks if the car's current position is within
 * a specified threshold distance from any point on the route.
 * Used to verify if the car is following the correct path.
 * 
 * @param {Array} routePoints - Array of route coordinates [[lat, lng], ...]
 * @param {Array} carPoint - Current car position as [lat, lng]
 * @param {number} thresholdMeters - Maximum allowed distance from route (default: 30m)
 * @returns {boolean} True if car is within threshold distance from route
 * 
 * @example
 * const isNear = isCarNearRoute(routeCoords, [28.6139, 77.209], 30);
 * console.log(isNear); // true or false
 */
export function isCarNearRoute(routePoints, carPoint, thresholdMeters = ROUTE_PROXIMITY_THRESHOLD) {
  // Return false if route or car position is not available
  if (!routePoints || routePoints.length === 0 || !carPoint) {
    return false;
  }

  
  // Check if car is within threshold distance from any route point
  return routePoints.some((routePoint) => {
    const distance = distanceInMeters(
      [routePoint[0], routePoint[1]],
      [carPoint[0], carPoint[1]]
    );
    return distance <= thresholdMeters;
  });
}