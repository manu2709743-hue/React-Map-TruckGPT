import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTruckContext } from '../contexts/TruckContext';
import { toast } from 'react-toastify';
import axios from 'axios';

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
    // For individual start, we can implement later
    toast.info(`Starting truck ${truckId}`);
  };

  const handleLoadRoutes = async () => {
    try {
      const response = await fetch('/data/truckRoutes.json');
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

    const API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjExYWI5YjU0ODgwNzQ0YzY4OTI3YjUyYmFhOTRiNTBhIiwiaCI6Im11cm11cjY0In0=';
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${startPoint.lng},${startPoint.lat}&end=${endPoint.lng},${endPoint.lat}`;

    try {
      console.log('Calling ORS API for truck route:', url);
      const res = await axios.get(url);

      const coords = res.data.features[0].geometry.coordinates.map((c) => ({
        lat: c[1], // lat
        lng: c[0], // lng
      }));

      console.log(`Generated real ORS route with ${coords.length} waypoints for ${selectedTruck}`);

      // Update routes
      const newRoutes = { ...truckRoutes, [selectedTruck]: coords };
      setTruckRoutes(newRoutes);

      // Download JSON
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

  return (
    <div className="truck-list-container">
      <div className="list-controls">
        <button className="control-btn load-btn" onClick={handleLoadRoutes}>
          Load Routes
        </button>
        <button
          className="control-btn start-all-btn"
          onClick={isMoving ? handleStopAll : handleStartAll}
        >
          {isMoving ? 'Stop All' : 'Start All'}
        </button>
      </div>

      {/* Path Generation Section */}
      <div className="path-generator">
        <h4>Generate Route for Truck</h4>
        <div className="generator-controls">
          <select
            value={selectedTruck || ''}
            onChange={(e) => setSelectedTruck(e.target.value)}
            className="truck-select"
          >
            <option value="">Select Truck</option>
            {trucks.map(truck => (
              <option key={truck.id} value={truck.id}>{truck.name}</option>
            ))}
          </select>

          <div className="coord-inputs">
            <div className="input-group">
              <label>Start Lat:</label>
              <input
                type="number"
                step="0.0001"
                value={startPoint.lat}
                onChange={(e) => setStartPoint({...startPoint, lat: e.target.value})}
                placeholder="28.6139"
              />
            </div>
            <div className="input-group">
              <label>Start Lng:</label>
              <input
                type="number"
                step="0.0001"
                value={startPoint.lng}
                onChange={(e) => setStartPoint({...startPoint, lng: e.target.value})}
                placeholder="77.209"
              />
            </div>
            <div className="input-group">
              <label>End Lat:</label>
              <input
                type="number"
                step="0.0001"
                value={endPoint.lat}
                onChange={(e) => setEndPoint({...endPoint, lat: e.target.value})}
                placeholder="28.6139"
              />
            </div>
            <div className="input-group">
              <label>End Lng:</label>
              <input
                type="number"
                step="0.0001"
                value={endPoint.lng}
                onChange={(e) => setEndPoint({...endPoint, lng: e.target.value})}
                placeholder="77.209"
              />
            </div>
          </div>

          <button className="generate-btn" onClick={generateRoute}>
            Generate Route
          </button>
        </div>
      </div>

      <div className="truck-table-wrapper">
        <table className="truck-table">
          <thead>
            <tr>
              <th>Truck Name</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Status</th>
              <th>Live Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map((truck) => {
              const position = truckPositions[truck.id];
              const status = truckStatuses[truck.id] || 'Not Started';

              return (
                <tr key={truck.id}>
                  <td>{truck.name}</td>
                  <td>{truck.driver}</td>
                  <td>{truck.from} → {truck.to}</td>
                  <td>
                    <span className={`status ${status.toLowerCase().replace(' ', '-')}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    {position ? (
                      <span className="live-location">
                        {position[0].toFixed(4)}, {position[1].toFixed(4)}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="action-btn start-btn"
                      onClick={() => handleStartTruck(truck.id)}
                    >
                      Start
                    </button>
                    <button
                      className="action-btn view-map-btn"
                      onClick={() => handleViewOnMap(truck.id)}
                    >
                      View on Map
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TruckList;