import type { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
  status: 'connected' | 'error';
  data?: {
    agent_name: string;
    status: string;
    timestamp: string;
    version?: string;
  };
  error?: string;
  code?: number;
}

/**
 * API route for testing agent connection
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<HealthResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      status: 'error', 
      error: 'Method not allowed',
      code: 405 
    });
  }

  try {
    const baseUrl = process.env.AGENT_BASE_URL || process.env.AGENT_PROXY_URL;
    
    if (!baseUrl) {
      return res.status(500).json({
        status: 'error',
        error: 'Agent configuration missing. AGENT_BASE_URL or AGENT_PROXY_URL environment variable required.',
        code: 500
      });
    }

    console.log(`[Agent Health] Testing connection to ${baseUrl}/health`);

    // Test connection to agent server
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // 10 second timeout for health checks
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      console.error(`[Agent Health] Health check failed: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        status: 'error',
        error: `Agent health check failed: ${response.statusText}`,
        code: response.status
      });
    }

    const data = await response.json();
    console.log(`[Agent Health] Health check successful:`, data);

    // Return successful health status
    res.status(200).json({
      status: 'connected',
      data: {
        agent_name: data.agent_name || 'Akash Agent',
        status: data.status || 'healthy',
        timestamp: data.timestamp || new Date().toISOString(),
        version: data.version
      }
    });

  } catch (error) {
    console.error('[Agent Health] Connection test failed:', error);
    
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Health check timeout';
        statusCode = 408;
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to agent server';
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
    }

    res.status(statusCode).json({
      status: 'error',
      error: errorMessage,
      code: statusCode
    });
  }
}