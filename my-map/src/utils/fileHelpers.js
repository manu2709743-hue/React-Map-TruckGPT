/**
 * File Helper Utilities
 * Functions for file download and data export operations
 */

/**
 * Download data as a JSON file
 * 
 * Creates a downloadable JSON file from the provided data object.
 * Automatically triggers browser download dialog.
 * 
 * @param {Object|Array} data - Data to be converted to JSON and downloaded
 * @param {string} filename - Name of the file to download (default: 'carRoute.json')
 * 
 * @example
 * const routeData = [{ lat: 28.6139, lng: 77.209 }];
 * downloadJSON(routeData, 'myRoute.json');
 */
export function downloadJSON(data, filename = 'carRoute.json') {
  // Convert data to formatted JSON string
  const jsonString = JSON.stringify(data, null, 2);
  
  // Create a Blob with JSON content
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create and trigger download link
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  downloadLink.click();
  
  // Clean up the temporary URL
  URL.revokeObjectURL(url);
}