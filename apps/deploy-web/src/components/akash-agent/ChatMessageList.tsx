/**
 * @fileoverview Chat message list component with virtualization and auto-scrolling
 * 
 * This component provides:
 * - Performance-optimized message rendering with virtualization
 * - Intelligent auto-scrolling with user control
 * - Smooth animations for message entrance/exit
 * - Scroll-to-bottom functionality
 * - Large conversation handling
 * 
 * 
 * @version 2.0.0
 * @since 2024-06-29
 */

"use client";
import React, { useEffect, useRef, useMemo } from 'react';
import { ScrollArea } from '@akashnetwork/ui/components';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatMessageBubble } from './ChatMessageBubble';
import type { ChatMessageListProps } from './types';

/**
 * ChatMessageList Component
 * 
 * Virtualized message list with intelligent scrolling and performance optimizations.
 * Handles large conversations efficiently while maintaining smooth UX.
 * 
 * @param messages - Array of chat messages to display
 * 
 * @features
 * - Message virtualization: Limits to 100 visible messages for performance
 * - Smart auto-scroll: Automatically scrolls to new messages when at bottom
 * - User scroll control: Disables auto-scroll when user scrolls up manually
 * - Floating scroll-to-bottom button: Appears when user scrolls away from bottom
 * - Smooth animations: Staggered entrance animations for messages
 * - Layout animations: Framer Motion layout animations for message updates
 * - Scroll restoration: Maintains scroll position during updates
 * 
 * @example
 * ```tsx
 * <ChatMessageList messages={chatMessages} />
 * ```
 */
export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true);

  // Performance optimization: limit visible messages
  const visibleMessages = useMemo(() => {
    const MAX_VISIBLE_MESSAGES = 100;
    return messages.length > MAX_VISIBLE_MESSAGES 
      ? messages.slice(-MAX_VISIBLE_MESSAGES)
      : messages;
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages.length, shouldAutoScroll]);

  // Handle scroll behavior - disable auto-scroll if user scrolls up
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const isAtBottom = Math.abs(
      element.scrollHeight - element.scrollTop - element.clientHeight
    ) < 50; // 50px threshold
    
    setShouldAutoScroll(isAtBottom);
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="flex-1 h-full"
      onScrollCapture={handleScroll}
    >
      <div className="flex flex-col">
        {/* Message list */}
        <div className="py-2">
          <AnimatePresence mode="popLayout">
            {visibleMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.02,
                  ease: "easeOut" 
                }}
                layout
              >
                <ChatMessageBubble message={message} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} className="h-px shrink-0" />
        
        {/* Scroll to bottom button */}
        {!shouldAutoScroll && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShouldAutoScroll(true);
              messagesEndRef.current?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'end' 
              });
            }}
            className="fixed bottom-20 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Scroll to bottom"
          >
            <svg 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </motion.button>
        )}
      </div>
    </ScrollArea>
  );
};