/**
 * ControlButtons Component
 * Provides control buttons for map operations (Show Route, Load Car, Start, Reset)
 */

import React from 'react';

/**
 * Map control buttons component
 * 
 * Renders a set of action buttons for:
 * - Showing the route between selected points
 * - Loading car position data from JSON
 * - Starting car movement animation
 * - Resetting all selections and state
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onShowRoute - Handler for Show Route button
 * @param {Function} props.onLoadCarJSON - Handler for Load Car JSON button
 * @param {Function} props.onStartCar - Handler for Start Car button
 * @param {Function} props.onReset - Handler for Reset button
 * @param {boolean} props.canShowRoute - Whether route can be shown (start & end selected)
 * @param {boolean} props.canStartCar - Whether car can be started
 * @returns {JSX.Element} Control buttons panel
 */
function ControlButtons({
  onShowRoute,
  onLoadCarJSON,
  onStartCar,
  onReset,
  canShowRoute,
  canStartCar,
}) {
  return (
    <div className="control-buttons">
      {/* Show Route Button */}
      <button
        onClick={onShowRoute}
        disabled={!canShowRoute}
        className="btn btn--show-route"
      >
        Show Route
      </button>

      {/* Load Car JSON Button */}
      <button
        onClick={onLoadCarJSON}
        className="btn btn--load-car"
      >
        Load Car JSON
      </button>

      {/* Start Car Button */}
      <button
        onClick={onStartCar}
        disabled={!canStartCar}
        className="btn btn--start-car"
      >
        Start Car
      </button>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="btn btn--reset"
      >
        Reset
      </button>
    </div>
  );
}

export default ControlButtons;