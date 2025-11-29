import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Create context
const TruckContext = createContext();

// Provider component
export const TruckProvider = ({ children }) => {
  const [trucks, setTrucks] = useState([]);
  const [truckRoutes, setTruckRoutes] = useState({});
  const [truckPositions, setTruckPositions] = useState({});
  const [truckStatuses, setTruckStatuses] = useState({});
  const [isMoving, setIsMoving] = useState(false);
  const [tolls, setTolls] = useState([]);

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

        // Initialize positions and statuses
        const initialPositions = {};
        const initialStatuses = {};
        trucksData.forEach(truck => {
          const route = routesData[truck.id];
          if (route && route.length > 0) {
            initialPositions[truck.id] = [route[0].lat, route[0].lng];
            initialStatuses[truck.id] = 'Not Started';
          }
        });

        setTruckPositions(initialPositions);
        setTruckStatuses(initialStatuses);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
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
          // Auto-stop movement when delivered
          setIsMoving(false);
        }
      }
      newStatuses[truck.id] = newStatus;
    });

    if (hasChanges) {
      setTruckStatuses(newStatuses);
    }
  }, [truckPositions, trucks, truckRoutes]);

  const value = {
    trucks,
    setTrucks,
    truckRoutes,
    setTruckRoutes,
    truckPositions,
    setTruckPositions,
    truckStatuses,
    setTruckStatuses,
    isMoving,
    setIsMoving,
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