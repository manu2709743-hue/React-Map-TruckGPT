/**
 * StatusBadge Component
 * Reusable status badge component
 */

import React from 'react';
import { STATUS_BADGE_CLASS } from '../constants';
import '../styles/status-badge.css';

const StatusBadge = ({ status = 'Pending', className = '' }) => {
  const badgeClass = STATUS_BADGE_CLASS[status] || 'status-pending';
  
  return (
    <span className={`status ${badgeClass} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
