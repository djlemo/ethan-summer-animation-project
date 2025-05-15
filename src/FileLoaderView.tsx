// src/FileLoaderView.tsx
import React, { useState, type ChangeEvent } from 'react';
import { readFileContent } from './utils/fileUtils'; // Import the tested utility

const FileLoaderView: React.FC = () => {
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [csvContent, setCsvContent] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFileNames([]);
    setCsvContent('');
    setError('');

    const files = event.target.files;
    if (!files || files.length === 0) {
      setError('No files selected.');
      return;
    }

    const foundFiles: File[] = Array.from(files);
    const relevantFileNames: string[] = [];
    let firstCsvFile: File | null = null;

    for (const file of foundFiles) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'csv' || extension === 'zip') {
        relevantFileNames.push(file.name);
        if (extension === 'csv' && !firstCsvFile) {
          firstCsvFile = file;
        }
      }
    }

    if (relevantFileNames.length === 0) {
      setError('No CSV or ZIP files found in the selection.');
    } else {
      setSelectedFileNames(relevantFileNames);
    }

    if (firstCsvFile) {
      try {
        const content = await readFileContent(firstCsvFile); // Use the imported utility
        setCsvContent(content);
      } catch (err: any) {
        console.error("Error processing CSV file:", err);
        setError(`Error reading CSV file: ${firstCsvFile.name}. ${err.message}`);
        setCsvContent('');
      }
    } else if (relevantFileNames.length > 0 && !firstCsvFile) {
        setCsvContent('');
    }
  };

  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid green' }}>
      <h2>File Loader and CSV Viewer</h2>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        accept=".csv,.zip"
        style={{ display: 'block', margin: '10px 0' }}
      />
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {selectedFileNames.length > 0 && (
        <div>
          <h3>Found CSV/ZIP Files:</h3>
          <ul>
            {selectedFileNames.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </div>
      )}
      {csvContent && (
        <div>
          <h3>Content of the first CSV file ({selectedFileNames.find(name => name.endsWith('.csv')) || 'N/A'}):</h3>
          <pre style={{ border: '1px solid #ccc', padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {csvContent}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FileLoaderView;