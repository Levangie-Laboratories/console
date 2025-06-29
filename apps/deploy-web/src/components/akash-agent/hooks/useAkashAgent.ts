/**
 * @fileoverview Custom hook for Akash Agent SDK integration
 * 
 * This hook provides the core functionality for communicating with the Akash AI Agent
 * through the Agent SDK v2.0.0 HTTP-first architecture. Includes:
 * - Streaming message handling with real-time action callbacks
 * - Connection testing and status management
 * - Error handling and user feedback
 * - Agent operation controls (start/stop)
 * 
 * 
 * @version 2.0.0
 * @since 2024-06-29
 */

import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { useToast } from '@akashnetwork/ui/hooks';
import type { 
  AgentAction, 
  AgentConnectionStatus, 
  StreamingResponseData 
} from '../types';
import { 
  agentConfigAtom,
  setConnectionStatusAtom 
} from '@src/store/agentStore';

/**
 * useAkashAgent Hook
 * 
 * Primary hook for all Akash Agent interactions. Provides streaming message handling,
 * connection management, and error handling for the Agent SDK v2.0.0.
 * 
 * @returns Object containing agent interaction methods
 * 
 * @features
 * - Streaming messages: Real-time action processing with callbacks
 * - Connection testing: Health checks and status management
 * - Error handling: Comprehensive error types with user-friendly messages
 * - Agent controls: Start, stop, and message operations
 * - Toast notifications: User feedback for connection and error states
 * - Rate limiting: Handles 429 responses and duplicate requests
 * - Timeout management: Configurable timeouts (default 4 hours)
 * 
 * @example
 * ```tsx
 * const { sendStreamingMessage, testConnection } = useAkashAgent();
 * 
 * const handleMessage = async (message: string) => {
 *   await sendStreamingMessage(message, handleAction);
 * };
 * ```
 */
export const useAkashAgent = () => {
  const [agentConfig] = useAtom(agentConfigAtom);
  const [, setConnectionStatus] = useAtom(setConnectionStatusAtom);
  const { toast } = useToast();

  /**
   * Send a streaming message to the agent with real-time action callbacks
   */
  const sendStreamingMessage = useCallback(async (
    message: string,
    onAction: (action: AgentAction, count: number) => void,
    timeout: number = 14400 // 4 hours default
  ): Promise<string> => {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    try {
      setConnectionStatus('connecting');

      // Send request to our Next.js API proxy
      const response = await fetch('/api/akash-agent/stream', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/plain'
        },
        body: JSON.stringify({ 
          message: message.trim(),
          timeout,
          agent_config: agentConfig
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      setConnectionStatus('connected');

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let actionCount = 0;
      let finalResponse = '';
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          try {
            const data: StreamingResponseData = JSON.parse(trimmedLine);
            
            switch (data.type) {
              case 'action':
                if (data.action) {
                  actionCount++;
                  onAction(data.action, actionCount);
                }
                break;
                
              case 'final_response':
                if (data.response) {
                  finalResponse = data.response;
                }
                break;
                
              case 'error':
                throw new Error(data.message || 'Agent error');
                
              default:
                console.warn('Unknown streaming data type:', data.type);
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming data:', parseError, 'Line:', trimmedLine);
          }
        }
      }
      
      // Process any remaining buffer content
      if (buffer.trim()) {
        try {
          const data: StreamingResponseData = JSON.parse(buffer.trim());
          if (data.type === 'final_response' && data.response) {
            finalResponse = data.response;
          }
        } catch (parseError) {
          console.warn('Failed to parse final buffer:', parseError);
        }
      }
      
      return finalResponse;
      
    } catch (error) {
      setConnectionStatus('error');
      
      // Handle different error types based on SDK patterns
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (error instanceof TypeError && errorMessage.includes('fetch')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the Akash Agent. Please check your connection.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('timeout')) {
        toast({
          title: "Agent Timeout",
          description: "The agent took too long to respond. Please try again.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('duplicate request')) {
        toast({
          title: "Duplicate Request",
          description: "Please wait a moment before sending the same message again.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('429')) {
        toast({
          title: "Rate Limit",
          description: "Too many requests. Please wait a moment before trying again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Agent Error",
          description: "The AI agent encountered an error. Please try again.",
          variant: "destructive"
        });
      }
      
      throw error;
    }
  }, [agentConfig, setConnectionStatus, toast]);

  /**
   * Test connection to the agent server
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      setConnectionStatus('connecting');
      
      const response = await fetch('/api/akash-agent/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        setConnectionStatus('error');
        return false;
      }
      
      const data: AgentConnectionStatus = await response.json();
      
      if (data.status === 'connected') {
        setConnectionStatus('connected');
        return true;
      } else {
        setConnectionStatus('error');
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      return false;
    }
  }, [setConnectionStatus]);

  /**
   * Send a simple message (non-streaming) for basic interactions
   */
  const sendMessage = useCallback(async (message: string): Promise<{ request_id: string; status: string }> => {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    try {
      const response = await fetch('/api/akash-agent/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message.trim(),
          agent_config: agentConfig
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  }, [agentConfig]);

  /**
   * Stop the current agent operation
   */
  const stopAgent = useCallback(async (reason: string = 'User requested stop'): Promise<boolean> => {
    try {
      const response = await fetch('/api/akash-agent/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'User requested stop',
          reason,
          agent_config: agentConfig
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Stop agent failed:', error);
      return false;
    }
  }, [agentConfig]);

  return {
    sendStreamingMessage,
    sendMessage,
    testConnection,
    stopAgent
  };
};