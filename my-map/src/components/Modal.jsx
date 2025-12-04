/**
 * Modal Component
 * Reusable modal wrapper component
 */

import React from 'react';
import '../styles/modal.css';

const Modal = ({ 
  isOpen = false, 
  onClose = null, 
  title = '',
  children,
  footer = null,
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h2>{title}</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
        )}
        {!title && (
          <button className="modal-close modal-close-floating" onClick={onClose}>×</button>
        )}
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
