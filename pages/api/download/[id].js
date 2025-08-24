// pages/api/download/[id].js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { id } = req.query;

  // Validate the ID format (basic UUID validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    // Load the saved results
    const resultsPath = path.join(process.cwd(), 'results', `${id}.json`);
    
    if (!fs.existsSync(resultsPath)) {
      return res.status(404).json({ error: 'Results not found' });
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    const outputFile = results.outputFile;

    if (!outputFile || !fs.existsSync(outputFile.path)) {
      return res.status(404).json({ error: 'Output file not found' });
    }

    // Set download headers
    res.setHeader('Content-Disposition', `attachment; filename="${outputFile.filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    if (outputFile.type === 'csv') {
      // Handle CSV download
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      
      // Read and send the CSV file
      const csvContent = fs.readFileSync(outputFile.path, 'utf8');
      res.send(csvContent);
      
    } else if (outputFile.type === 'excel') {
      // Handle Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      // Read and send the Excel file as buffer
      const buffer = fs.readFileSync(outputFile.path);
      res.send(buffer);
      
    } else {
      return res.status(400).json({ error: 'Unknown file type' });
    }
    
  } catch (error) {
    console.error('Download failed:', error);
    
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' });
    }
    
    return res.status(500).json({ error: 'Download failed' });
  }
}