import React, { useState, useEffect, useRef } from 'react';
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
import { distanceInMeters } from '../utils/distance';
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
    isMoving,
    setIsMoving,
  } = useTruckContext();
  const [currentIndices, setCurrentIndices] = useState({});
  const [tolls, setTolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  const crossedTollsRef = useRef(new Set());

  // Route selection state
  const [isSelectingRoute, setIsSelectingRoute] = useState(false);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [generatedRoute, setGeneratedRoute] = useState(null);

  // Load tolls
  useEffect(() => {
    const loadTolls = async () => {
      try {
        const response = await fetch('/tolls.json');
        const tollsData = await response.json();
        setTolls(tollsData);
      } catch (error) {
        console.error('Error loading tolls:', error);
      }
    };

    loadTolls();
  }, []);

  // Initialize indices when routes loaded
  useEffect(() => {
    if (Object.keys(truckRoutes).length > 0) {
      const initialIndices = {};
      trucks.forEach(truck => {
        if (truckRoutes[truck.id]) {
          initialIndices[truck.id] = 0;
        }
      });
      setCurrentIndices(initialIndices);
      setLoading(false);
    }
  }, [truckRoutes, trucks]);

  // Start movement
  const startMovement = () => {
    if (isMoving) return;
    setIsMoving(true);
    crossedTollsRef.current.clear();

    intervalRef.current = setInterval(() => {
      setCurrentIndices(prev => {
        const newIndices = { ...prev };
        const newPositions = { ...truckPositions };

        trucks.forEach(truck => {
          const route = truckRoutes[truck.id];
          if (!route) return;

          let currentIndex = newIndices[truck.id] || 0;
          if (currentIndex >= route.length - 1) {
            // Loop back to start
            currentIndex = 0;
          } else {
            currentIndex++;
          }

          const point = route[currentIndex];
          const position = [point.lat, point.lng];
          newPositions[truck.id] = position;
          newIndices[truck.id] = currentIndex;

          // Check toll crossings
          tolls.forEach(toll => {
            const tollKey = `${truck.id}-${toll.id}`;
            if (!crossedTollsRef.current.has(tollKey)) {
              const distance = distanceInMeters(position, [toll.latitude, toll.longitude]);
              if (distance <= 30) {
                crossedTollsRef.current.add(tollKey);
                toast.success(`${truck.name} crossed ${toll.name}`);
              }
            }
          });

          // Check off-route
          const isOnRoute = route.some(routePoint => {
            return distanceInMeters(position, [routePoint.lat, routePoint.lng]) <= 30;
          });
          if (!isOnRoute) {
            toast.error(`${truck.name} is not in correct way!`);
          } else {
            toast.info(`${truck.name} is in correct way!`);
          }
        });

        setTruckPositions(newPositions);
        return newIndices;
      });
    }, 900);
  };

  // Stop movement
  const stopMovement = () => {
    setIsMoving(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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

    const API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjExYWI5YjU0ODgwNzQ0YzY4OTI3YjUyYmFhOTRiNTBhIiwiaCI6Im11cm11cjY0In0=';
    const url = `/api/openrouteservice/v2/directions/driving-car?api_key=${API_KEY}&start=${selectedStart[1]},${selectedStart[0]}&end=${selectedEnd[1]},${selectedEnd[0]}`;

    try {
      // Mock route generation for development (straight line between start and end)
      const startLng = parseFloat(selectedStart[1]);
      const startLat = parseFloat(selectedStart[0]);
      const endLng = parseFloat(selectedEnd[1]);
      const endLat = parseFloat(selectedEnd[0]);

      // Generate intermediate points for a simple route
      const numPoints = 10;
      const coords = [];
      for (let i = 0; i <= numPoints; i++) {
        const ratio = i / numPoints;
        const lat = startLat + (endLat - startLat) * ratio;
        const lng = startLng + (endLng - startLng) * ratio;
        coords.push({ lat, lng });
      }

      // Update routes
      const newRoutes = { ...truckRoutes, [truckId]: coords };
      setTruckRoutes(newRoutes);
      setGeneratedRoute(coords);

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

  // Auto start movement when data loaded and isMoving is true
  useEffect(() => {
    if (!loading && trucks.length > 0 && isMoving && !intervalRef.current) {
      startMovement();
    } else if (!isMoving && intervalRef.current) {
      stopMovement();
    }
  }, [loading, trucks, isMoving]);

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
      </MapContainer>
    </div>
  );
};

export default TruckMap;