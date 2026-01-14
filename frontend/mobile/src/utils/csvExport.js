/**
 * Convert screener results to CSV format
 */
export function generateCSV(results, query, timestamp) {
  if (!results || results.length === 0) {
    return '';
  }

  // Get all unique keys from results
  const allKeys = new Set();
  results.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== 'derived_metrics' && key !== 'matched_conditions') {
        allKeys.add(key);
      }
    });
    
    // Add derived metrics as separate columns
    if (item.derived_metrics) {
      Object.keys(item.derived_metrics).forEach((key) => {
        allKeys.add(`derived_${key}`);
      });
    }
  });

  // Add metadata columns
  allKeys.add('matched_conditions');
  allKeys.add('query');
  allKeys.add('timestamp');

  const headers = Array.from(allKeys);
  
  // Create CSV rows
  const rows = results.map((item) => {
    const row = {};
    
    // Copy base fields
    headers.forEach((header) => {
      if (header.startsWith('derived_')) {
        const metricKey = header.replace('derived_', '');
        row[header] = item.derived_metrics?.[metricKey] ?? '';
      } else if (header === 'matched_conditions') {
        row[header] = item.matched_conditions?.join('; ') ?? '';
      } else if (header === 'query') {
        row[header] = query || '';
      } else if (header === 'timestamp') {
        row[header] = timestamp || '';
      } else {
        row[header] = item[header] ?? '';
      }
    });
    
    return row;
  });

  // Convert to CSV string
  const csvHeaders = headers.join(',');
  const csvRows = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        // Escape commas and quotes in values
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Share CSV content (React Native Share API)
 */
export async function exportToCSV(csvContent, filename, Share) {
  if (!Share) {
    console.error('Share API not available');
    return;
  }

  try {
    await Share.share({
      message: csvContent,
      title: filename,
    });
  } catch (error) {
    // User cancelled or error
    if (error.message !== 'User did not share') {
      console.error('Share error:', error);
    }
  }
}
