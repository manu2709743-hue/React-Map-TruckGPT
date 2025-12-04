/**
 * TripDetails Component
 * Displays trip details with backend API integration
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Table, StatusBadge } from './index';
import { fetchTripDetails, createTripDetails, formatTripDataForBackend, parseRouteFromBackend } from '../services/tripDetailsService';
import { geocodeAddress, createRouteViaMapper } from '../services/routeMapperService';
import { saveRoute } from '../services/routeService';
import { useVehicleContext } from '../contexts/VehicleContext';
import { API_ENDPOINTS } from '../constants';
import { Button } from './index';
import '../styles/vehicle-list.css';

/**
 * TripDetails Component
 * Fetches and displays trip details from backend API
 */
const TripDetails = () => {
  const [tripDetails, setTripDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [startPoint, setStartPoint] = useState({ lat: '', long: '' });
  const [endPoint, setEndPoint] = useState({ lat: '', long: '' });
  const navigate = useNavigate();
  const { vehicles, isLoading: vehiclesLoading } = useVehicleContext(); // Get all available vehicles

  // Load trip details from backend
  useEffect(() => {
    const loadTripDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchTripDetails();
        
        // Extract items from the response
        const items = response.items || [];
        console.log('Loaded trip details:', items);
        
        setTripDetails(items);
        setLoading(false);
        toast.success('Trip details loaded successfully');
      } catch (error) {
        console.error('Error loading trip details:', error);
        toast.error('Failed to load trip details from backend');
        setLoading(false);
      }
    };

    loadTripDetails();
  }, []);

  // Create combined data: show all vehicles, with trip details if available
  const getCombinedVehicleData = () => {
    const tripDetailsMap = {};
    
    // Create a map of trip details by vId (new field name from backend)
    tripDetails.forEach(trip => {
      if (trip.vId) {
        tripDetailsMap[trip.vId] = trip;
      }
    });

    // Combine vehicles with their trip details
    const combinedData = vehicles.map(vehicle => {
      const tripDetail = tripDetailsMap[vehicle.vId] || null;
      
      return {
        vehicleId: vehicle.vId,
        vehicleNumber: vehicle.vNumber,
        staringPoint: tripDetail?.staringPoint || null,
        endingPoint: tripDetail?.endingPoint || null,
        vehicleStatus: tripDetail?.vehicleStatus || { key: 'notStarted', name: 'Not Started' },
        hasTripData: !!tripDetail
      };
    });

    console.log('Combined vehicle data:', combinedData);
    return combinedData;
  };

  // Reload data when component becomes visible (for when user returns from map)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, reload data
        const reloadTripDetails = async () => {
          try {
            const response = await fetchTripDetails();
            const items = response.items || [];
            setTripDetails(items);
            console.log('Trip details refreshed after returning from map');
          } catch (error) {
            console.error('Error reloading trip details:', error);
          }
        };
        reloadTripDetails();
      }
    };

    // Also reload when window gains focus
    const handleFocus = () => {
      const reloadTripDetails = async () => {
        try {
          const response = await fetchTripDetails();
          const items = response.items || [];
          setTripDetails(items);
          console.log('Trip details refreshed on window focus');
        } catch (error) {
          console.error('Error reloading trip details:', error);
        }
      };
      reloadTripDetails();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleViewOnMap = (vehicleId) => {
    navigate(`/map/${vehicleId}`);
  };

  const handleCreateTrip = async () => {
    if (!selectedVehicle || !startPoint.lat || !startPoint.long || !endPoint.lat || !endPoint.long) {
      toast.error('Please select a vehicle and enter start/end coordinates');
      return;
    }

    try {
      // First, create route using route mapper API
      const routeData = {
        startPoint: { lat: parseFloat(startPoint.lat), long: parseFloat(startPoint.long) },
        endPoint: { lat: parseFloat(endPoint.lat), long: parseFloat(endPoint.long) },
        vehicleId: selectedVehicle.vehicleId
      };

      console.log('Creating route via mapper:', routeData);
      const routeResponse = await createRouteViaMapper(routeData);
      console.log('Route created via mapper:', routeResponse);

      // Save the route to backend
      const routePoints = [
        { lat: parseFloat(startPoint.lat), lng: parseFloat(startPoint.long) },
        { lat: parseFloat(endPoint.lat), lng: parseFloat(endPoint.long) }
      ];
      await saveRoute(routePoints, selectedVehicle.vehicleId);
      console.log('Route saved to backend for vehicle:', selectedVehicle.vehicleId);

      // Then create trip details
      const tripData = formatTripDataForBackend(
        [{ lat: parseFloat(startPoint.lat), long: parseFloat(startPoint.long) }],
        [{ lat: parseFloat(endPoint.lat), long: parseFloat(endPoint.long) }],
        selectedVehicle.vehicleId,
        selectedVehicle.vehicleNumber,
        selectedVehicle.vehicleStatus || { key: 'notStarted', name: 'Not Started' }
      );

      console.log('Creating trip with data:', tripData);

      const response = await createTripDetails(tripData);
      console.log('Trip created successfully:', response);

      // Reload trip details to show the new entry
      await reloadTripDetails();

      toast.success(`Trip and route created for vehicle ${selectedVehicle.vehicleId}`);

      // Clear form
      setSelectedVehicle(null);
      setStartPoint({ lat: '', long: '' });
      setEndPoint({ lat: '', long: '' });

    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Failed to create trip and route');
    }
  };

  // Function to reload trip details
  const reloadTripDetails = async () => {
    try {
      const response = await fetchTripDetails();
      const items = response.items || [];
      console.log(`Reloaded ${items.length} trip records`);
      setTripDetails(items);
    } catch (error) {
      console.error('Error reloading trip details:', error);
      toast.error('Failed to refresh trip details');
    }
  };

  const handleRefresh = () => {
    reloadTripDetails();
    toast.info('Refreshing trip details...');
  };

  const handleStartVehicle = (trip) => {
    toast.info(`Starting vehicle ${trip.vehicleId}`);
  };

  if (loading || vehiclesLoading) {
    return <div className="loading">Loading trip details...</div>;
  }

  // Get combined data for table display
  const tableData = getCombinedVehicleData();

  const columns = [
    { key: 'vehicleId', label: 'Vehicle ID' },
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'startingPoint', label: 'Starting Point' },
    { key: 'endingPoint', label: 'Ending Point' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <div className="vehicle-list-container">

      <Table
        columns={columns}
        data={tableData}
        renderRow={(vehicle) => (
          <>
            <td>{vehicle.vehicleId}</td>
            <td>{vehicle.vehicleNumber}</td>
            <td>
              {vehicle.staringPoint ? (
                <span className="coordinates">
                  {(() => {
                    // Handle both string format from backend and array format from API
                    if (typeof vehicle.staringPoint === 'string') {
                      if (vehicle.staringPoint.includes('lat=')) {
                        // Backend string format: "[{lat=28.829556, long=77.042093}]"
                        const parsed = parseRouteFromBackend(vehicle.staringPoint);
                        if (parsed.length > 0) {
                          return `${parsed[0].lat.toFixed(6)}, ${parsed[0].long.toFixed(6)}`;
                        }
                        return vehicle.staringPoint;
                      } else {
                        return vehicle.staringPoint;
                      }
                    } else if (Array.isArray(vehicle.staringPoint)) {
                      // API array format
                      if (vehicle.staringPoint.length > 0) {
                        const point = vehicle.staringPoint[0];
                        return `${point.lat?.toFixed(6) || point.lat}, ${point.long?.toFixed(6) || point.long}`;
                      }
                    }
                    return 'N/A';
                  })()}
                </span>
              ) : (
                <span style={{color: '#999', fontStyle: 'italic'}}>No route decide</span>
              )}
            </td>
            <td>
              {vehicle.endingPoint ? (
                <span className="coordinates">
                  {(() => {
                    // Handle both string format from backend and array format from API
                    if (typeof vehicle.endingPoint === 'string') {
                      if (vehicle.endingPoint.includes('lat=')) {
                        // Backend string format: "[{lat=28.829556, long=77.042093}]"
                        const parsed = parseRouteFromBackend(vehicle.endingPoint);
                        if (parsed.length > 0) {
                          return `${parsed[0].lat.toFixed(6)}, ${parsed[0].long.toFixed(6)}`;
                        }
                        return vehicle.endingPoint;
                      } else {
                        return vehicle.endingPoint;
                      }
                    } else if (Array.isArray(vehicle.endingPoint)) {
                      // API array format
                      if (vehicle.endingPoint.length > 0) {
                        const point = vehicle.endingPoint[0];
                        return `${point.lat?.toFixed(6) || point.lat}, ${point.long?.toFixed(6) || point.long}`;
                      }
                    }
                    return 'N/A';
                  })()}
                </span>
              ) : (
                <span style={{color: '#999', fontStyle: 'italic'}}>No route decide</span>
              )}
            </td>
            <td>
              <StatusBadge 
                status={vehicle.vehicleStatus?.name || vehicle.vehicleStatus?.key || 'Unknown'} 
              />
            </td>
            <td className="actions-cell">
              <Button 
                size="sm"
                variant="success"
                onClick={() => handleStartVehicle(vehicle)}
              >
                Start
              </Button>
              <Button 
                size="sm"
                variant="warning"
                onClick={() => handleViewOnMap(vehicle.vehicleId)}
              >
                View on Map
              </Button>
            </td>
          </>
        )}
      />
    </div>
  );
};

export default TripDetails;