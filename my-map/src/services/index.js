/**
 * Services Index
 * Central export point for all services
 */

export { fetchDriverDetails } from './driverService';
export { 
  saveRoute, 
  fetchRoute, 
  fetchRouteByVehicleId,
  updateRoute,
  parseRouteFromBackend 
} from './routeService';
export {
  fetchTripDetails,
  createTripDetails,
  updateTripDetails,
  deleteTripDetails,
  parseRouteFromBackend as parseTripRouteFromBackend,
  formatTripDataForBackend
} from './tripDetailsService';
export {
  createRouteViaMapper,
  fetchRoutesFromMapper,
  geocodeAddress,
  reverseGeocode,
  calculateDistance
} from './routeMapperService';
export {
  fetchAllVehicles,
  fetchVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from './vehicleService';
