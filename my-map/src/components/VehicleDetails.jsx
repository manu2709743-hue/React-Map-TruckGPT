import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Table } from './index';
import DriverDetailsModal from './DriverDetailsModal';
import { API_ENDPOINTS, API_CONFIG } from '../constants';
import '../styles/vehicle-details.css';

/**
 * VehicleDetails Component
 * Displays list of vehicles from backend API
 */
const VehicleDetails = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.VEHICLE_DETAILS, {
          auth: API_CONFIG.AUTH_CREDENTIALS,
        });

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

  const handleDriverNameClick = (driverId, driverName) => {
    setSelectedDriver({ driverId, driverName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
  };

  if (loading) {
    return <div className="loading">Loading vehicles...</div>;
  }

  const columns = [
    { key: 'vId', label: 'Vehicle ID' },
    { key: 'vNumber', label: 'Vehicle Number' },
    { key: 'driverName', label: 'Driver Name' },
    { key: 'modalNumber', label: 'Modal Number' },
  ];

  return (
    <div className="vehicle-details-container">
      <Table
        columns={columns}
        data={vehicles}
        renderRow={(vehicle) => (
          <>
            <td>{vehicle.vId}</td>
            <td>{vehicle.vNumber}</td>
            <td>
              <button 
                className="driver-name-btn"
                onClick={() => handleDriverNameClick(vehicle.driverId, vehicle.driverName)}
                title="Click to view driver details"
              >
                {vehicle.driverName}
              </button>
            </td>
            <td>{vehicle.modalNumber}</td>
          </>
        )}
      />

      {selectedDriver && (
        <DriverDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          driverId={selectedDriver.driverId}
          driverName={selectedDriver.driverName}
        />
      )}
    </div>
  );
};

export default VehicleDetails;
