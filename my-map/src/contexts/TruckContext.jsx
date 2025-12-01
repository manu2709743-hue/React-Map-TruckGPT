import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { distanceInMeters } from '../utils/distance';

// Create context
const TruckContext = createContext();

// Provider component
export const TruckProvider = ({ children }) => {
  const [trucks, setTrucks] = useState([]);
  const [truckRoutes, setTruckRoutes] = useState({});
  const [truckPositions, setTruckPositions] = useState({});
  const [truckStatuses, setTruckStatuses] = useState({});
  const [currentIndices, setCurrentIndices] = useState({});
  const [isMoving, setIsMoving] = useState(false);
  const [tolls, setTolls] = useState([]);
  const intervalRef = useRef(null);
  const crossedTollsRef = useRef(new Set());

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [trucksRes, routesRes, tollsRes] = await Promise.all([
          fetch('/data/trucks.json'),
          fetch('/data/truckRoutes.json'),
          fetch('/data/tolls.json'),
        ]);

        const trucksData = await trucksRes.json();
        const routesData = await routesRes.json();
        const tollsData = await tollsRes.json();

        setTrucks(trucksData);
        setTruckRoutes(routesData);
        setTolls(tollsData);

        // Initialize positions, statuses, and indices
        const initialPositions = {};
        const initialStatuses = {};
        const initialIndices = {};
        trucksData.forEach(truck => {
          const route = routesData[truck.id];
          if (route && route.length > 0) {
            initialPositions[truck.id] = [route[0].lat, route[0].lng];
            initialStatuses[truck.id] = 'Not Started';
            initialIndices[truck.id] = 0;
          }
        });

        setTruckPositions(initialPositions);
        setTruckStatuses(initialStatuses);
        setCurrentIndices(initialIndices);
      } catch (error) {
        console.error('Error loading data:', error);
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
        setTruckPositions(prevPositions => {
          const newPositions = { ...prevPositions };

          trucks.forEach(truck => {
            const route = truckRoutes[truck.id];
            if (!route || route.length === 0) return;

            let currentIndex = newIndices[truck.id] || 0;

            // Check if truck has reached the end
            if (currentIndex >= route.length - 1) {
              // Stay at the last position
              newPositions[truck.id] = [route[route.length - 1].lat, route[route.length - 1].lng];
              return;
            }

            // Move to next point
            currentIndex++;
            const point = route[currentIndex];
            const position = [point.lat, point.lng];
            newPositions[truck.id] = position;
            newIndices[truck.id] = currentIndex;

            // Check if not at end yet
            if (currentIndex < route.length - 1) {
              allDelivered = false;
            }

            // Check for toll crossings
            const truckTolls = tolls[truck.id] || [];
            truckTolls.forEach(toll => {
              const tollKey = `${truck.id}-${toll.id}`;
              if (!crossedTollsRef.current.has(tollKey)) {
                const distance = distanceInMeters(position, [toll.latitude, toll.longitude]);
                if (distance <= 30) {
                  crossedTollsRef.current.add(tollKey);
                  toast.success(`${truck.name} crossed ${toll.name}`);
                }
              }
            });
          });

          return newPositions;
        });

        // Check if all trucks are delivered based on their status
        const allTrucksDelivered = trucks.every(truck => truckStatuses[truck.id] === 'Delivered');
        if (allTrucksDelivered) {
          setIsMoving(false);
        }

        return newIndices;
      });
    }, 3000);
  }, [trucks, truckRoutes, tolls, truckStatuses]);

  const stopMovement = useCallback(() => {
    setIsMoving(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto start/stop movement based on isMoving state
  useEffect(() => {
    if (isMoving && !intervalRef.current && Object.keys(truckRoutes).length > 0) {
      startMovement();
    } else if (!isMoving && intervalRef.current) {
      stopMovement();
    }
  }, [isMoving, truckRoutes, startMovement, stopMovement]);

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

    trucks.forEach(truck => {
      const position = truckPositions[truck.id];
      const route = truckRoutes[truck.id];
      if (!position || !route || route.length === 0) return;

      const startPoint = route[0];
      const endPoint = route[route.length - 1];
      const currentStatus = truckStatuses[truck.id] || 'Not Started';

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
          toast.info(`${truck.name} started for delivery`);
        } else if (newStatus === 'Delivered') {
          toast.success(`${truck.name} delivered`);
        }
      }
      newStatuses[truck.id] = newStatus;
    });

    if (hasChanges) {
      setTruckStatuses(newStatuses);
    }
  }, [truckPositions, trucks, truckRoutes, truckStatuses]);

  const value = {
    trucks,
    setTrucks,
    truckRoutes,
    setTruckRoutes,
    truckPositions,
    setTruckPositions,
    truckStatuses,
    setTruckStatuses,
    currentIndices,
    setCurrentIndices,
    isMoving,
    setIsMoving,
    startMovement,
    stopMovement,
    tolls,
    setTolls,
  };

  return (
    <TruckContext.Provider value={value}>
      {children}
    </TruckContext.Provider>
  );
};

// Hook to use context
export const useTruckContext = () => {
  const context = useContext(TruckContext);
  if (!context) {
    throw new Error('useTruckContext must be used within TruckProvider');
  }
  return context;
};