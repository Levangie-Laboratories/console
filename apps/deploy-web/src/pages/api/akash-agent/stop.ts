import type { NextApiRequest, NextApiResponse } from 'next';

interface StopRequest {
  message?: string;
  reason?: string;
  agent_config?: {
    agent_id?: string;
    api_key?: string;
    base_url?: string;
  };
}

interface StopResponse {
  status: 'sent' | 'error';
  message: string;
  agent_id?: string;
}

/**
 * API route for stopping agent operations
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<StopResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed'
    });
  }

  const { 
    message = 'User requested stop', 
    reason = 'User initiated stop request',
    agent_config 
  }: StopRequest = req.body;

  try {
    const agentId = agent_config?.agent_id || process.env.AGENT_ID || 'default-agent';
    const baseUrl = agent_config?.base_url || process.env.AGENT_BASE_URL || process.env.AGENT_PROXY_URL;
    
    if (!baseUrl) {
      return res.status(500).json({
        status: 'error',
        message: 'Agent configuration missing. AGENT_BASE_URL or AGENT_PROXY_URL environment variable required.'
      });
    }

    console.log(`[Agent Stop] Sending stop request to ${baseUrl}/stop`);
    console.log(`[Agent Stop] Reason: ${reason}`);

    // Send stop request to agent
    const response = await fetch(`${baseUrl}/stop`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(agent_config?.api_key && { 'Authorization': `Bearer ${agent_config.api_key}` })
      },
      body: JSON.stringify({
        message,
        reason,
        agent_id: agentId
      }),
      // 10 second timeout for stop requests
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Agent stop error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[Agent Stop] Stop request sent successfully:`, data);

    res.status(200).json({
      status: 'sent',
      message: data.message || 'Stop request sent successfully',
      agent_id: agentId
    });

  } catch (error) {
    console.error('[Agent Stop] Stop request failed:', error);
    
    let errorMessage = 'Failed to send stop request to agent';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Stop request timeout';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to agent server';
      } else {
        errorMessage = error.message;
      }
    }

    res.status(500).json({
      status: 'error',
      message: errorMessage,
      agent_id: agent_config?.agent_id
    });
  }
}