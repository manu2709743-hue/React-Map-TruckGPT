import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { distanceInMeters } from '../utils/distance';
import { fetchAllRoutes, parseRouteFromBackend } from '../services/routeService';

// Create context
const VehicleContext = createContext();

// Provider component
export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleRoutes, setVehicleRoutes] = useState({});
  const [vehiclePositions, setVehiclePositions] = useState({});
  const [vehicleStatuses, setVehicleStatuses] = useState({});
  const [currentIndices, setCurrentIndices] = useState({});
  const [isMoving, setIsMoving] = useState(false);
  const [tolls, setTolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);
  const crossedTollsRef = useRef(new Set());

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehiclesRes, tollsRes] = await Promise.all([
          fetch('/data/vehicles.json'),
          fetch('/data/tolls.json'),
        ]);

        const vehiclesData = await vehiclesRes.json();
        const tollsData = await tollsRes.json();

        // Fetch routes from backend
        let routesData = {};
        try {
          const backendResponse = await fetchAllRoutes();
          const backendRoutes = backendResponse.items || [];
          // Process backend routes - get latest route for each vehicle
          const latestRoutes = {};
          backendRoutes.forEach(routeItem => {
            if (routeItem.vId && routeItem.route) {
              // If no route for this vehicle yet, or this one is newer (assuming higher ID means newer)
              if (!latestRoutes[routeItem.vId] || routeItem.id > latestRoutes[routeItem.vId].id) {
                latestRoutes[routeItem.vId] = routeItem;
              }
            }
          });
          // Parse routes for latest entries
          Object.values(latestRoutes).forEach(routeItem => {
            routesData[routeItem.vId] = parseRouteFromBackend(routeItem.route);
          });
        } catch (error) {
          console.error('Error fetching routes from backend:', error);
          // Fallback to empty routes if backend fails
        }

        setVehicles(vehiclesData);
        setVehicleRoutes(routesData);
        setTolls(tollsData);

        // Initialize positions, statuses, and indices
        const initialPositions = {};
        const initialStatuses = {};
        const initialIndices = {};
        vehiclesData.forEach(vehicle => {
          const route = routesData[vehicle.id];
          if (route && route.length > 0) {
            initialPositions[vehicle.id] = [route[0].lat, route[0].lng];
            initialStatuses[vehicle.id] = 'Not Started';
            initialIndices[vehicle.id] = 0;
          }
        });

        setVehiclePositions(initialPositions);
        setVehicleStatuses(initialStatuses);
        setCurrentIndices(initialIndices);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Movement functions
  const startMovement = useCallback(() => {
    if (intervalRef.current) return; // Only check if interval is already running
    setIsMoving(true);
    crossedTollsRef.current.clear();

    intervalRef.current = setInterval(() => {
      setCurrentIndices(prevIndices => {
        const newIndices = { ...prevIndices };
        let allDelivered = true;

        // Use functional update for positions to avoid stale closure
        setVehiclePositions(prevPositions => {
          const newPositions = { ...prevPositions };

          vehicles.forEach(vehicle => {
            const route = vehicleRoutes[vehicle.id];
            if (!route || route.length === 0) return;

            let currentIndex = newIndices[vehicle.id] || 0;

            // Check if vehicle has reached the end
            if (currentIndex >= route.length - 1) {
              // Stay at the last position
              newPositions[vehicle.id] = [route[route.length - 1].lat, route[route.length - 1].lng];
              return;
            }

            // Move to next point
            currentIndex++;
            const point = route[currentIndex];
            const position = [point.lat, point.lng];
            newPositions[vehicle.id] = position;
            newIndices[vehicle.id] = currentIndex;

            // Check if not at end yet
            if (currentIndex < route.length - 1) {
              allDelivered = false;
            }

            // Check for toll crossings
            const vehicleTolls = tolls[vehicle.id] || [];
            vehicleTolls.forEach(toll => {
              const tollKey = `${vehicle.id}-${toll.id}`;
              if (!crossedTollsRef.current.has(tollKey)) {
                const distance = distanceInMeters(position, [toll.latitude, toll.longitude]);
                if (distance <= 30) {
                  crossedTollsRef.current.add(tollKey);
                  toast.success(`${vehicle.name} crossed ${toll.name}`);
                }
              }
            });
          });

          return newPositions;
        });

        // Check if all vehicles are delivered based on their status
        const allVehiclesDelivered = vehicles.every(vehicle => vehicleStatuses[vehicle.id] === 'Delivered');
        if (allVehiclesDelivered) {
          setIsMoving(false);
        }

        return newIndices;
      });
    }, 3000);
  }, [vehicles, vehicleRoutes, tolls, vehicleStatuses]);

  const stopMovement = useCallback(() => {
    setIsMoving(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto start/stop movement based on isMoving state
  useEffect(() => {
    if (isMoving && !intervalRef.current && Object.keys(vehicleRoutes).length > 0) {
      startMovement();
    } else if (!isMoving && intervalRef.current) {
      stopMovement();
    }
  }, [isMoving, vehicleRoutes, startMovement, stopMovement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update status based on position
  useEffect(() => {
    const newStatuses = {};
    let hasChanges = false;

    vehicles.forEach(vehicle => {
      const position = vehiclePositions[vehicle.id];
      const route = vehicleRoutes[vehicle.id];
      if (!position || !route || route.length === 0) return;

      const startPoint = route[0];
      const endPoint = route[route.length - 1];
      const currentStatus = vehicleStatuses[vehicle.id] || 'Not Started';

      // Check if at end (within 10 meters)
      const distToEnd = Math.sqrt(
        Math.pow((position[0] - endPoint.lat) * 111000, 2) + // Rough conversion to meters
        Math.pow((position[1] - endPoint.lng) * 111000 * Math.cos(position[0] * Math.PI / 180), 2)
      );

      let newStatus = currentStatus;
      if (distToEnd < 10) { // Within 10 meters of end
        newStatus = 'Delivered';
      } else if (currentStatus === 'Not Started') {
        // Check if moved from start (within 10 meters of start = still at start)
        const distToStart = Math.sqrt(
          Math.pow((position[0] - startPoint.lat) * 111000, 2) +
          Math.pow((position[1] - startPoint.lng) * 111000 * Math.cos(position[0] * Math.PI / 180), 2)
        );
        if (distToStart > 10) {
          newStatus = 'On Route';
        }
      }

      if (newStatus !== currentStatus) {
        hasChanges = true;
        if (newStatus === 'On Route') {
          toast.info(`${vehicle.name} started for delivery`);
        } else if (newStatus === 'Delivered') {
          toast.success(`${vehicle.name} delivered`);
        }
      }
      newStatuses[vehicle.id] = newStatus;
    });

    if (hasChanges) {
      setVehicleStatuses(newStatuses);
    }
  }, [vehiclePositions, vehicles, vehicleRoutes, vehicleStatuses]);

  const value = {
    vehicles,
    setVehicles,
    vehicleRoutes,
    setVehicleRoutes,
    vehiclePositions,
    setVehiclePositions,
    vehicleStatuses,
    setVehicleStatuses,
    currentIndices,
    setCurrentIndices,
    isMoving,
    setIsMoving,
    startMovement,
    stopMovement,
    tolls,
    setTolls,
    isLoading,
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

// Hook to use context
export const useVehicleContext = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicleContext must be used within VehicleProvider');
  }
  return context;
};