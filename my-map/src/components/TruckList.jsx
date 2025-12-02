import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTruckContext } from '../contexts/TruckContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button, Table, StatusBadge } from './index';
import { API_CONFIG, DATA_FILES } from '../constants';
import '../styles/truck-list.css';

/**
 * TruckList Component
 * Displays a list of trucks with their details and navigation to map view
 */
const TruckList = () => {
  const {
    trucks,
    truckPositions,
    truckStatuses,
    truckRoutes,
    setTruckRoutes,
    isMoving,
    setIsMoving,
  } = useTruckContext();
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [startPoint, setStartPoint] = useState({ lat: '', lng: '' });
  const [endPoint, setEndPoint] = useState({ lat: '', lng: '' });
  const navigate = useNavigate();

  const loading = trucks.length === 0;

  const handleViewOnMap = (truckId) => {
    navigate(`/map/${truckId}`);
  };

  const handleStartTruck = (truckId) => {
    toast.info(`Starting truck ${truckId}`);
  };

  const handleLoadRoutes = async () => {
    try {
      const response = await fetch(DATA_FILES.TRUCK_ROUTES);
      const data = await response.json();
      setTruckRoutes(data);
      toast.success('Routes loaded successfully');
    } catch (error) {
      console.error('Error loading routes:', error);
      toast.error('Failed to load routes');
    }
  };

  const generateRoute = async () => {
    if (!selectedTruck || !startPoint.lat || !startPoint.lng || !endPoint.lat || !endPoint.lng) {
      toast.error('Please select a truck and enter start/end coordinates');
      return;
    }

    const url = `${API_CONFIG.OPENROUTE_API}?api_key=${API_CONFIG.ROUTE_SERVICE_API_KEY}&start=${startPoint.lng},${startPoint.lat}&end=${endPoint.lng},${endPoint.lat}`;

    try {
      console.log('Calling ORS API for truck route:', url);
      const res = await axios.get(url);

      const coords = res.data.features[0].geometry.coordinates.map((c) => ({
        lat: c[1],
        lng: c[0],
      }));

      console.log(`Generated real ORS route with ${coords.length} waypoints for ${selectedTruck}`);

      const newRoutes = { ...truckRoutes, [selectedTruck]: coords };
      setTruckRoutes(newRoutes);

      const jsonStr = JSON.stringify({ [selectedTruck]: coords }, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `route_${selectedTruck}.json`;
      a.click();
      URL.revokeObjectURL(urlBlob);

      toast.success(`Route generated for ${selectedTruck}`);
    } catch (error) {
      console.error('Error generating route:', error);
      toast.error('Failed to generate route');
    }
  };

  const handleStartAll = () => {
    setIsMoving(true);
    toast.success('Starting all trucks');
  };

  const handleStopAll = () => {
    setIsMoving(false);
    toast.info('Stopping all trucks');
  };

  if (loading) {
    return <div className="loading">Loading trucks...</div>;
  }

  const columns = [
    { key: 'name', label: 'Truck Name' },
    { key: 'driver', label: 'Driver' },
    { key: 'route', label: 'Route' },
    { key: 'status', label: 'Status' },
    { key: 'location', label: 'Live Location' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <div className="truck-list-container">
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
        data={trucks}
        renderRow={(truck) => (
          <>
            <td>{truck.name}</td>
            <td>{truck.driver}</td>
            <td>{truck.from} → {truck.to}</td>
            <td>
              <StatusBadge status={truckStatuses[truck.id] || 'Not Started'} />
            </td>
            <td>
              {truckPositions[truck.id] ? (
                <span className="live-location">
                  {truckPositions[truck.id][0].toFixed(4)}, {truckPositions[truck.id][1].toFixed(4)}
                </span>
              ) : (
                'N/A'
              )}
            </td>
            <td className="actions-cell">
              <Button 
                size="sm"
                variant="success"
                onClick={() => handleStartTruck(truck.id)}
              >
                Start
              </Button>
              <Button 
                size="sm"
                variant="warning"
                onClick={() => handleViewOnMap(truck.id)}
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

export default TruckList;