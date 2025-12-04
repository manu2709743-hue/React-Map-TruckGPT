/**
 * Table Component
 * Reusable table component for displaying data
 */

import React from 'react';
import '../styles/table.css';

const Table = ({ 
  columns = [], 
  data = [], 
  renderRow = null,
  className = '',
}) => {
  if (!data || data.length === 0) {
    return <div className="loading">No data available</div>;
  }

  return (
    <div className={`table-wrapper ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {renderRow ? (
                renderRow(row, idx)
              ) : (
                columns.map((col) => (
                  <td key={col.key}>{row[col.key]}</td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
