/**
 * App Component
 * Root component of the Route Finder application
 */

import { MapRoute } from './components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

/**
 * Main application component
 * Renders the Route Finder heading and the MapRoute component
 * 
 * @returns {JSX.Element} The main application layout
 */
function App() {
  return (
    <div className="app">
      <h2 className="app__title">Route Finder</h2>
      <MapRoute />
      <ToastContainer />
    </div>
  );
}

export default App;
