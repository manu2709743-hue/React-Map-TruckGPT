import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicleContext } from '../contexts/VehicleContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button, Table, StatusBadge } from './index';
import { API_CONFIG, DATA_FILES } from '../constants';
import '../styles/vehicle-list.css';

/**
 * VehicleList Component
 * Displays a list of vehicles with their details and navigation to map view
 */
const VehicleList = () => {
  const {
    vehicles,
    vehiclePositions,
    vehicleStatuses,
    vehicleRoutes,
    setVehicleRoutes,
    isMoving,
    setIsMoving,
  } = useVehicleContext();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [startPoint, setStartPoint] = useState({ lat: '', lng: '' });
  const [endPoint, setEndPoint] = useState({ lat: '', lng: '' });
  const navigate = useNavigate();

  const loading = vehicles.length === 0;

  const handleViewOnMap = (vehicleId) => {
    navigate(`/map/${vehicleId}`);
  };

  const handleStartVehicle = (vehicleId) => {
    toast.info(`Starting vehicle ${vehicleId}`);
  };

  const handleLoadRoutes = async () => {
    try {
      const response = await fetch(DATA_FILES.VEHICLE_ROUTES);
      const data = await response.json();
      setVehicleRoutes(data);
      toast.success('Routes loaded successfully');
    } catch (error) {
      console.error('Error loading routes:', error);
      toast.error('Failed to load routes');
    }
  };

  const generateRoute = async () => {
    if (!selectedVehicle || !startPoint.lat || !startPoint.lng || !endPoint.lat || !endPoint.lng) {
      toast.error('Please select a vehicle and enter start/end coordinates');
      return;
    }

    const url = `${API_CONFIG.OPENROUTE_API}?api_key=${API_CONFIG.ROUTE_SERVICE_API_KEY}&start=${startPoint.lng},${startPoint.lat}&end=${endPoint.lng},${endPoint.lat}`;

    try {
      console.log('Calling ORS API for vehicle route:', url);
      const res = await axios.get(url);

      const coords = res.data.features[0].geometry.coordinates.map((c) => ({
        lat: c[1],
        lng: c[0],
      }));

      console.log(`Generated real ORS route with ${coords.length} waypoints for ${selectedVehicle}`);

      const newRoutes = { ...vehicleRoutes, [selectedVehicle]: coords };
      setVehicleRoutes(newRoutes);

      const jsonStr = JSON.stringify({ [selectedVehicle]: coords }, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `route_${selectedVehicle}.json`;
      a.click();
      URL.revokeObjectURL(urlBlob);

      toast.success(`Route generated for ${selectedVehicle}`);
    } catch (error) {
      console.error('Error generating route:', error);
      toast.error('Failed to generate route');
    }
  };

  const handleStartAll = () => {
    setIsMoving(true);
    toast.success('Starting all vehicles');
  };

  const handleStopAll = () => {
    setIsMoving(false);
    toast.info('Stopping all vehicles');
  };

  if (loading) {
    return <div className="loading">Loading vehicles...</div>;
  }

  const columns = [
    { key: 'name', label: 'Vehicle Name' },
    { key: 'driver', label: 'Driver' },
    { key: 'route', label: 'Route' },
    { key: 'status', label: 'Status' },
    { key: 'location', label: 'Live Location' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <div className="vehicle-list-container">
      <div className="list-controls">
        <Button variant="secondary" onClick={handleLoadRoutes}>
          Load Routes
        </Button>
        <Button 
          variant="success" 
          onClick={isMoving ? handleStopAll : handleStartAll}
        >
          {isMoving ? 'Stop All' : 'Start All'}
        </Button>
      </div>

      <Table
        columns={columns}
        data={vehicles}
        renderRow={(vehicle) => (
          <>
            <td>{vehicle.name}</td>
            <td>{vehicle.driver}</td>
            <td>{vehicle.from} → {vehicle.to}</td>
            <td>
              <StatusBadge status={vehicleStatuses[vehicle.id] || 'Not Started'} />
            </td>
            <td>
              {vehiclePositions[vehicle.id] ? (
                <span className="live-location">
                  {vehiclePositions[vehicle.id][0].toFixed(4)}, {vehiclePositions[vehicle.id][1].toFixed(4)}
                </span>
              ) : (
                'N/A'
              )}
            </td>
            <td className="actions-cell">
              <Button 
                size="sm"
                variant="success"
                onClick={() => handleStartVehicle(vehicle.id)}
              >
                Start
              </Button>
              <Button 
                size="sm"
                variant="warning"
                onClick={() => handleViewOnMap(vehicle.id)}
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

export default VehicleList;
