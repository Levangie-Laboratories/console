import type { NextApiRequest, NextApiResponse } from 'next';

interface StreamRequest {
  message: string;
  timeout?: number;
  agent_config?: {
    agent_id?: string;
    api_key?: string;
    base_url?: string;
  };
}

/**
 * API route for streaming agent communication
 * This proxies requests to the Python Agent SDK
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, timeout = 14400, agent_config }: StreamRequest = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
  }

  // Validate agent configuration
  const agentId = agent_config?.agent_id || process.env.AGENT_ID;
  const baseUrl = agent_config?.base_url || process.env.AGENT_BASE_URL || process.env.AGENT_PROXY_URL;
  
  if (!baseUrl) {
    return res.status(500).json({ 
      error: 'Agent configuration missing. AGENT_BASE_URL or AGENT_PROXY_URL environment variable required.' 
    });
  }

  // Set up streaming response headers
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  try {
    console.log(`[Agent API] Starting streaming request to ${baseUrl}/stream`);
    console.log(`[Agent API] Message: ${message.substring(0, 100)}...`);
    
    // Make request to agent proxy/server
    const agentResponse = await fetch(`${baseUrl}/stream`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'text/plain',
        ...(agent_config?.api_key && { 'Authorization': `Bearer ${agent_config.api_key}` })
      },
      body: JSON.stringify({
        message: message.trim(),
        timeout,
        agent_id: agentId,
        base_url: baseUrl
      })
    });

    if (!agentResponse.ok) {
      throw new Error(`Agent proxy error: ${agentResponse.status} ${agentResponse.statusText}`);
    }

    console.log(`[Agent API] Connected to agent, streaming response...`);

    // Stream the response back to the client
    const reader = agentResponse.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available from agent');
    }

    const decoder = new TextDecoder();
    let actionCount = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Log raw chunk for debugging (first 200 chars)
        if (chunk.trim()) {
          console.log(`[Agent API] Chunk received: ${chunk.substring(0, 200)}...`);
          actionCount++;
        }

        // Forward chunk to client
        res.write(chunk);
      }
    } finally {
      reader.releaseLock();
    }

    console.log(`[Agent API] Streaming completed. Total actions processed: ${actionCount}`);

  } catch (error) {
    console.error('[Agent API] Streaming error:', error);
    
    // Send error to client
    const errorData = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Agent communication failed',
      timestamp: Date.now()
    };
    
    res.write(JSON.stringify(errorData) + '\n');
  } finally {
    res.end();
  }
}

// Increase timeout for streaming requests (10 minutes)
export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 600, // 10 minutes
};