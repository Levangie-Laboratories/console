/**
 * @fileoverview TypeScript definitions for the Akash AI Agent system
 * 
 * This file contains all type definitions for:
 * - Agent SDK v2.0.0 action types and responses
 * - Chat message structure and status types
 * - Component prop interfaces
 * - Agent configuration and state types
 * 
 * 
 * @version 2.0.0
 * @since 2024-06-29
 */

import type { TemplateCreation } from "@src/types";

/**
 * Agent Action Types based on Agent SDK v2.0.0 Schema
 * 
 * These actions are sent by the agent during streaming operations
 * to provide real-time feedback and progress updates to the user.
 */
export interface AgentAction {
  /** The type of action being performed by the agent */
  command: 'chat' | 'read_file' | 'modify_file' | 'create_file' | 'delete_file' | 'list_directory' | 'search_project' | 'run_subprocess' | 'feedback' | 'complete';
  /** Action parameters, varies by command type */
  parameters: Record<string, any>;
  /** Result of the action execution */
  result?: any;
  /** Unix timestamp when action was created */
  timestamp: number;
  /** Sequential index for action ordering */
  sequence_index: number;
  /** Current status of the action */
  status?: 'pending' | 'completed' | 'error';
}

/**
 * Agent Response from API
 * Standard response format from the Agent SDK HTTP API
 */
export interface AgentResponse {
  /** Unique identifier for the request */
  request_id: string;
  /** Overall status of the agent operation */
  status: 'sent' | 'completed' | 'error';
  /** Agent identifier */
  agent_id: string;
  /** Type of operation performed */
  operation: 'message';
}

/**
 * Chat Message Structure
 * 
 * Represents individual messages in the chat interface with metadata
 * for rendering, status tracking, and SDL detection.
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Message sender type */
  type: 'user' | 'agent';
  /** Message text content */
  content: string;
  /** Message creation timestamp */
  timestamp: Date;
  /** Message delivery/processing status */
  status?: 'sending' | 'sent' | 'delivered' | 'error' | 'completed' | 'pending';
  /** SDL content if detected in message (for deployment preview) */
  sdl?: string;
  /** Associated agent action type for context */
  actionType?: AgentAction['command'];
  /** Sequence number for action ordering */
  sequenceIndex?: number;
}

/**
 * Chat Interface Props
 * Props for the main ChatInterface component
 */
export interface ChatInterfaceProps {
  /** Callback when agent generates SDL for deployment */
  onSDLGenerated?: (sdl: string, template: TemplateCreation) => void;
  /** Callback to close the chat interface */
  onClose?: () => void;
}

/**
 * Akash Agent Modal Props
 * Props for the modal wrapper component
 */
export interface AkashAgentModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when SDL is generated for deployment */
  onSDLGenerated: (sdl: string, template: TemplateCreation) => void;
}

/**
 * Chat Input Props
 * Base props for the chat input component
 */
export interface ChatInputProps {
  /** Callback when user sends a message */
  onStreamingMessage: (message: string) => void;
  /** Whether the input should be disabled */
  disabled?: boolean;
}

/**
 * Chat Message Bubble Props
 * Props for individual message components
 */
export interface ChatMessageBubbleProps {
  /** The message data to display */
  message: ChatMessage;
}

/**
 * Chat Message List Props
 * Props for the message list container
 */
export interface ChatMessageListProps {
  /** Array of messages to display */
  messages: ChatMessage[];
}

/**
 * SDL Preview Card Props
 * Props for SDL preview and deployment components
 */
export interface SDLPreviewCardProps {
  /** SDL content to preview */
  sdl: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback when user wants to use the SDL */
  onUseSDL?: () => void;
}

/**
 * Agent Configuration
 * Configuration options for the Akash Agent SDK
 */
export interface AgentConfig {
  /** Agent identifier from environment */
  agent_id?: string;
  /** API key for authentication (if required) */
  api_key?: string;
  /** Base URL for the agent API */
  base_url?: string;
  /** Request timeout in seconds (default: 4 hours) */
  timeout?: number;
}

/**
 * Streaming Response Data
 * Structure for real-time streaming responses from the agent
 */
export interface StreamingResponseData {
  /** Type of streaming data received */
  type: 'action' | 'final_response' | 'error';
  /** Agent action data (if type is 'action') */
  action?: AgentAction;
  /** Final response text (if type is 'final_response') */
  response?: string;
  /** Error message (if type is 'error') */
  message?: string;
}

/**
 * Agent Connection Status
 * Status information returned from agent health checks
 */
export interface AgentConnectionStatus {
  /** Overall connection status */
  status: 'connected' | 'disconnected' | 'error';
  /** Agent status data (if connected) */
  data?: {
    /** Agent service name */
    agent_name: string;
    /** Agent health status */
    status: string;
    /** Last update timestamp */
    timestamp: string;
  };
  /** Error message (if connection failed) */
  error?: string;
  /** HTTP status code */
  code?: number;
}