/**
 * @fileoverview Jotai state management for the Akash AI Agent
 * 
 * This file provides comprehensive state management for the Akash Agent system including:
 * - Chat message state and conversation management
 * - Agent typing indicators and connection status
 * - SDL generation and template creation state
 * - Modal and UI state management
 * - Performance optimizations for large conversations
 * - Derived state atoms for complex logic
 * 
 * 
 * @version 2.0.0
 * @since 2024-06-29
 */

import { atom } from 'jotai';
import type { ChatMessage, AgentConfig } from '@src/components/akash-agent/types';
import type { TemplateCreation } from '@src/types';

/**
 * Core Chat State Atoms
 * 
 * Primary atoms for managing chat conversation state, input handling,
 * and agent typing indicators.
 */
export const chatMessagesAtom = atom<ChatMessage[]>([]);
export const chatInputAtom = atom<string>('');
export const isAgentTypingAtom = atom<boolean>(false);
export const currentConversationAtom = atom<string | null>(null);

/**
 * SDL Generation State
 * 
 * Atoms for managing SDL (Service Definition Language) generation
 * and template creation state from agent interactions.
 */
export const generatedSDLAtom = atom<string | null>(null);
export const agentTemplateAtom = atom<TemplateCreation | null>(null);

/**
 * Modal and UI State
 * 
 * Atoms for managing modal visibility and agent connection status
 * for the chat interface.
 */
export const isAgentModalOpenAtom = atom<boolean>(false);
export const agentConnectionStatusAtom = atom<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');

/**
 * Agent Configuration
 * 
 * Configuration atom containing agent connection settings,
 * API endpoints, and timeout values.
 */
export const agentConfigAtom = atom<AgentConfig>({
  agent_id: process.env.NEXT_PUBLIC_AGENT_ID,
  base_url: process.env.NEXT_PUBLIC_AGENT_BASE_URL,
  timeout: 14400 // 4 hours default
});

/**
 * Derived Atoms
 * 
 * Computed atoms that derive state from other atoms to provide
 * complex logic and reduce component complexity.
 */
export const hasMessagesAtom = atom((get) => get(chatMessagesAtom).length > 0);

export const canSendMessageAtom = atom((get) => {
  const input = get(chatInputAtom);
  const isTyping = get(isAgentTypingAtom);
  const connectionStatus = get(agentConnectionStatusAtom);
  
  return (
    input.trim().length > 0 && 
    !isTyping && 
    connectionStatus === 'connected'
  );
});

export const lastAgentMessageAtom = atom((get) => {
  const messages = get(chatMessagesAtom);
  const agentMessages = messages.filter(m => m.type === 'agent');
  return agentMessages[agentMessages.length - 1] || null;
});

export const conversationSummaryAtom = atom((get) => {
  const messages = get(chatMessagesAtom);
  const userMessages = messages.filter(m => m.type === 'user');
  const agentMessages = messages.filter(m => m.type === 'agent');
  
  return {
    totalMessages: messages.length,
    userMessages: userMessages.length,
    agentMessages: agentMessages.length,
    hasSDL: messages.some(m => m.sdl),
    startTime: messages[0]?.timestamp || null,
    lastActivity: messages[messages.length - 1]?.timestamp || null
  };
});

/**
 * Action Atoms
 * 
 * Write-only atoms that provide actions for managing chat state,
 * including adding/updating messages and clearing conversations.
 */
export const addMessageAtom = atom(
  null,
  (get, set, message: ChatMessage) => {
    const currentMessages = get(chatMessagesAtom);
    set(chatMessagesAtom, [...currentMessages, message]);
  }
);

export const updateMessageAtom = atom(
  null,
  (get, set, messageId: string, updates: Partial<ChatMessage>) => {
    const currentMessages = get(chatMessagesAtom);
    const updatedMessages = currentMessages.map(msg =>
      msg.id === messageId ? { ...msg, ...updates } : msg
    );
    set(chatMessagesAtom, updatedMessages);
  }
);

export const clearChatAtom = atom(
  null,
  (get, set) => {
    set(chatMessagesAtom, []);
    set(chatInputAtom, '');
    set(isAgentTypingAtom, false);
    set(generatedSDLAtom, null);
    set(agentTemplateAtom, null);
    set(currentConversationAtom, null);
  }
);

export const setAgentTypingAtom = atom(
  null,
  (get, set, isTyping: boolean) => {
    set(isAgentTypingAtom, isTyping);
  }
);

/**
 * SDL Management Atoms
 * 
 * Actions for managing SDL generation state and template creation
 * when the agent generates deployment configurations.
 */
export const setGeneratedSDLAtom = atom(
  null,
  (get, set, sdl: string, template?: TemplateCreation) => {
    set(generatedSDLAtom, sdl);
    if (template) {
      set(agentTemplateAtom, template);
    }
  }
);

/**
 * Connection Management
 * 
 * Actions for managing agent connection status and handling
 * connection state changes.
 */
export const setConnectionStatusAtom = atom(
  null,
  (get, set, status: 'connected' | 'disconnected' | 'connecting' | 'error') => {
    set(agentConnectionStatusAtom, status);
  }
);

/**
 * Utility Atoms
 * 
 * Helper atoms providing computed values for conversation state,
 * welcome screen display logic, and performance optimizations.
 */
export const messageCountAtom = atom((get) => get(chatMessagesAtom).length);

export const isConversationActiveAtom = atom((get) => {
  const hasMessages = get(hasMessagesAtom);
  const isTyping = get(isAgentTypingAtom);
  return hasMessages || isTyping;
});

export const shouldShowWelcomeAtom = atom((get) => {
  const hasMessages = get(hasMessagesAtom);
  const isTyping = get(isAgentTypingAtom);
  return !hasMessages && !isTyping;
});

/**
 * Performance Optimization
 * 
 * Atom that limits visible messages to the last 100 for performance
 * in long conversations while maintaining full conversation history.
 */
export const visibleMessagesAtom = atom((get) => {
  const allMessages = get(chatMessagesAtom);
  const MAX_VISIBLE_MESSAGES = 100;
  
  // Keep last 100 messages for performance
  if (allMessages.length > MAX_VISIBLE_MESSAGES) {
    return allMessages.slice(-MAX_VISIBLE_MESSAGES);
  }
  
  return allMessages;
});