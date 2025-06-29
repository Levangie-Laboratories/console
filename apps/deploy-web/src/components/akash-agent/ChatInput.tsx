/**
 * @fileoverview Advanced chat input component with suggestion carousel and connection handling
 * 
 * Features:
 * - Auto-resizing textarea with character limits
 * - Horizontal scrollable suggestion carousel
 * - Connection status display with dismissible banner
 * - Keyboard shortcuts (Enter, Ctrl+Enter, Esc)
 * - Debug mode bypass for development
 * - Retry connection functionality
 * - Dynamic placeholder text based on connection state
 * 
 * 
 * @version 2.0.0
 * @since 2024-06-29
 */

"use client";
import React, { useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea, Button, Badge } from '@akashnetwork/ui/components';
import { Send, BusStop, Sparks } from 'iconoir-react';
import { cn } from '@akashnetwork/ui/utils';

import { useChatState } from './hooks/useChatState';
import type { ChatInputProps } from './types';

/**
 * Extended ChatInput props interface
 * Adds connection management and debug capabilities to base chat input
 */
interface ExtendedChatInputProps extends ChatInputProps {
  /** Current connection status to the Akash Agent */
  connectionStatus?: 'connected' | 'connecting' | 'disconnected' | 'error';
  /** Callback to retry connection when failed */
  onRetryConnection?: () => void;
  /** Debug mode to bypass connection requirements */
  debugMode?: boolean;
}

/**
 * ChatInput Component
 * 
 * Advanced chat input with suggestion carousel, connection status management,
 * and debug capabilities for the Akash AI Agent interface.
 * 
 * @param onStreamingMessage - Callback when user sends a message
 * @param disabled - Whether the input should be disabled
 * @param connectionStatus - Current agent connection status
 * @param onRetryConnection - Function to retry connection
 * @param debugMode - Whether debug mode is enabled (bypasses connection checks)
 * 
 * @features
 * - Auto-resizing textarea (44px min, 128px max)
 * - Character limit with warning (2000 max, 1800 warning)
 * - Horizontal suggestion carousel with 8+ deployment types
 * - Connection status banner with dismiss functionality
 * - Keyboard shortcuts: Enter (send), Ctrl+Enter (send), Esc (clear)
 * - Send/Stop button with loading states
 * - Retry connection button when disconnected
 * - Debug mode toggle for development
 * 
 * @example
 * ```tsx
 * <ChatInput 
 *   onStreamingMessage={handleMessage}
 *   connectionStatus="connected"
 *   onRetryConnection={retryFn}
 *   debugMode={false}
 * />
 * ```
 */
export const ChatInput: React.FC<ExtendedChatInputProps> = ({ 
  onStreamingMessage, 
  disabled = false,
  connectionStatus = 'connected',
  onRetryConnection,
  debugMode = false
}) => {
  const { 
    input, 
    setInput, 
    isAgentTyping, 
    canSend 
  } = useChatState();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSending, setIsSending] = React.useState(false);
  const [charCount, setCharCount] = React.useState(0);
  const [isStatusDismissed, setIsStatusDismissed] = React.useState(false);

  // Character limit
  const MAX_CHARS = 2000;
  const WARN_THRESHOLD = 1800;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`; // max-height 128px
    }
  }, [input]);

  // Update character count
  useEffect(() => {
    setCharCount(input.length);
  }, [input]);

  // Reset dismissed state when connection status changes
  useEffect(() => {
    setIsStatusDismissed(false);
  }, [connectionStatus]);

  // Enhanced keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
      return;
    }
    
    // Enter to send (if not disabled and not shift+enter)
    if (e.key === 'Enter' && !e.shiftKey && !disabled && !isAgentTyping) {
      e.preventDefault();
      handleSend();
      return;
    }

    // Escape to clear input
    if (e.key === 'Escape') {
      e.preventDefault();
      setInput('');
      return;
    }
  }, [disabled, isAgentTyping, setInput]);

  const handleSend = useCallback(async () => {
    // In debug mode, bypass connection requirement
    const canSendInDebug = debugMode && input.trim() && !isAgentTyping && !disabled;
    const canSendNormal = !debugMode && canSend && input.trim() && !disabled && !isAgentTyping && connectionStatus === 'connected';
    
    if (!canSendInDebug && !canSendNormal) {
      return;
    }
    
    const messageToSend = input.trim();
    
    // Check character limit
    if (messageToSend.length > MAX_CHARS) {
      return;
    }
    
    setInput(''); // Clear input immediately for better UX
    setIsSending(true);
    
    try {
      await onStreamingMessage(messageToSend);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setInput(messageToSend);
    } finally {
      setIsSending(false);
    }
  }, [canSend, input, disabled, isAgentTyping, connectionStatus, onStreamingMessage, setInput]);

  const handleStop = useCallback(() => {
    // TODO: Implement agent stop functionality via API
    console.log('Stop requested');
  }, []);

  // Input state logic
  const isInputDisabled = disabled || isAgentTyping || (!debugMode && connectionStatus !== 'connected');
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount > WARN_THRESHOLD;
  const canSendMessage = debugMode 
    ? input.trim() && !disabled && !isAgentTyping && !isOverLimit
    : canSend && input.trim() && !isInputDisabled && !isOverLimit;

  // Dynamic placeholder based on state
  const getPlaceholder = () => {
    if (connectionStatus === 'connecting') return "Connecting to Akash Agent...";
    if (connectionStatus === 'disconnected') return "Agent disconnected. Please check connection.";
    if (connectionStatus === 'error') return "Connection error. Please try again.";
    if (isAgentTyping) return "Agent is working on your request...";
    return "Describe your application or ask for deployment help...";
  };

  // Quick suggestion prompts for horizontal carousel
  const suggestions = [
    { title: "Deploy a web application", prompt: "I want to deploy a Next.js app with a PostgreSQL database" },
    { title: "Create an API service", prompt: "Help me deploy a RESTful API built with Node.js and Express" },
    { title: "Database deployment", prompt: "I need to deploy a PostgreSQL database with persistent storage" },
    { title: "AI/ML workload", prompt: "I need to deploy a machine learning model with GPU support" },
    { title: "Microservices stack", prompt: "Help me deploy a microservices architecture with multiple services" },
    { title: "Static website", prompt: "Deploy a static website with React and CDN" },
    { title: "WordPress site", prompt: "Set up a WordPress site with MySQL database" },
    { title: "Python API", prompt: "Deploy a Python FastAPI server with Redis caching" }
  ];

  return (
    <div className="bg-transparent">
      {/* Connection status banner */}
      <AnimatePresence>
        {connectionStatus !== 'connected' && !isStatusDismissed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b bg-muted/30 px-4 py-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  connectionStatus === 'connecting' && "bg-orange-500 animate-pulse",
                  connectionStatus === 'disconnected' && "bg-gray-500",
                  connectionStatus === 'error' && "bg-red-500 animate-pulse"
                )} />
                <span className="text-xs text-muted-foreground">
                  {connectionStatus === 'connecting' && "Connecting to Akash Agent..."}
                  {connectionStatus === 'disconnected' && "Agent disconnected"}
                  {connectionStatus === 'error' && "Connection error"}
                </span>
              </div>
              <button
                onClick={() => setIsStatusDismissed(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss status"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-4">
        {/* Horizontal suggestion carousel (only show when input is empty) */}
        <AnimatePresence>
          {!input.trim() && !isAgentTyping && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparks className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">Try asking me:</span>
              </div>
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion.title}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInput(suggestion.prompt)}
                      className={cn(
                        "flex-shrink-0 px-3 py-1.5 text-xs rounded-full transition-all duration-200",
                        "border border-border/50 hover:border-border",
                        "bg-background hover:bg-accent",
                        "text-foreground hover:text-accent-foreground",
                        isInputDisabled && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={isInputDisabled}
                    >
                      {suggestion.title}
                    </motion.button>
                  ))}
                </div>
                {/* Scroll gradient hints */}
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className={cn(
                "min-h-[44px] max-h-32 resize-none transition-all duration-200",
                "border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                isOverLimit && "border-destructive focus:border-destructive focus:ring-destructive/20"
              )}
              disabled={isInputDisabled}
              autoFocus
              maxLength={MAX_CHARS}
            />
            
            {/* Character count badge */}
            {charCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-2 right-2"
              >
                <Badge 
                  variant={isOverLimit ? "destructive" : isNearLimit ? "outline" : "secondary"}
                  className="text-xs h-5 px-1.5"
                >
                  {charCount}/{MAX_CHARS}
                </Badge>
              </motion.div>
            )}
          </div>
          
          {/* Send/Stop button */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {isAgentTyping ? (
                <motion.div
                  key="stop"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={handleStop}
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    variant="destructive"
                    aria-label="Stop agent processing"
                  >
                    <BusStop className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={handleSend}
                    disabled={!canSendMessage}
                    size="icon"
                    className={cn(
                      "h-11 w-11 shrink-0 transition-all duration-200",
                      canSendMessage && "hover:scale-105 active:scale-95"
                    )}
                    variant={canSendMessage ? "default" : "outline"}
                    aria-label="Send message"
                  >
                    {isSending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                      />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Helper text and status */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd> to send
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Shift + Enter</kbd> for new line
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Esc</kbd> to clear
            </span>
          </div>
          
          {/* Retry connection button when disconnected */}
          <div className="flex items-center gap-2">
            {connectionStatus !== 'connected' && (
              <button
                onClick={onRetryConnection}
                disabled={connectionStatus === 'connecting'}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Agent status message */}
        <AnimatePresence>
          {isAgentTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm"
              >
                🤖
              </motion.div>
              <span>Agent is analyzing your request and generating a solution...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};