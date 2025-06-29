/**
 * @fileoverview Custom hook for managing chat state and operations
 * 
 * This hook provides comprehensive chat state management for the Akash Agent interface:
 * - Message creation and management (user, agent, error messages)
 * - Chat input state and validation
 * - Agent typing indicators and connection status
 * - Conversation utilities and statistics
 * - Performance-optimized message handling
 * 
 * 
 * @version 2.0.0
 * @since 2024-06-29
 */

import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { ChatMessage } from '../types';
import {
  chatMessagesAtom,
  chatInputAtom,
  isAgentTypingAtom,
  addMessageAtom,
  updateMessageAtom,
  clearChatAtom,
  setAgentTypingAtom,
  hasMessagesAtom,
  canSendMessageAtom,
  shouldShowWelcomeAtom,
  visibleMessagesAtom,
  conversationSummaryAtom,
  agentConnectionStatusAtom,
  setConnectionStatusAtom
} from '@src/store/agentStore';

/**
 * useChatState Hook
 * 
 * Comprehensive hook for managing all chat-related state and operations.
 * Provides high-level abstractions for common chat operations while maintaining
 * performance optimizations for large conversations.
 * 
 * @returns Object containing chat state, actions, and utility functions
 * 
 * @features
 * - Message Management: Add, update, and filter user/agent/error messages
 * - Input State: Chat input text and validation
 * - Typing Indicators: Agent processing status
 * - Connection Status: Agent connectivity state
 * - Welcome Logic: Show/hide welcome screen based on conversation state
 * - Performance: Uses visibleMessagesAtom for large conversation optimization
 * - Utilities: Conversation statistics, message search, SDL detection
 * - Auto-ID Generation: Automatic message ID generation with nanoid
 * 
 * @example
 * ```tsx
 * const { 
 *   messages, 
 *   addUserMessage, 
 *   addAgentMessage, 
 *   setAgentTyping 
 * } = useChatState();
 * 
 * const handleSend = () => {
 *   const userMsg = addUserMessage(input);
 *   setAgentTyping(true);
 *   // ... process agent response
 * };
 * ```
 */
export const useChatState = () => {
  const [messages] = useAtom(visibleMessagesAtom);
  const [input, setInput] = useAtom(chatInputAtom);
  const [isAgentTyping] = useAtom(isAgentTypingAtom);
  const [hasMessages] = useAtom(hasMessagesAtom);
  const [canSend] = useAtom(canSendMessageAtom);
  const [shouldShowWelcome] = useAtom(shouldShowWelcomeAtom);
  const [conversationSummary] = useAtom(conversationSummaryAtom);
  const [connectionStatus] = useAtom(agentConnectionStatusAtom);
  const [, setConnectionStatus] = useAtom(setConnectionStatusAtom);
  
  // Action atoms
  const [, addMessage] = useAtom(addMessageAtom);
  const [, updateMessage] = useAtom(updateMessageAtom);
  const [, clearChat] = useAtom(clearChatAtom);
  const [, setTyping] = useAtom(setAgentTypingAtom);

  /**
   * Add a new message to the chat
   */
  const addUserMessage = useCallback((content: string): ChatMessage => {
    const message: ChatMessage = {
      id: nanoid(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'sent'
    };
    
    addMessage(message);
    return message;
  }, [addMessage]);

  /**
   * Add an agent message to the chat
   */
  const addAgentMessage = useCallback((
    content: string, 
    options?: { 
      sdl?: string; 
      actionType?: ChatMessage['actionType'];
      sequenceIndex?: number;
      status?: ChatMessage['status'];
    }
  ): ChatMessage => {
    const message: ChatMessage = {
      id: options?.sequenceIndex ? `action-${options.sequenceIndex}` : nanoid(),
      type: 'agent',
      content: content.trim(),
      timestamp: new Date(),
      status: options?.status || 'completed',
      sdl: options?.sdl,
      actionType: options?.actionType,
      sequenceIndex: options?.sequenceIndex
    };
    
    addMessage(message);
    return message;
  }, [addMessage]);

  /**
   * Update an existing message
   */
  const updateExistingMessage = useCallback((
    messageId: string, 
    updates: Partial<ChatMessage>
  ) => {
    updateMessage(messageId, updates);
  }, [updateMessage]);

  /**
   * Add an error message to the chat
   */
  const addErrorMessage = useCallback((error: string): ChatMessage => {
    const message: ChatMessage = {
      id: nanoid(),
      type: 'agent',
      content: error || "I encountered an error processing your request. Please try again.",
      timestamp: new Date(),
      status: 'error'
    };
    
    addMessage(message);
    return message;
  }, [addMessage]);

  /**
   * Set agent typing status
   */
  const setAgentTyping = useCallback((isTyping: boolean) => {
    setTyping(isTyping);
  }, [setTyping]);

  /**
   * Clear the entire chat
   */
  const clearConversation = useCallback(() => {
    clearChat();
  }, [clearChat]);

  /**
   * Get the last message of a specific type
   */
  const getLastMessage = useCallback((type?: 'user' | 'agent'): ChatMessage | null => {
    if (!type) {
      return messages[messages.length - 1] || null;
    }
    
    const filteredMessages = messages.filter(m => m.type === type);
    return filteredMessages[filteredMessages.length - 1] || null;
  }, [messages]);

  /**
   * Get messages with SDL content
   */
  const getSDLMessages = useCallback((): ChatMessage[] => {
    return messages.filter(m => m.sdl);
  }, [messages]);

  /**
   * Check if a message with specific content exists
   */
  const hasMessageWithContent = useCallback((content: string): boolean => {
    return messages.some(m => m.content.toLowerCase().includes(content.toLowerCase()));
  }, [messages]);

  /**
   * Get conversation statistics
   */
  const getConversationStats = useCallback(() => {
    const userMessages = messages.filter(m => m.type === 'user');
    const agentMessages = messages.filter(m => m.type === 'agent');
    const sdlMessages = messages.filter(m => m.sdl);
    const errorMessages = messages.filter(m => m.status === 'error');
    
    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      agentMessages: agentMessages.length,
      sdlMessages: sdlMessages.length,
      errorMessages: errorMessages.length,
      conversationDuration: messages.length > 0 
        ? Date.now() - messages[0].timestamp.getTime()
        : 0,
      lastActivity: messages.length > 0 
        ? messages[messages.length - 1].timestamp
        : null
    };
  }, [messages]);

  return {
    // State
    messages,
    input,
    setInput,
    isAgentTyping,
    hasMessages,
    canSend,
    shouldShowWelcome,
    conversationSummary,
    connectionStatus,
    setConnectionStatus,
    
    // Actions
    addUserMessage,
    addAgentMessage,
    addErrorMessage,
    updateExistingMessage,
    setAgentTyping,
    clearConversation,
    
    // Getters
    getLastMessage,
    getSDLMessages,
    hasMessageWithContent,
    getConversationStats
  };
};