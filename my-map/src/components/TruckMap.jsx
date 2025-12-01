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
import { useTruckContext } from '../contexts/TruckContext';

// Truck icon
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202921.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Highlighted truck icon (larger)
const highlightedTruckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202921.png',
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

// Toll plaza icon
const tollIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1234/1234567.png', // Replace with actual toll icon URL if needed
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Component to center map on specific truck
function MapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
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

const TruckMap = () => {
  const { truckId } = useParams();
  const {
    trucks,
    truckRoutes,
    setTruckRoutes,
    truckPositions,
    setTruckPositions,
    truckStatuses,
    setCurrentIndices,
    isMoving,
    startMovement,
    stopMovement,
    tolls,
  } = useTruckContext();

  // Route selection state
  const [isSelectingRoute, setIsSelectingRoute] = useState(false);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [generatedRoute, setGeneratedRoute] = useState(null);

  // Derive loading state from data availability
  const loading = Object.keys(truckRoutes).length === 0;


  // Map click handler for route selection
  const handleMapClick = (e) => {
    if (!isSelectingRoute || !truckId) return;

    const point = [e.latlng.lat, e.latlng.lng];

    if (!selectedStart) {
      setSelectedStart(point);
      toast.info('Start point selected. Now click for end point.');
    } else if (!selectedEnd) {
      setSelectedEnd(point);
      toast.info('End point selected. Click Confirm Route to generate path.');
    }
  };

  // Generate route from selected points
  const confirmRoute = async () => {
    if (!selectedStart || !selectedEnd || !truckId) {
      toast.error('Please select both start and end points');
      return;
    }

    const API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijk5MWY1N2VmMTIyYzRjZmViNjg5OWI1ZmRkZTI3YTFiIiwiaCI6Im11cm11cjY0In0=';
    const url = `/api/openrouteservice/v2/directions/driving-car?start=${selectedStart[1]},${selectedStart[0]}&end=${selectedEnd[1]},${selectedEnd[0]}`;

    try {
      console.log('Calling ORS API:', url);
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      const coords = res.data.features[0].geometry.coordinates.map((c) => ({
        lat: c[1], // lat
        lng: c[0], // lng
      }));

      console.log(`Generated real ORS route with ${coords.length} waypoints`);

      // Update routes
      const newRoutes = { ...truckRoutes, [truckId]: coords };
      setTruckRoutes(newRoutes);
      setGeneratedRoute(coords);

      // Set truck position to start of new route
      setTruckPositions(prev => ({ ...prev, [truckId]: [coords[0].lat, coords[0].lng] }));

      // Reset index for this truck
      setCurrentIndices(prev => ({ ...prev, [truckId]: 0 }));

      // Download JSON
      const jsonStr = JSON.stringify({ [truckId]: coords }, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `route_${truckId}.json`;
      a.click();
      URL.revokeObjectURL(urlBlob);

      // Reset selection
      setSelectedStart(null);
      setSelectedEnd(null);
      setIsSelectingRoute(false);

      toast.success(`Route generated and downloaded for ${truckId}`);
    } catch (error) {
      console.error('Error generating route:', error);
      if (error.response) {
        console.error('API Response:', error.response.data);
      }
      toast.error('Failed to generate route');
    }
  };

  // Start route selection
  const startRouteSelection = () => {
    setIsSelectingRoute(true);
    setSelectedStart(null);
    setSelectedEnd(null);
    setGeneratedRoute(null);
    toast.info('Click on map to select start point');
  };

  // Cancel route selection
  const cancelRouteSelection = () => {
    setIsSelectingRoute(false);
    setSelectedStart(null);
    setSelectedEnd(null);
    setGeneratedRoute(null);
  };


  if (loading) {
    return <div className="loading">Loading map data...</div>;
  }

  // Determine map center
  let mapCenter = [20.5937, 78.9629]; // India center
  if (truckId && truckPositions[truckId]) {
    mapCenter = truckPositions[truckId];
  }

  return (
    <div className="truck-map-container">
      <div className="map-controls">
        {truckId && (
          <>
            {!isSelectingRoute ? (
              <button className="control-btn select-route-btn" onClick={startRouteSelection}>
                Select Route for {truckId}
              </button>
            ) : (
              <>
                <button className="control-btn confirm-btn" onClick={confirmRoute} disabled={!selectedStart || !selectedEnd}>
                  Confirm Route
                </button>
                <button className="control-btn cancel-btn" onClick={cancelRouteSelection}>
                  Cancel
                </button>
              </>
            )}
          </>
        )}
        <button className="control-btn movement-btn" onClick={isMoving ? stopMovement : startMovement}>
          {isMoving ? 'Stop Movement' : 'Start Movement'}
        </button>
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
        zoom={6}
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapCenter center={truckId ? truckPositions[truckId] : null} />
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Route polylines - hide existing route when selecting new one */}
        {Object.entries(truckRoutes).map(([id, route]) => {
          if (isSelectingRoute && id === truckId) return null; // Hide current route when selecting
          return (
            <Polyline
              key={id}
              positions={route.map(p => [p.lat, p.lng])}
              color={id === truckId ? 'red' : 'blue'}
              weight={id === truckId ? 4 : 2}
            />
          );
        })}

        {/* Generated route preview */}
        {generatedRoute && (
          <Polyline
            positions={generatedRoute.map(p => [p.lat, p.lng])}
            color="green"
            weight={4}
            dashArray="10, 10"
          />
        )}

        {/* Selection markers */}
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

        {/* Truck markers */}
        {trucks.map(truck => {
          const position = truckPositions[truck.id];
          const status = truckStatuses[truck.id] || 'Not Started';
          if (!position) return null;

          return (
            <Marker
              key={truck.id}
              position={position}
              icon={truck.id === truckId ? highlightedTruckIcon : truckIcon}
            >
              <Popup>
                <div>
                  <h4>{truck.name}</h4>
                  <p><strong>Driver:</strong> {truck.driver}</p>
                  <p><strong>Route:</strong> {truck.from} → {truck.to}</p>
                  <p><strong>Status:</strong> {status}</p>
                  <p><strong>Position:</strong> {position[0].toFixed(4)}, {position[1].toFixed(4)}</p>
                </div>
              </Popup>
              <Tooltip permanent={false}>
                {truck.name} - {truck.driver} ({status})
              </Tooltip>
            </Marker>
          );
        })}

        {/* Toll plaza markers */}
        {Object.values(tolls).flat().map(toll => (
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
        ))}
      </MapContainer>
    </div>
  );
};

export default TruckMap;