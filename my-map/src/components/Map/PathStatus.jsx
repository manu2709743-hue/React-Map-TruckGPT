/**
 * PathStatus Component
 * Displays real-time status of whether the car is on the correct route
 */

import React from 'react';

/**
 * Path status indicator component
 * 
 * Shows a visual indicator of whether the car is currently
 * following the correct route or has deviated from it.
 * 
 * @param {Object} props - Component props
 * @param {boolean|null} props.isCorrectPath - true if on path, false if off path, null if not checking
 * @returns {JSX.Element|null} Status message or null if not applicable
 */
function PathStatus({ isCorrectPath }) {
  // Don't show anything if path status hasn't been determined
  if (isCorrectPath === null) {
    return null;
  }

  // Car is on the correct path
  if (isCorrectPath === true) {
    return (
      <div className="path-status path-status--correct">
        ✔ Car is on correct path
      </div>
    );
  }

  // Car has deviated from the route
  return (
    <div className="path-status path-status--incorrect">
      ✖ Car is outside the correct route
    </div>
  );
}

export default PathStatus;