import type { NextApiRequest, NextApiResponse } from 'next';

interface MessageRequest {
  message: string;
  agent_config?: {
    agent_id?: string;
    api_key?: string;
    base_url?: string;
  };
}

interface MessageResponse {
  request_id: string;
  status: 'sent' | 'completed' | 'error';
  agent_id: string;
  operation: 'message';
  error?: string;
}

/**
 * API route for simple (non-streaming) agent messages
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<MessageResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      request_id: '',
      status: 'error',
      agent_id: '',
      operation: 'message',
      error: 'Method not allowed'
    });
  }

  const { message, agent_config }: MessageRequest = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      request_id: '',
      status: 'error',
      agent_id: agent_config?.agent_id || '',
      operation: 'message',
      error: 'Message is required and must be a non-empty string'
    });
  }

  try {
    const agentId = agent_config?.agent_id || process.env.AGENT_ID || 'default-agent';
    const baseUrl = agent_config?.base_url || process.env.AGENT_BASE_URL || process.env.AGENT_PROXY_URL;
    
    if (!baseUrl) {
      return res.status(500).json({
        request_id: '',
        status: 'error',
        agent_id: agentId,
        operation: 'message',
        error: 'Agent configuration missing. AGENT_BASE_URL or AGENT_PROXY_URL environment variable required.'
      });
    }

    console.log(`[Agent Message] Sending message to ${baseUrl}/message`);
    console.log(`[Agent Message] Message: ${message.substring(0, 100)}...`);

    // Send message to agent
    const response = await fetch(`${baseUrl}/message`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(agent_config?.api_key && { 'Authorization': `Bearer ${agent_config.api_key}` })
      },
      body: JSON.stringify({
        message: message.trim(),
        agent_id: agentId
      }),
      // 30 second timeout for simple messages
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`Agent response error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[Agent Message] Response received:`, data);

    // Return agent response
    res.status(200).json({
      request_id: data.request_id || `req_${Date.now()}`,
      status: data.status || 'sent',
      agent_id: agentId,
      operation: 'message'
    });

  } catch (error) {
    console.error('[Agent Message] Send message failed:', error);
    
    let errorMessage = 'Failed to send message to agent';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Message request timeout';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to agent server';
      } else {
        errorMessage = error.message;
      }
    }

    res.status(500).json({
      request_id: '',
      status: 'error',
      agent_id: agent_config?.agent_id || 'unknown',
      operation: 'message',
      error: errorMessage
    });
  }
}