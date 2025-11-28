import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import { checkTollCrossing, fetchTolls } from "../utils/tollHelpers";

// ===============================
//  CAR ICON (cartoon style)
// ===============================
const carIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/743/743922.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// ===============================
//  Distance Function (Haversine)
// ===============================
function distanceInMeters(p1, p2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const lat1 = toRad(p1[0]);
  const lon1 = toRad(p1[1]);
  const lat2 = toRad(p2[0]);
  const lon2 = toRad(p2[1]);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ===============================
//  Car near route ? (30m check)
// ===============================
function isCarNearRoute(routePoints, carPoint, thresholdMeters = 30) {
  if (!routePoints || routePoints.length === 0 || !carPoint) return false;

  return routePoints.some((r) =>
    distanceInMeters([r[0], r[1]], [carPoint[0], carPoint[1]]) <=
    thresholdMeters
  );
}

// ===============================
//  Map Click Handler (start / end)
// ===============================
function SelectPoints({ startPoint, endPoint, setStartPoint, setEndPoint }) {
  useMapEvents({
    click(e) {
      const point = [e.latlng.lat, e.latlng.lng];

      if (!startPoint) {
        setStartPoint(point);
      } else if (!endPoint) {
        setEndPoint(point);
      }
    },
  });

  return null;
}


//Download json 
function downloadJSON(data, filename = "carRoute.json") {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}


// ===============================
//  MAIN COMPONENT
// ===============================
export default function MapRoute() {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [route, setRoute] = useState([]);

  // CAR STATES
  const [carRoute, setCarRoute] = useState([]);
  const [carPosition, setCarPosition] = useState(null);
  const [isCarRunning, setIsCarRunning] = useState(false);
  const [isCorrectPath, setIsCorrectPath] = useState(null);

  // TOLL STATES
  const [tolls, setTolls] = useState([]);
  const [tollMessages, setTollMessages] = useState([]);
  const crossedTollsRef = useRef(new Set());

  // ===============================
  //  Load Tolls Data
  // ===============================
  useEffect(() => {
    const loadTolls = async () => {
      console.log('🚀 useEffect: Starting to load tolls...');
      const tollsData = await fetchTolls();
      console.log('📦 useEffect: Setting tolls state:', tollsData);
      setTolls(tollsData);
      console.log('✅ useEffect: Tolls loaded and state updated');
    };

    loadTolls();
  }, []);

  // ===============================
  //  Show Toll Message (auto remove)
  // ===============================
  const showTollMessage = (toll) => {
    const message = `🚗 Toll Plaza Crossed: ${toll.name}`;
    setTollMessages((prev) => [...prev, message]);
    console.log(`✅ Toll message shown: ${toll.name}`);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setTollMessages((prev) => prev.filter((m) => m !== message));
    }, 3000);
  };
 const drawRoute = async () => {
  if (!startPoint || !endPoint) return;

  const API_KEY =
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjExYWI5YjU0ODgwNzQ4YzY4OTI3YjUyYmFhOTRiNTBhIiwiaCI6Im11cm11cjY0In0=";

  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${startPoint[1]},${startPoint[0]}&end=${endPoint[1]},${endPoint[0]}`;

  try {
    const res = await axios.get(url);

    const coords = res.data.features[0].geometry.coordinates.map((c) => [
      c[1], // lat
      c[0], // lng
    ]);

    setRoute(coords);

    // ⭐ Convert to JSON format {lat, lng}
    const converted = coords.map((p) => ({ lat: p[0], lng: p[1] }));

    // ⭐ Auto save JSON file
    downloadJSON(converted);

    setIsCorrectPath(null);
  } catch (err) {
    console.error("ORS error: ", err);
  }
};


  // ===============================
  //  Load Car JSON (dummy data abhi)
  //  -> yahi array ko tum apne JSON se replace kar sakte ho
  // ===============================
 const loadCarJSON = async () => {
  try {
    const res = await fetch("/carRoute.json");
    const data = await res.json();

    setCarRoute(data);
    setCarPosition([data[0].lat, data[0].lng]);
    setIsCorrectPath(null);

    console.log("Car Route Loaded:", data);
  } catch (err) {
    console.error("Error loading car route JSON", err);
    alert("Car JSON load nahi hua. Console check karo.");
  }
};

  // ===============================
  //  Start Car Movement (real time)
  // ===============================
  const startCarMovement = () => {
    if (!carRoute.length) {
      alert("Pehle car JSON load karo.");
      return;
    }
    if (!route.length) {
      alert("Pehle Start & End select karke Show Route karo.");
      return;
    }

    console.log("🚗 Car movement started");
    console.log("📍 Total tolls loaded:", tolls.length);
    console.log("📍 Tolls data:", tolls);

    setIsCarRunning(true);
    crossedTollsRef.current.clear(); // Reset crossed tolls
    let idx = 0;

    const interval = setInterval(() => {
      if (idx >= carRoute.length) {
        clearInterval(interval);
        setIsCarRunning(false);
        console.log("🏁 Car movement ended");
        return;
      }

      const point = carRoute[idx];
      const currentCarPos = [point.lat, point.lng];

      // car marker update
      setCarPosition(currentCarPos);

      // REAL-TIME PATH CHECK
      const isOnPath = isCarNearRoute(route, currentCarPos, 30);
      setIsCorrectPath(isOnPath);

      // TOLL CHECK
      if (tolls.length > 0) {
        const crossedTolls = checkTollCrossing(
          tolls,
          currentCarPos[0],
          currentCarPos[1],
          crossedTollsRef.current
        );

        // Debug logging
        if (idx % 10 === 0) {
          console.log(`Step ${idx}: Car at (${currentCarPos[0]}, ${currentCarPos[1]})`);
        }

        // Show message for each newly crossed toll
        if (crossedTolls.length > 0) {
          crossedTolls.forEach((toll) => {
            showTollMessage(toll);
            console.log(`✅ Crossed toll: ${toll.name} at step ${idx}`);
          });
        }
      } else {
        console.warn("⚠️ No tolls loaded!");
      }

      idx++;
    }, 900); // speed (ms)
  };

  // ===============================
  //  Reset sab kuch
  // ===============================
  const reset = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoute([]);
    setCarRoute([]);
    setCarPosition(null);
    setIsCarRunning(false);
    setIsCorrectPath(null);
    setTollMessages([]);
    crossedTollsRef.current.clear();
  };

  return (
    <div style={{ padding: 15 }}>
      {/* TOLL STATUS INDICATOR */}
      <div style={{ marginBottom: 10, padding: "10px", background: tolls.length > 0 ? "#e8f5e9" : "#ffebee", borderRadius: 5 }}>
        <strong>{tolls.length > 0 ? "✅" : "❌"} Tolls Status:</strong> {tolls.length} tolls loaded
        {tolls.length > 0 && (
          <div style={{ fontSize: "12px", marginTop: "5px" }}>
            {tolls.map(t => `${t.name} (${t.latitude}, ${t.longitude})`).join(" | ")}
          </div>
        )}
      </div>

      {/* BUTTONS TOP AREA */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <button
          onClick={drawRoute}
          disabled={!startPoint || !endPoint}
          style={{
            padding: "10px 20px",
            background: "green",
            color: "white",
            border: "none",
            borderRadius: 5,
          }}
        >
          Show Route
        </button>

        <button
          onClick={loadCarJSON}
          style={{
            padding: "10px 20px",
            background: "orange",
            color: "white",
            border: "none",
            borderRadius: 5,
          }}
        >
          Load Car JSON
        </button>

        <button
          onClick={startCarMovement}
          disabled={isCarRunning || !carRoute.length || !route.length}
          style={{
            padding: "10px 20px",
            background: "purple",
            color: "white",
            border: "none",
            borderRadius: 5,
          }}
        >
          Start Car
        </button>

        <button
          onClick={reset}
          style={{
            padding: "10px 20px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: 5,
          }}
        >
          Reset
        </button>
      </div>

      {/* REAL-TIME PATH STATUS */}
      {isCorrectPath === true && (
        <div style={{ color: "green", marginBottom: 10 }}>
          ✔ Car is on correct path
        </div>
      )}
      {isCorrectPath === false && (
        <div style={{ color: "red", marginBottom: 10 }}>
          ✖ Car is outside the correct route
        </div>
      )}

      {/* TOLL MESSAGES */}
      <div style={{ marginBottom: 10 }}>
        {tollMessages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              background: "#FFA500",
              color: "white",
              padding: "10px 15px",
              borderRadius: 5,
              marginBottom: 5,
              fontWeight: "bold",
              animation: "slideIn 0.3s ease-in-out",
            }}
          >
            {msg}
          </div>
        ))}
      </div>

      {/* MAP */}
      <MapContainer
        center={[28.6139, 77.209]}
        zoom={13}
        style={{
          height: "600px",
          width: "100%",
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <SelectPoints
          startPoint={startPoint}
          endPoint={endPoint}
          setStartPoint={setStartPoint}
          setEndPoint={setEndPoint}
        />

        {startPoint && <Marker position={startPoint} />}
        {endPoint && <Marker position={endPoint} />}

        {/* ORS route polyline */}
        {route.length > 0 && (
          <Polyline positions={route} color="blue" weight={4} />
        )}

        {/* Car marker */}
        {carPosition && <Marker position={carPosition} icon={carIcon} />}
      </MapContainer>
    </div>
  );
}
