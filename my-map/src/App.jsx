/**
 * App Component
 * Root component of the Truck Tracking application
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import components
import { Navigation, TruckList, TruckMap } from './components';

// Import context
import { TruckProvider } from './contexts/TruckContext';

/**
 * Main application component
 * Sets up routing for truck list and map pages
 *
 * @returns {JSX.Element} The main application layout
 */
function App() {
  return (
    <TruckProvider>
      <Router>
        <Navigation />
        <div className="app">
          <Routes>
            <Route path="/trucks" element={<TruckList />} />
            <Route path="/map" element={<TruckMap />} />
            <Route path="/map/:truckId" element={<TruckMap />} />
            <Route path="/" element={<TruckList />} />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </TruckProvider>
  );
}

export default App;
