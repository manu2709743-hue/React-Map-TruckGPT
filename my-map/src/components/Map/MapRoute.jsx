/**
 * MapRoute Component
 * Main map component that displays routes and handles car movement simulation
 * 
 * Features:
 * - Click to select start and end points on the map
 * - Fetch and display route using OpenRouteService API
 * - Load car position data from JSON file
 * - Animate car movement along the route
 * - Real-time validation of car position against the route
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
} from 'react-leaflet';
import axios from 'axios';
import { toast } from 'react-toastify';

// Import sub-components
import SelectPoints from './SelectPoints';
import PathStatus from './PathStatus';
import ControlButtons from '../UI/ControlButtons';

// Import utilities
import { isCarNearRoute, downloadJSON } from '../../utils';
import { fetchTolls, checkTollCrossing } from '../../utils/tollHelpers';

// Import constants
import {
  ORS_API_KEY,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAP_STYLE,
  TILE_LAYER_URL,
  CAR_MOVEMENT_SPEED,
  ROUTE_PROXIMITY_THRESHOLD,
  carIcon,
} from '../../constants';

// Import styles
import '../../styles/MapRoute.css';

/**
 * MapRoute - Main map component for route visualization and car tracking
 * 
 * @returns {JSX.Element} The complete map interface with controls
 */
function MapRoute() {
  // ================================
  // State Management
  // ================================
  
  // Route selection points
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  
  // Route data (array of [lat, lng] coordinates)
  const [route, setRoute] = useState([]);
  
  // Car simulation state
  const [carRoute, setCarRoute] = useState([]);           // Array of car positions from JSON
  const [carPosition, setCarPosition] = useState(null);   // Current car position
  const [isCarRunning, setIsCarRunning] = useState(false); // Is animation running?
  const [isCorrectPath, setIsCorrectPath] = useState(null); // Is car on correct route?

  // Toll state
  const [tolls, setTolls] = useState([]);                 // Array of toll objects
  const crossedTollsRef = useRef(new Set());             // Set to track crossed tolls


  // ================================
  // Route Operations
  // ================================

  /**
   * Fetch and display route from OpenRouteService API
   * Also downloads the route as JSON file
   */
  const drawRoute = async () => {
    if (!startPoint || !endPoint) return;

    // Build API URL with coordinates (note: ORS uses lng,lat format)
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startPoint[1]},${startPoint[0]}&end=${endPoint[1]},${endPoint[0]}`;

    try {
      const response = await axios.get(url);
      
      // Convert coordinates from [lng, lat] to [lat, lng] format for Leaflet
      const coordinates = response.data.features[0].geometry.coordinates.map(
        (coord) => [coord[1], coord[0]]
      );

      setRoute(coordinates);

      // Convert to {lat, lng} format for JSON download
      const jsonData = coordinates.map((point) => ({
        lat: point[0],
        lng: point[1],
      }));

      // Auto-download route as JSON file
      downloadJSON(jsonData);

      // Reset path status when new route is drawn
      setIsCorrectPath(null);
    } catch (error) {
      console.error('OpenRouteService API Error:', error);
      alert('Failed to fetch route. Please check the console for details.');
    }
  };

  // ================================
  // Car Operations
  // ================================

  /**
   * Load car route data from JSON file in public folder
   */
  const loadCarJSON = async () => {
    try {
      const response = await fetch('/carRoute.json');
      const data = await response.json();

      setCarRoute(data);
      setCarPosition([data[0].lat, data[0].lng]);
      setIsCorrectPath(null);

      // Load tolls when loading car route
      const tollData = await fetchTolls();
      setTolls(tollData);

      console.log('Car Route Loaded:', data);
      console.log('Tolls Loaded:', tollData);
    } catch (error) {
      console.error('Error loading car route JSON:', error);
      alert('Failed to load car JSON. Please check the console for details.');
    }
  };

  /**
   * Start car movement animation along the loaded route
   * Checks car position against the route in real-time
   */
  const startCarMovement = () => {
    if (!carRoute.length) {
      alert('Please load car JSON first.');
      return;
    }
    if (!route.length) {
      alert('Please select start & end points and show route first.');
      return;
    }

    setIsCarRunning(true);

    let currentIndex = 0;

    const animationInterval = setInterval(() => {
      // Stop animation when all points are visited
      if (currentIndex >= carRoute.length) {
        clearInterval(animationInterval);
        setIsCarRunning(false);
        return;
      }

      const point = carRoute[currentIndex];
      const currentCarPosition = [point.lat, point.lng];

      // Update car marker position
      setCarPosition(currentCarPosition);

      // Check if car is on the correct route in real-time
      const isOnPath = isCarNearRoute(route, currentCarPosition, ROUTE_PROXIMITY_THRESHOLD);
      setIsCorrectPath(isOnPath);

      // Check for toll crossings
      const newCrossings = checkTollCrossing(tolls, currentCarPosition[0], currentCarPosition[1], crossedTollsRef.current);
      newCrossings.forEach((toll) => {
        console.log('Showing toast for toll:', toll.name);
        toast.success(`Your car has successfully crossed ${toll.name}.`);
      });

      currentIndex++;
    }, CAR_MOVEMENT_SPEED);
  };

  // ================================
  // Reset Operation
  // ================================

  /**
   * Reset all state to initial values
   */
  const resetAll = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoute([]);
    setCarRoute([]);
    setCarPosition(null);
    setIsCarRunning(false);
    setIsCorrectPath(null);
    crossedTollsRef.current.clear();
  };

  // ================================
  // Render
  // ================================

  return (
    <div className="map-route-container">
      {/* Control Buttons */}
      <ControlButtons
        onShowRoute={drawRoute}
        onLoadCarJSON={loadCarJSON}
        onStartCar={startCarMovement}
        onReset={resetAll}
        canShowRoute={startPoint && endPoint}
        canStartCar={!isCarRunning && carRoute.length > 0 && route.length > 0}
      />

      {/* Path Status Indicator */}
      <PathStatus isCorrectPath={isCorrectPath} />

      {/* Map Container */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={MAP_STYLE}
        className="map-container"
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer url={TILE_LAYER_URL} />

        {/* Map Click Handler for Point Selection */}
        <SelectPoints
          startPoint={startPoint}
          endPoint={endPoint}
          setStartPoint={setStartPoint}
          setEndPoint={setEndPoint}
        />

        {/* Start Point Marker */}
        {startPoint && <Marker position={startPoint} />}
        
        {/* End Point Marker */}
        {endPoint && <Marker position={endPoint} />}

        {/* Route Polyline */}
        {route.length > 0 && (
          <Polyline positions={route} color="blue" weight={4} />
        )}

        {/* Car Marker */}
        {carPosition && <Marker position={carPosition} icon={carIcon} />}
      </MapContainer>
    </div>
  );
}

export default MapRoute;