import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchDriverDetails } from '../services/driverService';
import { Button, Modal } from './index';
import '../styles/driver-details-modal.css';

/**
 * DriverDetailsModal Component
 * Displays driver information in a modal popup
 */
const DriverDetailsModal = ({ isOpen, onClose, driverId, driverName }) => {
  const [driverDetails, setDriverDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && driverId) {
      loadDriverDetails();
    }
  }, [isOpen, driverId]);

  const loadDriverDetails = async () => {
    setLoading(true);
    try {
      const details = await fetchDriverDetails(driverId);
      if (details) {
        setDriverDetails(details);
      } else {
        toast.error('Driver details not found');
        onClose();
      }
    } catch (error) {
      console.error('Error loading driver details:', error);
      toast.error('Failed to load driver details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {loading ? (
        <div className="modal-loading">Loading driver details...</div>
      ) : driverDetails ? (
        <div className="driver-details-wrapper">
          <div className="driver-details-content">
            {/* Left Side - Image & Name */}
            <div className="driver-image-section">
              {driverDetails.image ? (
                <div className="driver-image-container">
                  <img 
                    src={driverDetails.image} 
                    alt={driverDetails.driverFullName}
                    className="driver-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="driver-image" style={{ background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No Image
                </div>
              )}
              <div className="driver-name-display">
                <h3>{driverDetails.driverFullName}</h3>
                <p>Driver ID: {driverDetails.driverId}</p>
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="driver-info-section">
              <div className="driver-info-grid">
                <div className="info-group">
                  <label className="info-label">Gender</label>
                  <div className="info-value">{driverDetails.gender}</div>
                </div>

                <div className="info-group">
                  <label className="info-label">Date of Birth</label>
                  <div className="info-value">
                    {new Date(driverDetails.dateOfBirth).toLocaleDateString('en-IN')}
                  </div>
                </div>

                <div className="info-group full-width">
                  <label className="info-label">Mobile Number</label>
                  <div className="info-value">
                    <a href={`tel:${driverDetails.mobileNumber}`} className="phone-link">
                      {driverDetails.mobileNumber}
                    </a>
                  </div>
                </div>

                <div className="info-group full-width">
                  <label className="info-label">License Number</label>
                  <div className="info-value">{driverDetails.licenseNumber}</div>
                </div>

                <div className="info-group full-width">
                  <label className="info-label">Address</label>
                  <div className="info-value address-text">{driverDetails.address}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer-actions">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="modal-error">No driver details found</div>
      )}
    </Modal>
  );
};

export default DriverDetailsModal;
