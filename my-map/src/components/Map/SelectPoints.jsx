/**
 * SelectPoints Component
 * Handles map click events for selecting start and end points
 */

import { useMapEvents } from 'react-leaflet';

/**
 * Map click handler component for selecting route start and end points
 * 
 * This component listens for map click events and sets the start point
 * on first click and end point on second click.
 * 
 * @param {Object} props - Component props
 * @param {Array|null} props.startPoint - Current start point [lat, lng] or null
 * @param {Array|null} props.endPoint - Current end point [lat, lng] or null
 * @param {Function} props.setStartPoint - Function to set start point
 * @param {Function} props.setEndPoint - Function to set end point
 * @returns {null} This component doesn't render any visible elements
 */
function SelectPoints({ startPoint, endPoint, setStartPoint, setEndPoint }) {
  useMapEvents({
    click(event) {
      const clickedPoint = [event.latlng.lat, event.latlng.lng];

      // Set start point on first click
      if (!startPoint) {
        setStartPoint(clickedPoint);
      }
      // Set end point on second click
      else if (!endPoint) {
        setEndPoint(clickedPoint);
      }
      // Both points already set - do nothing
    },
  });

  // This component only handles events, doesn't render anything
  return null;
}

export default SelectPoints;