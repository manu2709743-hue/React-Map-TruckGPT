/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Start latitude
 * @param {number} lon1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lon2 - End longitude
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Check if current position is within toll radius
 * @param {number} currentLat - Current latitude
 * @param {number} currentLon - Current longitude
 * @param {object} toll - Toll object with lat, lon, radius
 * @returns {boolean} True if within radius
 */
export const isNearToll = (currentLat, currentLon, toll) => {
  const distance = calculateDistance(
    currentLat,
    currentLon,
    toll.latitude,
    toll.longitude
  );
  return distance <= toll.radius;
};

/**
 * Check for toll crossing and return crossed tolls
 * @param {array} tolls - Array of toll objects
 * @param {number} currentLat - Current latitude
 * @param {number} currentLon - Current longitude
 * @param {Set} crossedTolls - Set to track already crossed tolls
 * @returns {array} Array of newly crossed tolls
 */
export const checkTollCrossing = (tolls, currentLat, currentLon, crossedTolls) => {
  const newCrossings = [];

  tolls.forEach((toll) => {
    const distance = calculateDistance(
      currentLat,
      currentLon,
      toll.latitude,
      toll.longitude
    );

    if (!crossedTolls.has(toll.id) && distance <= toll.radius) {
      crossedTolls.add(toll.id);
      newCrossings.push(toll);
      console.log(`🎯 Toll detected at distance: ${distance.toFixed(2)}m (${toll.name})`);
    }
  });

  return newCrossings;
};

/**
 * Fetch tolls data from JSON file
 * @returns {Promise<array>} Array of toll objects
 */
export const fetchTolls = async () => {
  try {
    console.log('🔄 Fetching tolls from /tolls.json...');
    const response = await fetch('/tolls.json');
    console.log('📡 Fetch response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tolls data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Tolls fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching tolls:', error);
    return [];
  }
};
