/**
 * App Component
 * Root component of the Vehicle Tracking application
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import global styles
import './styles/globals.css';
import './styles/buttons.css';
import './styles/table.css';
import './styles/modal.css';
import './styles/status-badge.css';

// Import components
import { Navigation, VehicleList, VehicleMap, VehicleDetails } from './components';

// Import context
import { VehicleProvider } from './contexts/VehicleContext';

/**
 * Main application component
 * Sets up routing for vehicle list and map pages
 *
 * @returns {JSX.Element} The main application layout
 */
function App() {
  return (
    <VehicleProvider>
      <Router>
        <Navigation />
        <div className="page-container">
          <div className="page-content">
            <Routes>
              <Route path="/trucks" element={<VehicleList />} />
              <Route path="/vehicles" element={<VehicleDetails />} />
              <Route path="/map" element={<VehicleMap />} />
              <Route path="/map/:vehicleId" element={<VehicleMap />} />
              <Route path="/" element={<VehicleList />} />
            </Routes>
            <ToastContainer />
          </div>
        </div>
      </Router>
    </VehicleProvider>
  );
}

export default App;
