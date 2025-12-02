import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from './index';
import { useVehicleContext } from '../contexts/VehicleContext';
import { API_CONFIG, MAP_CONFIG, DISTANCE_CONFIG } from '../constants';
import '../styles/vehicle-map.css';
import deliveryTruck from '../assets/delivery-truck.png';

// Vehicle icon
const vehicleIcon = new L.Icon({
  iconUrl: deliveryTruck,
  iconSize: MAP_CONFIG.VEHICLE_MARKER_SIZE,
  iconAnchor: [20, 20],
});

// Highlighted vehicle icon (larger)
const highlightedVehicleIcon = new L.Icon({
  iconUrl: deliveryTruck,
  iconSize: MAP_CONFIG.HIGHLIGHTED_VEHICLE_MARKER_SIZE,
  iconAnchor: [25, 25],
});

// Toll plaza icon
const tollIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1234/1234567.png',
  iconSize: MAP_CONFIG.TOLL_MARKER_SIZE,
  iconAnchor: [15, 15],
});

// Component to center map on specific vehicle
function MapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, MAP_CONFIG.DEFAULT_ZOOM);
    }
  }, [center, map]);
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e);
    },
  });
  return null;
}

const VehicleMap = () => {
  const { vehicleId } = useParams();
  const {
    vehicles,
    vehicleRoutes,
    setVehicleRoutes,
    vehiclePositions,
    setVehiclePositions,
    vehicleStatuses,
    setCurrentIndices,
    isMoving,
    startMovement,
    stopMovement,
    tolls,
  } = useVehicleContext();

  const [isSelectingRoute, setIsSelectingRoute] = useState(false);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [generatedRoute, setGeneratedRoute] = useState(null);

  const loading = Object.keys(vehicleRoutes).length === 0;

  const handleMapClick = (e) => {
    if (!isSelectingRoute || !vehicleId) return;

    const point = [e.latlng.lat, e.latlng.lng];

    if (!selectedStart) {
      setSelectedStart(point);
      toast.info('Start point selected. Now click for end point.');
    } else if (!selectedEnd) {
      setSelectedEnd(point);
      toast.info('End point selected. Click Confirm Route to generate path.');
    }
  };

  const confirmRoute = async () => {
    if (!selectedStart || !selectedEnd || !vehicleId) {
      toast.error('Please select both start and end points');
      return;
    }

    // Use the direct OpenRouteService API URL (same as original working code)
    const API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjExYWI5YjU0ODgwNzQ4YzY4OTI3YjUyYmFhOTRiNTBhIiwiaCI6Im11cm11cjY0In0=';
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${selectedStart[1]},${selectedStart[0]}&end=${selectedEnd[1]},${selectedEnd[0]}`;

    try {
      console.log('Calling ORS API:', url);
      const res = await axios.get(url);

      const coords = res.data.features[0].geometry.coordinates.map((c) => ({
        lat: c[1],
        lng: c[0],
      }));

      console.log(`Generated real ORS route with ${coords.length} waypoints`);

      const newRoutes = { ...vehicleRoutes, [vehicleId]: coords };
      setVehicleRoutes(newRoutes);
      setGeneratedRoute(coords);

      setVehiclePositions(prev => ({ ...prev, [vehicleId]: [coords[0].lat, coords[0].lng] }));
      setCurrentIndices(prev => ({ ...prev, [vehicleId]: 0 }));

      const jsonStr = JSON.stringify({ [vehicleId]: coords }, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `route_${vehicleId}.json`;
      a.click();
      URL.revokeObjectURL(urlBlob);

      setSelectedStart(null);
      setSelectedEnd(null);
      setIsSelectingRoute(false);

      toast.success(`Route generated and downloaded for ${vehicleId}`);
    } catch (error) {
      console.error('Error generating route with real API:', error);
      console.log('Falling back to demo route generation...');
      
      // Generate demo route between two points
      const generateDemoRoute = (start, end) => {
        const route = [];
        const steps = 50; // Number of waypoints
        
        for (let i = 0; i <= steps; i++) {
          const progress = i / steps;
          const lat = start[0] + (end[0] - start[0]) * progress;
          const lng = start[1] + (end[1] - start[1]) * progress;
          route.push({ lat, lng });
        }
        return route;
      };

      try {
        const demoCoords = generateDemoRoute(selectedStart, selectedEnd);
        
        const newRoutes = { ...vehicleRoutes, [vehicleId]: demoCoords };
        setVehicleRoutes(newRoutes);
        setGeneratedRoute(demoCoords);

        setVehiclePositions(prev => ({ ...prev, [vehicleId]: [demoCoords[0].lat, demoCoords[0].lng] }));
        setCurrentIndices(prev => ({ ...prev, [vehicleId]: 0 }));

        const jsonStr = JSON.stringify({ [vehicleId]: demoCoords }, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const urlBlob = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = `route_${vehicleId}.json`;
        a.click();
        URL.revokeObjectURL(urlBlob);

        setSelectedStart(null);
        setSelectedEnd(null);
        setIsSelectingRoute(false);

        toast.success(`Demo route generated and downloaded for ${vehicleId}`);
        toast.info('Note: Using demo route. For real routing, the API key may be invalid.');
      } catch (demoError) {
        console.error('Error generating demo route:', demoError);
        toast.error('Failed to generate route. Please try again.');
      }
    }
  };

  const startRouteSelection = () => {
    setIsSelectingRoute(true);
    setSelectedStart(null);
    setSelectedEnd(null);
    setGeneratedRoute(null);
    toast.info('Click on map to select start point');
  };

  const cancelRouteSelection = () => {
    setIsSelectingRoute(false);
    setSelectedStart(null);
    setSelectedEnd(null);
    setGeneratedRoute(null);
  };

  if (loading) {
    return <div className="loading">Loading map data...</div>;
  }

  let mapCenter = MAP_CONFIG.DEFAULT_CENTER;
  if (vehicleId && vehiclePositions[vehicleId]) {
    mapCenter = vehiclePositions[vehicleId];
  }

  return (
    <div className="vehicle-map-container">
      <div className="map-controls">
        {vehicleId && (
          <>
            {!isSelectingRoute ? (
              <Button 
                variant="warning"
                className="select-route-btn"
                onClick={startRouteSelection}
              >
                Select Route for {vehicleId}
              </Button>
            ) : (
              <>
                <Button 
                  variant="success"
                  className="confirm-btn"
                  onClick={confirmRoute} 
                  disabled={!selectedStart || !selectedEnd}
                >
                  Confirm Route
                </Button>
                <Button 
                  variant="danger"
                  className="cancel-btn"
                  onClick={cancelRouteSelection}
                >
                  Cancel
                </Button>
              </>
            )}
          </>
        )}
        <Button 
          variant="primary"
          className="movement-btn"
          onClick={isMoving ? stopMovement : startMovement}
        >
          {isMoving ? 'Stop Movement' : 'Start Movement'}
        </Button>
      </div>

      {isSelectingRoute && (
        <div className="route-selection-info">
          <p>
            {!selectedStart ? 'Click on map to select START point' :
             !selectedEnd ? 'Click on map to select END point' :
             'Click Confirm Route to generate path'}
          </p>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={MAP_CONFIG.DEFAULT_ZOOM}
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapCenter center={vehicleId ? vehiclePositions[vehicleId] : null} />
        <MapClickHandler onMapClick={handleMapClick} />

        {vehicleId ? (
          // Show only selected vehicle's route when vehicleId is provided
          vehicleRoutes[vehicleId] && !isSelectingRoute && (
            <Polyline
              key={vehicleId}
              positions={vehicleRoutes[vehicleId].map(p => [p.lat, p.lng])}
              color="red"
              weight={4}
            />
          )
        ) : (
          // Show all routes when no specific vehicle is selected
          Object.entries(vehicleRoutes).map(([id, route]) => {
            if (isSelectingRoute && id === vehicleId) return null;
            return (
              <Polyline
                key={id}
                positions={route.map(p => [p.lat, p.lng])}
                color="blue"
                weight={2}
              />
            );
          })
        )}

        {generatedRoute && (
          <Polyline
            positions={generatedRoute.map(p => [p.lat, p.lng])}
            color="green"
            weight={4}
            dashArray="10, 10"
          />
        )}

        {selectedStart && (
          <Marker position={selectedStart}>
            <Popup>Start Point</Popup>
            <Tooltip>Start Point</Tooltip>
          </Marker>
        )}
        {selectedEnd && (
          <Marker position={selectedEnd}>
            <Popup>End Point</Popup>
            <Tooltip>End Point</Tooltip>
          </Marker>
        )}

        {vehicles.map(vehicle => {
          // Only show selected vehicle when vehicleId is provided
          if (vehicleId && vehicle.id !== vehicleId) return null;
          
          const position = vehiclePositions[vehicle.id];
          const status = vehicleStatuses[vehicle.id] || 'Not Started';
          if (!position) return null;

          return (
            <Marker
              key={vehicle.id}
              position={position}
              icon={vehicle.id === vehicleId ? highlightedVehicleIcon : vehicleIcon}
            >
              <Popup>
                <div>
                  <h4>{vehicle.name}</h4>
                  <p><strong>Driver:</strong> {vehicle.driver}</p>
                  <p><strong>Route:</strong> {vehicle.from} → {vehicle.to}</p>
                  <p><strong>Status:</strong> {status}</p>
                  <p><strong>Position:</strong> {position[0].toFixed(4)}, {position[1].toFixed(4)}</p>
                </div>
              </Popup>
              <Tooltip permanent={false}>
                {vehicle.name} - {vehicle.driver} ({status})
              </Tooltip>
            </Marker>
          );
        })}

        {vehicleId ? (
          // Show tolls only for selected vehicle
          (tolls[vehicleId] || []).map(toll => (
            <Marker key={toll.id} position={[toll.latitude, toll.longitude]} icon={tollIcon}>
              <Popup>
                <div>
                  <h4>{toll.name}</h4>
                  <p><strong>Radius:</strong> {toll.radius} meters</p>
                  <p><strong>Coordinates:</strong> {toll.latitude.toFixed(4)}, {toll.longitude.toFixed(4)}</p>
                </div>
              </Popup>
              <Tooltip>{toll.name} (Toll Plaza)</Tooltip>
            </Marker>
          ))
        ) : (
          // Show all tolls when no specific vehicle is selected
          Object.values(tolls).flat().map(toll => (
            <Marker key={toll.id} position={[toll.latitude, toll.longitude]} icon={tollIcon}>
              <Popup>
                <div>
                  <h4>{toll.name}</h4>
                  <p><strong>Radius:</strong> {toll.radius} meters</p>
                  <p><strong>Coordinates:</strong> {toll.latitude.toFixed(4)}, {toll.longitude.toFixed(4)}</p>
                </div>
              </Popup>
              <Tooltip>{toll.name} (Toll Plaza)</Tooltip>
            </Marker>
          ))
        )}
      </MapContainer>
    </div>
  );
};

export default VehicleMap;
