import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navigation Component
 * Provides navigation between truck list and map pages
 */
const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>Truck Tracker</h2>
        </div>
        <div className="nav-links">
          <Link
            to="/trucks"
            className={`nav-link ${location.pathname === '/trucks' ? 'active' : ''}`}
          >
            Truck List
          </Link>
          <Link
            to="/vehicles"
            className={`nav-link ${location.pathname === '/vehicles' ? 'active' : ''}`}
          >
            Vehicle Details
          </Link>
          <Link
            to="/map"
            className={`nav-link ${location.pathname.startsWith('/map') ? 'active' : ''}`}
          >
            Map View
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;