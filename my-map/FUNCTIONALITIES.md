# Project Functionalities: Route Finder

## Overview

Route Finder is a React-based web application that provides an interactive map interface for route planning, visualization, and vehicle tracking simulation. The app integrates with OpenRouteService API for route calculation and uses Leaflet for map rendering. It includes real-time car movement simulation, route adherence checking, and toll crossing detection.

## Core Features

### 1. Interactive Map Display
- **Description**: Displays an interactive map using OpenStreetMap tiles via Leaflet
- **Functionality**: Users can zoom, pan, and interact with the map
- **Technical Details**: Uses `react-leaflet` library with customizable tile layers

### 2. Point Selection
- **Description**: Click on the map to select start and end points for routing
- **Functionality**:
  - First click sets the start point (marked with a marker)
  - Second click sets the end point (marked with a marker)
- **Technical Details**: Uses `useMapEvents` hook from `react-leaflet`

### 3. Route Calculation and Display
- **Description**: Fetches driving route from OpenRouteService API
- **Functionality**:
  - Calculates optimal driving route between selected points
  - Displays route as a blue polyline on the map
  - Automatically downloads route data as JSON file
- **Technical Details**: Uses OpenRouteService Directions API with driving-car profile

### 4. Car Movement Simulation
- **Description**: Simulates vehicle movement along a predefined route
- **Functionality**:
  - Loads car position data from `carRoute.json`
  - Animates car marker movement along the route points
  - Configurable movement speed (default: 100ms intervals)
- **Technical Details**: Uses `setInterval` for animation, car icon from constants

### 5. Real-Time Route Validation
- **Description**: Monitors if the simulated car stays on the correct route
- **Functionality**:
  - Checks car position against route coordinates in real-time
  - Displays status indicator: "Car is on correct path" or "Car is outside the correct route"
  - Uses 30-meter proximity threshold for validation
- **Technical Details**: Calculates Haversine distance between car position and nearest route point

### 6. Toll Crossing Detection
- **Description**: Detects when the car passes through toll plazas
- **Functionality**:
  - Loads toll data from `tolls.json`
  - Monitors car position against toll locations
  - Shows toast notifications when tolls are crossed
  - Prevents duplicate notifications for same toll
- **Technical Details**: Uses distance calculation with configurable toll radius (100m default)

### 7. Control Interface
- **Description**: Provides buttons for all major operations
- **Buttons**:
  - **Show Route**: Fetches and displays route (enabled when start/end points selected)
  - **Load JSON Data**: Loads car route and toll data from files
  - **Start Car**: Begins car movement animation (enabled when route and car data loaded)
  - **Reset**: Clears all selections and resets the application state

### 8. Data Export
- **Description**: Automatically exports route data as downloadable JSON
- **Functionality**: When route is calculated, downloads `carRoute.json` with route coordinates
- **Technical Details**: Creates blob URL and triggers browser download

## End-to-End User Flow

### Step 1: Setup Route
1. User opens the application
2. Map loads with default center (Delhi region)
3. User clicks on map to select start point (first click)
4. User clicks on map to select end point (second click)
5. "Show Route" button becomes enabled

### Step 2: Display Route
1. User clicks "Show Route" button
2. Application calls OpenRouteService API
3. Route polyline appears on map
4. Route data is automatically downloaded as JSON file
5. Path status resets

### Step 3: Load Simulation Data
1. User clicks "Load JSON Data" button
2. Car route data loads from `carRoute.json` (506 GPS points)
3. Toll data loads from `tolls.json` (3 toll plazas)
4. Car marker appears at starting position
5. "Start Car" button becomes enabled

### Step 4: Start Simulation
1. User clicks "Start Car" button
2. Car begins animated movement along the route
3. Real-time validation begins:
   - Car position checked against route every movement step
   - Path status updates: "on correct path" or "outside route"
   - Toll crossings detected and notified via toast messages

### Step 5: Monitor and Reset
1. User can watch the simulation in real-time
2. Toast notifications appear for toll crossings
3. Path status indicator shows route adherence
4. User can click "Reset" to clear all data and start over

## Data Structures

### Car Route Data (`carRoute.json`)
```json
[
  {
    "lat": 28.629097,
    "lng": 77.198043
  },
  // ... 505 more points
]
```

### Toll Data (`tolls.json`)
```json
[
  {
    "id": 1,
    "name": "Delhi Toll Plaza",
    "latitude": 28.624084,
    "longitude": 77.200442,
    "radius": 100
  },
  // ... more tolls
]
```

## Technical Architecture

### Components
- **App**: Main application wrapper
- **MapRoute**: Core map component with all functionality
- **SelectPoints**: Handles map click events for point selection
- **PathStatus**: Displays route adherence status
- **ControlButtons**: UI controls for operations

### Utilities
- **distance.js**: Haversine distance calculations
- **routeHelpers.js**: Route proximity validation
- **tollHelpers.js**: Toll detection and crossing logic
- **fileHelpers.js**: JSON download functionality

### External APIs
- **OpenRouteService**: Route calculation (requires API key)
- **OpenStreetMap**: Map tiles via Leaflet

### State Management
- React hooks (`useState`, `useRef`) for local state
- No external state management library used

## Configuration Constants

- **Map Center**: Delhi region (28.6139, 77.209)
- **Default Zoom**: 13
- **Route Proximity Threshold**: 30 meters
- **Toll Detection Radius**: 100 meters
- **Car Movement Speed**: 100ms intervals

## Error Handling

- API failures show console errors and alerts
- Missing data prevents invalid operations (buttons disabled)
- File loading errors logged to console
- Graceful degradation when services unavailable

## Browser Compatibility

- Modern browsers with ES6+ support
- Requires fetch API for data loading
- Uses Blob API for file downloads
- Toast notifications via react-toastify

## Performance Considerations

- Route data cached after API call
- Animation uses efficient setInterval
- Distance calculations optimized with early returns
- Map rendering handled by Leaflet library

This documentation covers all major functionalities with clear explanations and technical details for easy understanding of the Route Finder application's capabilities and workflow.