/**
 * App Component
 * Root component of the Truck Tracking application
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
import { Navigation, TruckList, TruckMap, VehicleDetails } from './components';

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
        <div className="page-container">
          <div className="page-content">
            <Routes>
              <Route path="/trucks" element={<TruckList />} />
              <Route path="/vehicles" element={<VehicleDetails />} />
              <Route path="/map" element={<TruckMap />} />
              <Route path="/map/:truckId" element={<TruckMap />} />
              <Route path="/" element={<TruckList />} />
            </Routes>
            <ToastContainer />
          </div>
        </div>
      </Router>
    </TruckProvider>
  );
}

export default App;
