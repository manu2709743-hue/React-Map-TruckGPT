/**
 * Leaflet Icon Configurations
 * Custom map marker icons used in the application
 */

import L from 'leaflet';

/**
 * Custom car icon for the moving vehicle marker
 * Uses a cartoon-style car image from Flaticon
 */
export const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/743/743922.png',
  iconSize: [40, 40],      // Size of the icon
  iconAnchor: [20, 20],    // Point of the icon that corresponds to marker's location
});