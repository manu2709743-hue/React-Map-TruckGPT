import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

/**
 * VehicleDetails Component
 * Displays list of vehicles from backend API
 */
const VehicleDetails = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        // Fetch vehicles from backend API through proxy
        const response = await axios.get('/api/backend/o/c/vehicledetails', {
          auth: {
            username: "Admin@khichad.com",
            password: "Admin@khichad",
          },
        });

        // Extract items array from API response
        const vehiclesData = response.data.items || [];
        setVehicles(vehiclesData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading vehicles from backend:', error);
        toast.error('Failed to load vehicles from backend');
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  if (loading) {
    return <div className="loading">Loading vehicles...</div>;
  }

  return (
    <div className="vehicle-details-container">
      <div className="vehicle-table-wrapper">
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Vehicle Number</th>
              <th>Driver Name</th>
              <th>Modal Number</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => {
              return (
                <tr key={vehicle.vId}>
                  <td>{vehicle.vId}</td>
                  <td>{vehicle.vNumber}</td>
                  <td>{vehicle.driverName}</td>
                  <td>{vehicle.modalNumber}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleDetails;
