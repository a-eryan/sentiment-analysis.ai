// pages/api/upload.js
import { processFileUpload } from '../../src/lib/processSentiSheet';

// IMPORTANT: Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '3mb', // 1mb additional overhead
  },
};

export default async function handler(req, res) { 
  //"API Routes do not specify CORS headers, meaning they are same-origin only by default."
  // // Cross-Origin Resource Sharing (CORS) handling
  // const allowedOrigins = ['https://sentiment-analysis.ai', 'http://localhost:3000'];
  // const origin = req.headers.origin;

  // if (!allowedOrigins.includes(origin)) {
  //   return res.status(403).json({ error: 'Forbidden' });
  // }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set request timeout (5 minutes)
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  }, 5 * 60 * 1000);

  try {
    // Process the file upload and sentiment analysis
    const result = await processFileUpload(req);
    
    clearTimeout(timeoutId);
    
    // Return JSON for client-side redirect (SPA approach)
    res.status(200).json({
      success: true,
      id: result.id,
      redirectUrl: `/sentisheet/${result.id}`,
      metadata: result.metadata
    });
    
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Upload processing failed:', error);
    
    let statusCode = 400; //default to bad request
    
    if (error.name === 'FileSizeError' || error.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413; //payload too large
    } else if (error.name === 'TimeoutError') {
      statusCode = 408; //request timeout
    } else if (error.name === 'ValidationError' || error.name === 'FileTypeError') {
      statusCode = 400; //bad request
    } else if (error.name === 'ProcessingError') {
      statusCode = 422; //unprocessable entity
    } else if (!error.name || error.name === 'Error') {
      statusCode = 500; //internal server error
    }
    res.status(statusCode).json({ error: error.message });
  }
}